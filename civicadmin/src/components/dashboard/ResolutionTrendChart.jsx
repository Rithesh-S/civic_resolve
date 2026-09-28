// src/components/dashboard/ResolutionTrendChart.jsx
import React from 'react';

const ResolutionTrendChart = ({ issues, useDummyData }) => {
  // Generate resolution trend data (last 30 days)
  const generateTrendData = () => {
    const days = 30;
    const trendData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dateString = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      
      // For dummy data, create a realistic trend
      let resolvedCount = useDummyData 
        ? Math.floor(Math.random() * 8) + 2 
        : issues.filter(issue => 
            issue.status === 'resolved' && 
            new Date(issue.resolvedAt).toDateString() === date.toDateString()
          ).length;
          
      let createdCount = useDummyData
        ? Math.floor(Math.random() * 6) + 1
        : issues.filter(issue => 
            new Date(issue.createdAt).toDateString() === date.toDateString()
          ).length;
      
      trendData.push({
        date: dateString,
        resolved: resolvedCount,
        created: createdCount
      });
    }
    
    return trendData;
  };

  const trendData = generateTrendData();
  const maxValue = Math.max(...trendData.map(d => Math.max(d.resolved, d.created))) + 2;

  return (
    <div className="min-w-0 p-6 bg-white rounded-2xl shadow-xs dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
          Resolution Trend (30 days)
        </h4>
        <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
          View Report
        </button>
      </div>
      
      <div className="h-64">
        <div className="flex items-end justify-between h-48 gap-1 mt-4">
          {trendData.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-end justify-center w-full gap-1">
                <div 
                  className="w-full bg-green-400 rounded-t hover:bg-green-500 transition-colors dark:bg-green-600"
                  style={{ height: `${(day.resolved / maxValue) * 100}%` }}
                  title={`Resolved: ${day.resolved}`}
                ></div>
                <div 
                  className="w-full bg-blue-400 rounded-t hover:bg-blue-500 transition-colors dark:bg-blue-600"
                  style={{ height: `${(day.created / maxValue) * 100}%` }}
                  title={`Created: ${day.created}`}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                {day.date}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4 space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded mr-2 dark:bg-green-600"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Resolved</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded mr-2 dark:bg-blue-600"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Created</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionTrendChart;