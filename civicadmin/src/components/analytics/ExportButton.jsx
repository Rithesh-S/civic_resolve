// src/components/analytics/ExportButton.jsx
import React, { useState } from 'react';

const ExportButton = ({ data }) => {
  const [isLoading, setIsLoading] = useState(false);

  const exportToCSV = () => {
    setIsLoading(true);
    
    try {
      // Prepare CSV content
      let csvContent = "Civic Resolution Platform - Analytics Report\n\n";
      
      // Summary section
      csvContent += "SUMMARY\n";
      csvContent += `Total Issues,${data.totalIssues}\n`;
      csvContent += `Resolved Issues,${data.resolvedIssues}\n`;
      csvContent += `Average Resolution Time,${data.avgResolutionTime} days\n\n`;
      
      // Category distribution
      csvContent += "CATEGORY DISTRIBUTION\n";
      csvContent += "Category,Count\n";
      data.categoryData.forEach(item => {
        csvContent += `${item.name},${item.value}\n`;
      });
      csvContent += "\n";
      
      // Status distribution
      csvContent += "STATUS DISTRIBUTION\n";
      csvContent += "Status,Count\n";
      data.statusData.forEach(item => {
        csvContent += `${item.name},${item.value}\n`;
      });
      csvContent += "\n";
      
      // Officer performance
      if (data.performanceData && data.performanceData.length > 0) {
        csvContent += "OFFICER PERFORMANCE\n";
        csvContent += "Officer,Assigned,Resolved,Efficiency%\n";
        data.performanceData.forEach(item => {
          csvContent += `${item.name},${item.assigned},${item.resolved},${item.efficiency}\n`;
        });
        csvContent += "\n";
      }
      
      // Trends
      csvContent += "TRENDS OVER TIME\n";
      csvContent += "Date,Issue Count\n";
      data.trendsData.forEach(item => {
        csvContent += `${item.date},${item.count}\n`;
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Analytics report has been downloaded as CSV.');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to generate analytics report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToJSON = () => {
    setIsLoading(true);
    
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Analytics report has been downloaded as JSON.');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to generate analytics report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={exportToCSV}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Exporting...' : 'Export Report'}
      </button>
      
      {/* Dropdown menu for export options */}
      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
        <div className="py-1" role="menu" aria-orientation="vertical">
          <button
            onClick={exportToCSV}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            role="menuitem"
          >
            Export as CSV
          </button>
          <button
            onClick={exportToJSON}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            role="menuitem"
          >
            Export as JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportButton;