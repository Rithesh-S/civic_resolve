// src/components/analytics/AnalyticsCharts.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const AnalyticsCharts = ({ data, timeRange }) => {
  // Color palette for charts
  const COLORS = ['#2563EB', '#06B6D4', '#FACC15', '#10B981', '#8B5CF6', '#EF4444'];
  
  const categoryColors = {
    'Roads': '#2563EB',
    'Sanitation': '#06B6D4',
    'Streetlight': '#FACC15',
    'Water Leakage': '#10B981',
    'Parks': '#8B5CF6',
    'Other': '#EF4444'
  };

  const statusColors = {
    'submitted': '#9CA3AF',
    'verified': '#3B82F6',
    'rejected': '#EF4444',
    'acknowledged': '#F59E0B',
    'in_progress': '#F97316',
    'resolved': '#10B981',
    'closed': '#8B5CF6'
  };

  // Custom tooltip formatter
  const formatTooltip = (value, name, props) => {
    if (name === 'efficiency') {
      return [`${value}%`, 'Efficiency'];
    }
    if (name === 'days') {
      return [`${value} days`, 'Resolution Time'];
    }
    return [value, name];
  };

  return (
    <div className="space-y-8">
      {/* Category Distribution Chart */}
      <div className="bg-white rounded-lg shadow-xs dark:bg-gray-800 p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Issues by Category
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Bar dataKey="value" fill="#2563EB" name="Number of Issues">
                {data.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="bg-white rounded-lg shadow-xs dark:bg-gray-800 p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Issues by Status
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends Over Time Chart */}
      <div className="bg-white rounded-lg shadow-xs dark:bg-gray-800 p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Trends Over Time
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  if (timeRange === 'year') {
                    return value.split('-')[1]; // Show only month for yearly view
                  }
                  return value.split('-').slice(1).join('-'); // Show month-day for shorter ranges
                }}
              />
              <YAxis />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2563EB" 
                strokeWidth={2}
                name="Issues Reported"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Officer Performance Chart */}
      {data.performanceData.length > 0 && (
        <div className="bg-white rounded-lg shadow-xs dark:bg-gray-800 p-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Officer Performance
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Bar yAxisId="left" dataKey="assigned" fill="#06B6D4" name="Assigned" />
                <Bar yAxisId="left" dataKey="resolved" fill="#10B981" name="Resolved" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#FACC15" 
                  strokeWidth={2}
                  name="Efficiency %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Resolution Time Chart */}
      {data.resolutionData.length > 0 && (
        <div className="bg-white rounded-lg shadow-xs dark:bg-gray-800 p-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Resolution Times
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.resolutionData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} />
                <YAxis />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Bar dataKey="days" fill="#8B5CF6" name="Days to Resolve">
                  {data.resolutionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;