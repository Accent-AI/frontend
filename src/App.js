import React, { useState } from 'react';
import Recorder from './components/Recorder';
import ResultsChart from './components/ResultsChart';

function App() {
  const [results, setResults] = useState(null);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Accent Detection App</h1>
      <Recorder onResult={setResults} />
      {results && <ResultsChart data={results} />}
    </div>
  );
}

export default App;
