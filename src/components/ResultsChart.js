import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ResultsChart({ data }) {
  const labels = data.accents;
  const probs = data.probabilities;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Accent Probability',
        data: probs,
        backgroundColor: 'rgba(75,192,192,0.6)',
      }
    ]
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Prediction Results</h2>
      <Bar data={chartData} />
      <p><strong>Detected Accent:</strong> {data.accent}</p>
      <p><strong>Confidence Score:</strong> {data.score}</p>
    </div>
  );
}
