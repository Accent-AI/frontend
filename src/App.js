import React, { useState } from 'react';
import Recorder from './components/Recorder';
import ResultsChart from './components/ResultsChart';

function App() {
  const [results, setResults] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-blue-100 to-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-6 border border-white/30 transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-4xl font-extrabold text-center text-indigo-800 drop-shadow-sm leading-tight">
          🎙️ Accentify
        </h1>

        <div className="flex flex-col items-center space-y-6">
          <Recorder onResult={setResults} />
          {results && (
            <div className="w-full mt-6 animate-fade-in">
              <ResultsChart data={results} />
            </div>
          )}
        </div>

        {!results && (
          <p className="text-center text-gray-600 text-sm mt-4 leading-relaxed">
            Tap the mic below to start recording and discover your accent!
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
