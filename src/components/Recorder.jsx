import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, AlertTriangle, HelpCircle } from 'lucide-react';

export default function Recorder({ onResult }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const backendUrl = 'http://127.0.0.1:8000/classify';
  // const backendUrl = 'https://ai-accent-backend.onrender.com/classify';

  // Convert WebM/audio blob to WAV
  const convertToWav = async (blob) => {
    return new Promise((resolve, reject) => {
      // Create audio context
      const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create file reader to read blob
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Decode audio data
          const arrayBuffer = e.target.result;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Create WAV file
          const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
          resolve(wavBlob);
        } catch (error) {
          console.error('Error converting audio:', error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };

      // Read blob as array buffer
      reader.readAsArrayBuffer(blob);
    });
  };

  // Helper function to convert AudioBuffer to WAV Blob
  const bufferToWave = (abuffer, len) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let sample;
    let offset = 0;
    let pos = 0;

    // Write WAV header
    // RIFF chunk descriptor
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length
    setUint32(0x45564157);                         // "WAVE"

    // FMT sub-chunk
    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2);                      // block align
    setUint16(16);                                 // bits per sample

    // Data sub-chunk
    setUint32(0x61746164);                         // "data" chunk
    setUint32(length - pos - 4);                   // chunk length

    // Write interleaved data
    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    // Helper to set uint values
    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  // Check microphone permissions on component mount
  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        // Try to get user media with more flexible constraints
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true 
        });
        
        // If successful, stop the tracks immediately
        stream.getTracks().forEach(track => track.stop());
        
        setMicrophoneAccess(true);
        setError(null);
      } catch (err) {
        console.error('Microphone access error:', err);
        setMicrophoneAccess(false);
        
        // Provide more specific error messages
        if (err.name === 'NotAllowedError') {
          setError('Microphone access blocked. Please check your browser settings and permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError(`Could not access microphone: ${err.message}`);
        }
      }
    };

    // Check microphone access when component mounts
    checkMicrophoneAccess();

    // Cleanup audio context if created
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const start = useCallback(async () => {
    // Reset previous states
    setError(null);

    try {
      // Reset audio chunks
      audioChunksRef.current = [];

      // Get user media with more flexible constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: { ideal: true },
          autoGainControl: { ideal: true },
          noiseSuppression: { ideal: true }
        }
      });

      // Store stream reference for cleanup
      streamRef.current = stream;

      // Try different MIME types for broader compatibility
      const mimeTypes = [
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
        'audio/mpeg'
      ];

      let supportedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          supportedMimeType = mimeType;
          break;
        }
      }

      // Create MediaRecorder with supported MIME type
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType || ''
      });

      // Event to collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Event when recording stops
      mediaRecorder.onstop = async () => {
        // Create blob from collected chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });

        // Only send if there's audio data
        if (audioBlob.size > 0) {
          try {
            // Convert to WAV
            const wavBlob = await convertToWav(audioBlob);

            const form = new FormData();
            form.append('file', wavBlob, 'audio.wav');

            const response = await fetch(backendUrl, {
              method: 'POST',
              body: form,
            });

            if (!response.ok) {
              // Try to get more details about the error
              const errorText = await response.text();
              throw new Error(`Network response was not ok: ${errorText}`);
            }

            const json = await response.json();
            onResult(json);
          } catch (error) {
            console.error('Error sending audio:', error);
            setError(error.message || 'Failed to send audio');
            onResult({ error: 'Failed to send audio' });
          }
        }

        // Stop all tracks to release media devices
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      // Start recording
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError(error.message || 'Could not access microphone');
    }
  }, [onResult]);

  const stop = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setRecording(false);
    }
  }, []);

  // Render help text for microphone issues
  const renderMicrophoneHelp = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 text-left">
      <div className="flex items-center mb-2">
        <HelpCircle className="mr-2 text-yellow-500" size={20} />
        <h3 className="font-semibold text-yellow-700">Microphone Troubleshooting</h3>
      </div>
      <ul className="list-disc list-inside text-sm text-yellow-800 space-y-2">
        <li>Ensure your microphone is connected and not muted</li>
        <li>Check browser permissions: 
          <span className="ml-1 bg-yellow-100 px-1 rounded">
            Settings &gt; Privacy &gt; Microphone
          </span>
        </li>
        <li>Refresh the page or try a different browser</li>
        <li>Restart your computer if issues persist</li>
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-gray-50 rounded-xl shadow-lg">
      <button 
        onClick={recording ? stop : start}
        disabled={!microphoneAccess}
        className={`
          flex items-center justify-center 
          w-24 h-24 rounded-full 
          transition-all duration-300 ease-in-out
          shadow-md hover:shadow-lg
          ${!microphoneAccess 
            ? 'bg-gray-400 cursor-not-allowed' 
            : recording 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }
        `}
      >
        {recording ? (
          <MicOff className="w-12 h-12" />
        ) : (
          <Mic className="w-12 h-12" />
        )}
      </button>
      
      {/* Recording status text */}
      <div className="text-center">
        <p className={`
          transition-all duration-300
          ${recording 
            ? 'text-red-600 font-semibold' 
            : 'text-gray-600'
          }
        `}>
          {recording ? 'Recording...' : 'Start Recording'}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm mt-2 text-center flex items-center justify-center">
          <AlertTriangle className="mr-2" size={16} />
          {error}
        </div>
      )}

      {/* Microphone help section */}
      {!microphoneAccess && renderMicrophoneHelp()}
    </div>
  );
}
