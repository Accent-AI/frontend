import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartBar, Trophy, Target, AlertTriangle } from 'lucide-react';
import 'chart.js/auto';

export default function ResultsChart({ data }) {
  // Log the entire data object for debugging
  useEffect(() => {
    console.log('Received results:', data);
  }, [data]);

  // Defensive checks for data
  if (!data) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 w-full flex items-center justify-center text-red-500">
        <AlertTriangle className="mr-2" size={24} />
        <p className="text-lg font-semibold">No classification results received</p>
      </div>
    );
  }

  // Validate data structure based on backend response
  const { 
    accent = 'Unknown', 
    probabilities = [], 
    accents = [], 
    score = 0 
  } = data;

  // Ensure accents and probabilities have the same length
  if (probabilities.length === 0 || accents.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 w-full flex items-center justify-center text-yellow-500">
        <AlertTriangle className="mr-2" size={24} />
        <p className="text-lg font-semibold">Incomplete classification data</p>
      </div>
    );
  }

  // Generate a color palette with distinct colors
  const colors = [
    'rgba(54, 162, 235, 0.7)',   // Blue
    'rgba(255, 99, 132, 0.7)',   // Red
    'rgba(75, 192, 192, 0.7)',   // Teal
    'rgba(255, 206, 86, 0.7)',   // Yellow
    'rgba(153, 102, 255, 0.7)',  // Purple
    'rgba(255, 159, 64, 0.7)'    // Orange
  ];

  const chartData = {
    labels: accents,
    datasets: [
      {
        label: 'Accent Probability',
        data: probabilities,
        backgroundColor: colors.slice(0, accents.length),
        borderColor: colors.slice(0, accents.length).map(color => color.replace('0.7)', '1)')),
        borderWidth: 1,
        borderRadius: 5,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Probability: ${(context.parsed.y * 100).toFixed(2)}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (value) => `${value * 100}%`
        }
      }
    }
  };

  // Find the most likely accent
  const maxProbIndex = probabilities.length > 0 
    ? probabilities.indexOf(Math.max(...probabilities)) 
    : -1;
  
  const mostLikelyAccent = maxProbIndex !== -1 
    ? accents[maxProbIndex] 
    : 'N/A';
  
  const confidence = maxProbIndex !== -1 
    ? (probabilities[maxProbIndex] * 100).toFixed(2) 
    : '0';

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <ChartBar className="mr-2 text-blue-600" size={24} />
          Prediction Results
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <Trophy className="mr-2 text-yellow-500" size={20} />
              <h3 className="font-semibold text-gray-700">Detected Accent</h3>
            </div>
            <p className="text-xl font-bold text-blue-700">{accent}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <Target className="mr-2 text-green-500" size={20} />
              <h3 className="font-semibold text-gray-700">Confidence</h3>
            </div>
            <p className="text-xl font-bold text-green-700">{(score * 100).toFixed(2)}%</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Accent Probabilities</h3>
            <ul className="space-y-1">
              {accents.map((accent, index) => (
                <li key={accent} className="flex justify-between">
                  <span>{accent}</span>
                  <span className="font-bold">{(probabilities[index] * 100).toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
