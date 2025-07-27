import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartBar, Trophy, Target, AlertTriangle } from 'lucide-react';
import 'chart.js/auto';
import { motion } from 'framer-motion';

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
    score = 0 ,
    message = ''
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
    <div 
      className="bg-white shadow-2xl rounded-3xl p-8 w-full animate-fade-in sm:pl-20 overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-indigo-700 flex items-center drop-shadow-sm">
          <ChartBar className="mr-2 text-blue-600" size={28} />
          Prediction Results
        </h2>
        {message && (
          <div className="text-sm text-gray-500 italic max-w-xs text-right">
            <h3 className="font-semibold text-indigo-400">AI Message:</h3>
            {message}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div 
          className="w-full"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="space-y-6">
          <div 
            className="bg-gradient-to-r from-blue-100 to-blue-50 p-5 rounded-2xl shadow-md border border-blue-200"
            whileHover={{ 
              scale: 0.7,
              transition: { duration: 0.2 }
            }}
            style={{ transformOrigin: 'center' }}
          >
            <div className="flex items-center mb-2">
              <Trophy className="mr-2 text-yellow-500" size={22} />
              <h3 className="font-semibold text-gray-700">Detected Accent</h3>
            </div>
            <p className="text-2xl font-extrabold text-blue-700 tracking-wide animate-pulse">{accent}</p>
          </div>

          <div 
            className="bg-gradient-to-r from-green-100 to-green-50 p-5 rounded-2xl shadow-md border border-green-200"
            whileHover={{ 
              scale: 0.7,
              transition: { duration: 0.2 }
            }}
            style={{ transformOrigin: 'center' }}
          >
            <div className="flex items-center mb-2">
              <Target className="mr-2 text-green-500" size={22} />
              <h3 className="font-semibold text-gray-700">Confidence</h3>
            </div>
            <p className="text-2xl font-extrabold text-green-700 tracking-wide">{(score * 100).toFixed(2)}%</p>
          </div>

          <div 
            className="bg-gradient-to-r from-gray-100 to-gray-50 p-5 rounded-2xl shadow-md border border-gray-200"
            whileHover={{ 
              scale: 0.7,
              transition: { duration: 0.2 }
            }}
            style={{ transformOrigin: 'center' }}
          >
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