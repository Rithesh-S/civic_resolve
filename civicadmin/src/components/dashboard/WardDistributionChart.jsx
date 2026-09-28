// src/components/dashboard/WardDistributionChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WardDistributionChart = ({ issues }) => {
  // Process data for chart
  const processChartData = () => {
    const wardCounts = {};
    
    issues.forEach(issue => {
      const ward = issue.wardId || 'Unknown';
      wardCounts[ward] = (wardCounts[ward] || 0) + 1;
    });
    
    // Sort by count and take top 10
    const sortedWards = Object.entries(wardCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    return {
      labels: sortedWards.map(([ward]) => `Ward ${ward}`),
      datasets: [
        {
          label: 'Number of Issues',
          data: sortedWards.map(([, count]) => count),
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderColor: 'rgb(79, 70, 229)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(79, 70, 229, 0.9)',
        }
      ]
    };
  };

  const chartData = processChartData();
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Wards by Issue Count',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="min-w-0 p-6 bg-white rounded-2xl shadow-xs dark:bg-gray-800">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        Ward Distribution
      </h4>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WardDistributionChart;