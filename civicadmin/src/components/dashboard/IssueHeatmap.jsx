// src/components/dashboard/IssueHeatmap.jsx
import React from 'react';

const IssueHeatmap = ({ issues }) => {
  // Process issues data to create heatmap by ward and category
  const processHeatmapData = () => {
    const heatmapData = {};
    const categories = ['Roads', 'Sanitation', 'Streetlight', 'Water Leakage', 'Parks', 'Other'];
    
    issues.forEach(issue => {
      // Extract ward information - adjust based on your actual data structure
      const ward = issue.wardId || 'Unknown Ward';
      const category = issue.category || 'Other';
      
      if (!heatmapData[ward]) {
        heatmapData[ward] = {
          ward: ward,
          Roads: 0,
          Sanitation: 0,
          Streetlight: 0,
          'Water Leakage': 0,
          Parks: 0,
          Other: 0,
          total: 0
        };
      }
      
      if (categories.includes(category)) {
        heatmapData[ward][category] += 1;
      } else {
        heatmapData[ward]['Other'] += 1;
      }
      
      heatmapData[ward].total += 1;
    });
    
    return Object.values(heatmapData).sort((a, b) => b.total - a.total);
  };

  const heatmapData = processHeatmapData();
  const categories = ['Roads', 'Sanitation', 'Streetlight', 'Water Leakage', 'Parks', 'Other'];

  // Calculate max value for color intensity
  const maxCount = Math.max(...heatmapData.map(item => 
    Math.max(...categories.map(cat => item[cat]))
  ), 1); // Ensure at least 1 to avoid division by zero

  const getColorIntensity = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700 text-gray-400';
    const intensity = Math.min(9, Math.ceil((count / maxCount) * 9));
    return `bg-blue-${intensity}00 text-white dark:bg-blue-${10-intensity}00`;
  };

  return (
    <div className="min-w-0 p-6 bg-white rounded-2xl shadow-xs dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
          Issues by Ward & Category
        </h4>
        <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
          Export
        </button>
      </div>
      
      {heatmapData.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-semibold text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                  <th className="px-6 py-4">Ward</th>
                  {categories.map(category => (
                    <th key={category} className="px-4 py-4 text-center">{category}</th>
                  ))}
                  <th className="px-6 py-4 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {heatmapData.map((wardData, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {wardData.ward}
                    </td>
                    {categories.map(category => (
                      <td key={category} className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${getColorIntensity(wardData[category])}`}>
                          {wardData[category]}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {wardData.total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Intensity scale: 0 - {maxCount} issues</span>
            <span>{heatmapData.length} wards displayed</span>
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📊</div>
          <p className="text-gray-500 dark:text-gray-400">No data available for heatmap</p>
        </div>
      )}
    </div>
  );
};

export default IssueHeatmap;