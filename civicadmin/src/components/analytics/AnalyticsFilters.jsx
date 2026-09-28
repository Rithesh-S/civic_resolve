// src/components/analytics/AnalyticsFilters.jsx
import React from 'react';

const AnalyticsFilters = ({ filters, onFilterChange }) => {
  const timeRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'year', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Roads', label: 'Roads' },
    { value: 'Sanitation', label: 'Sanitation' },
    { value: 'Streetlight', label: 'Streetlight' },
    { value: 'Water Leakage', label: 'Water Leakage' },
    { value: 'Parks', label: 'Parks' },
  ];

  const wardOptions = [
    { value: 'all', label: 'All Wards' },
    { value: 'ward1', label: 'Ward 1' },
    { value: 'ward2', label: 'Ward 2' },
    { value: 'ward3', label: 'Ward 3' },
    { value: 'ward4', label: 'Ward 4' },
    { value: 'ward5', label: 'Ward 5' },
  ];

  const handleFilterChange = (filterType, value) => {
    onFilterChange({ ...filters, [filterType]: value });
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow-xs dark:bg-gray-800 p-4">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Filter Analytics
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Range
          </label>
          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ward
          </label>
          <select
            value={filters.ward}
            onChange={(e) => handleFilterChange('ward', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {wardOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;