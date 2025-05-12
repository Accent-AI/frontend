import React, { useState, useRef } from 'react';
import AudioRecorder from 'audio-recorder-polyfill';

export default function Recorder({ onResult }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  const backendUrl = 'http://127.0.0.1:8000/classify'; // local backend URL
//   const backendUrl = 'http://127.0.0.1:8000/classify'; // backend URL

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new AudioRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stop = () => {
    const recorder = mediaRecorderRef.current;
    recorder.stop();
    recorder.ondataavailable = async e => {
      const blob = e.data;
      const form = new FormData();
      form.append('file', blob, 'audio.wav');
      const response = await fetch(backendUrl, {  // Change to your backend URL
        method: 'POST',
        body: form,
      });
      const json = await response.json();
      onResult(json);
    };
    setRecording(false);
  };

  return (
    <div>
      <button onClick={recording ? stop : start}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}
