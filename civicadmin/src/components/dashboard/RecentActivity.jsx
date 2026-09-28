// src/components/dashboard/RecentActivity.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const RecentActivity = ({ issues }) => {
  // Get recent issues (last 7 days)
  const getRecentIssues = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return issues
      .filter(issue => new Date(issue.createdAt) > oneWeekAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  };

  const recentIssues = getRecentIssues();

  const statusColors = {
    submitted: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    verified: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    in_progress: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    closed: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
  };

  const statusLabels = {
    submitted: 'Submitted',
    verified: 'Verified',
    rejected: 'Rejected',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Roads': '🛣️',
      'Sanitation': '🧹',
      'Streetlight': '💡',
      'Water Leakage': '💧',
      'Parks': '🌳',
      'Other': '📌'
    };
    return icons[category] || '📌';
  };

  return (
    <div className="min-w-0 p-6 bg-white rounded-2xl shadow-xs dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
          Recent Activity
        </h4>
        <Link 
          to="/issues" 
          className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View all issues →
        </Link>
      </div>
      
      <div className="space-y-4">
        {recentIssues.map((issue) => (
          <div key={issue._id} className="flex items-start p-4 border border-gray-200 rounded-xl hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-700 transition-colors group">
            <div className="flex-shrink-0 mt-1 mr-4 text-xl">
              {getCategoryIcon(issue.category)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium text-gray-900 dark:text-white truncate">
                  {issue.title}
                </h5>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[issue.status]}`}>
                  {statusLabels[issue.status]}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {issue.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>Ward {issue.wardId} • {formatDate(issue.createdAt)}</span>
                <div className="flex items-center space-x-3">
                  <span className="hidden sm:inline">Priority: {issue.priority}</span>
                  <Link
                    to={`/issues/${issue._id}`}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {recentIssues.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📋</div>
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Issues from the last 7 days will appear here</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;