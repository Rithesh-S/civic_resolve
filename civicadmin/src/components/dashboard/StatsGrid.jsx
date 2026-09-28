// src/components/dashboard/StatsGrid.jsx
import React, { useState } from 'react';

const StatsGrid = ({ stats }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    neutral: '➡️',
    alert: '🚨'
  };

  // Mock function to simulate AI summarization
  const generateSummary = async () => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would call your AI summarization API
    const mockSummary = `Based on the data provided, here's a comprehensive summary of key metrics:
    - Overall performance shows a ${stats[0].trend === 'up' ? 'positive' : 'negative'} trend
    - ${stats[1].title} has increased by ${stats[1].change}
    - Recommend focusing on ${stats[2].title} for further improvement`;
    
    setSummary(mockSummary);
    setIsLoading(false);
  };

  const handleAudioRecord = () => {
    // This would integrate with a speech-to-text API in a real implementation
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate recording and transcription
      setTimeout(() => {
        setInputText(prev => prev + " I'd like a summary of the current performance metrics.");
        setIsRecording(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={index} className="relative p-6 bg-gradient-to-br rounded-2xl shadow-xs overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[stat.color]} opacity-90`}></div>
            
            {/* Animated circles decoration */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <span className="text-lg">{trendIcons[stat.trend]}</span>
              </div>
              
              <p className="text-sm font-medium text-white/90 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-white mb-2">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-white/70">
                {stat.change}
              </p>
            </div>
          </div>
        ))}
        
        {/* AI Summarizer Card */}
        <div className="relative p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-xs overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <span className="text-2xl">🤖</span>
              </div>
              <span className="text-lg">✨</span>
            </div>
            
            <p className="text-sm font-medium text-white/90 mb-1">
              AI Insights Summarizer
            </p>
            
            <div className="mt-4 space-y-3">
              <textarea
                className="w-full p-2 text-sm bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                rows="3"
                placeholder="Enter text or questions to summarize..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              
              <div className="flex justify-between items-center">
                <button
                  onClick={handleAudioRecord}
                  className={`flex items-center px-3 py-1 text-xs rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-600'} text-white`}
                >
                  {isRecording ? '● Recording...' : '🎤 Audio Input'}
                </button>
                
                <button
                  onClick={generateSummary}
                  disabled={isLoading || !inputText.trim()}
                  className={`px-3 py-1 text-xs rounded-full ${isLoading || !inputText.trim() ? 'bg-gray-600' : 'bg-blue-500'} text-white`}
                >
                  {isLoading ? 'Generating...' : 'Summarize'}
                </button>
              </div>
              
              {summary && (
                <div className="mt-3 p-3 bg-gray-800/70 rounded-lg">
                  <p className="text-xs text-white/90">{summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;