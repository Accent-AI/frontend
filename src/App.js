import React, { useState } from 'react';
import Recorder from './components/Recorder';
import AccentPredictor from './components/AccentPredictor';
import ResultsChart from './components/ResultsChart';
import AccentSimilarityResults from './components/AccentSimilarityResults';
import { motion } from 'framer-motion';
import { Mic, BarChart3 } from 'lucide-react';

function App() {
  const [results, setResults] = useState(null);
  const [similarityResults, setSimilarityResults] = useState(null);
  const [activeTab, setActiveTab] = useState('classify'); // 'classify' or 'compare'

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Animated background shapes */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-400 via-purple-300 to-blue-200 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-pink-300 via-yellow-200 to-indigo-200 rounded-full blur-2xl opacity-30 animate-pulse delay-2000" />
      </motion.div>
      {/* Main card */}
      <motion.div
        className="relative z-10 bg-white/90 backdrop-blur-2xl shadow-2xl rounded-3xl p-10 w-full max-w-2xl space-y-8 border border-white/40 transition-all duration-300 hover:scale-[1.01]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-5xl font-extrabold text-center text-indigo-800 drop-shadow-md leading-tight mb-2 tracking-tight"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block animate-fade-in">🎙️ Accentify</span>
        </motion.h1>
        <p className="text-lg text-indigo-500 font-medium mb-4 animate-fade-in">
          Discover and compare your accent with AI-powered analysis
        </p>
        {/* Tab Navigation */}
        <div className="flex bg-gradient-to-r from-indigo-100 via-white to-purple-100 rounded-xl p-2 shadow-inner mb-4 gap-2">
          <button
            onClick={() => {
              setActiveTab('classify');
              setResults(null);
              setSimilarityResults(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:z-10 shadow-md hover:scale-105 ${
              activeTab === 'classify'
                ? 'bg-indigo-600 text-white scale-105'
                : 'bg-white text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <Mic size={20} /> Predict Accent
          </button>
          <button
            onClick={() => {
              setActiveTab('compare');
              setResults(null);
              setSimilarityResults(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:z-10 shadow-md hover:scale-105 ${
              activeTab === 'compare'
                ? 'bg-purple-600 text-white scale-105'
                : 'bg-white text-purple-700 hover:bg-purple-50'
            }`}
          >
            <BarChart3 size={20} /> Compare Accent
          </button>
        </div>
        {/* Main content area */}
        <div className="flex flex-col items-center space-y-8 min-h-[300px]">
          {activeTab === 'classify' ? (
            <>
              <Recorder onResult={setResults} />
              {results && (
                <motion.div className="w-full mt-8 animate-fade-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <ResultsChart data={results} />
                </motion.div>
              )}
            </>
          ) : (
            <>
              <AccentPredictor onResult={setSimilarityResults} />
              {similarityResults && (
                <motion.div className="w-full mt-8 animate-fade-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <AccentSimilarityResults data={similarityResults} />
                </motion.div>
              )}
            </>
          )}
        </div>
        {/* Helper text */}
        {!results && !similarityResults && (
          <motion.p
            className="text-center text-gray-600 text-base mt-6 leading-relaxed animate-fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {activeTab === 'classify' 
              ? 'Tap the mic below to start recording and discover your accent!'
              : 'Select a target accent and record to compare your speech patterns!'}
          </motion.p>
        )}
      </motion.div>
      {/* Footer */}
      <footer className="relative z-10 mt-8 text-center text-xs text-gray-400">
        <span className="inline-block bg-white/70 px-4 py-2 rounded-full shadow border border-gray-100">
          &copy; {new Date().getFullYear()} Accentify &mdash; Built with <span className="text-indigo-500">AI</span> & <span className="text-purple-500">Tech</span>
        </span>
      </footer>
    </div>
  );
}

export default App;
