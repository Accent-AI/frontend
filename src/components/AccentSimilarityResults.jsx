import React, { useState } from 'react';
import { Target, BarChart3, MessageSquare, List } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import 'chart.js/auto';

export default function AccentSimilarityResults({ data }) {
  const [activeTab, setActiveTab] = useState('top'); // 'top' or 'all'

  if (!data || data.error) {
    return (
      <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Target className="mr-2 text-red-500" size={20} />
          <h3 className="font-semibold text-red-700">Analysis Error</h3>
        </div>
        <p className="text-red-600 text-sm">
          {data?.error || 'Failed to analyze accent similarity'}
        </p>
      </div>
    );
  }

  const {
    target_accent,
    similarity_level,
    similarity_percentage,
    detected_accent,
    detected_confidence,
    top_3_accents = [],
    message,
    all_probabilities = null
  } = data;

  // Color coding based on similarity level
  const getSimilarityColor = (level) => {
    switch (level) {
      case 'Very High':
      case 'High':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Very Low':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Chart.js data for top 3 accents
  const chartData = {
    labels: top_3_accents.map((a) => a.accent),
    datasets: [
      {
        label: 'Probability',
        data: top_3_accents.map((a) => a.probability),
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)', // gold
          'rgba(201, 203, 207, 0.8)', // silver
          'rgba(255, 159, 64, 0.8)' // bronze
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(201, 203, 207, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(201, 203, 207, 1)',
          'rgba(255, 159, 64, 1)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
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
    },
    animation: {
      duration: 900,
      easing: 'easeOutQuart'
    }
  };

  // Tab buttons
  const tabButtons = [
    {
      key: 'top',
      label: 'Top Accents',
      icon: <BarChart3 className="mr-2" size={18} />
    },
    {
      key: 'all',
      label: 'All Probabilities',
      icon: <List className="mr-2" size={18} />
    }
  ];

  return (
    <div 
      className="w-full max-w-xl space-y-8 animate-fade-in"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Main Result Card */}
      <div 
        className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Target className="mr-2 text-purple-600" size={28} />
            <h3 className="text-2xl font-extrabold text-gray-800 drop-shadow-sm">
              Similarity Analysis
            </h3>
          </div>
          <div className={`px-4 py-1 rounded-full text-base font-semibold border ${getSimilarityColor(similarity_level)} shadow-sm`}> 
            {similarity_level}
          </div>
        </div>
        {/* Target Accent Result */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-medium text-gray-600">
              Similarity to {target_accent} accent:
            </span>
            <span className="text-2xl font-extrabold text-purple-600 animate-pulse">
              {similarity_percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${similarity_percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${similarity_percentage}%` }}
              transition={{ duration: 1 }}
            ></div>
          </div>
        </div>
        {/* Detected Accent */}
        <div 
          className="mb-6 p-4 bg-blue-50 rounded-2xl shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-600">
              Primary detected accent:
            </span>
            <span className="text-base font-semibold text-blue-700">
              {detected_accent}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Confidence: {(detected_confidence * 100).toFixed(1)}%
          </div>
        </div>
        {/* AI Message */}
        {message && (
          <div 
            className="p-4 bg-gray-50 rounded-2xl shadow-sm"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start">
              <MessageSquare className="mr-2 text-gray-500 mt-0.5" size={18} />
              <p className="text-base text-gray-700 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Tabs for Top Accents and All Probabilities */}
      {(top_3_accents.length > 0 || all_probabilities) && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100" whileHover={{ scale: 1.01 }}>
          <div className="flex mb-6 gap-4">
            {tabButtons.map((tab) => (
              <button
                key={tab.key}
                className={`flex items-center px-5 py-2 rounded-full font-semibold text-base transition-all duration-200 border-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:scale-105 ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                }`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          {activeTab === 'top' && top_3_accents.length > 0 && (
            <div className="w-full">
              <h4 className="font-semibold text-xl text-gray-800 mb-4 flex items-center">
                <BarChart3 className="mr-2 text-indigo-600" size={24} />Top Detected Accents
              </h4>
              <div className="w-full max-w-md mx-auto">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
          {activeTab === 'all' && all_probabilities && (
            <div className="w-full">
              <h4 className="font-semibold text-xl text-gray-800 mb-4 flex items-center">
                <List className="mr-2 text-indigo-600" size={24} />All Accent Probabilities
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(all_probabilities).map(([accent, probability]) => (
                  <div key={accent} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">{accent}</span>
                    <span className="text-gray-600">{(probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 