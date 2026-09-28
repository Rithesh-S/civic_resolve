// src/components/dashboard/PriorityIssues.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PriorityIssues = ({ issues }) => {
  // Get high priority issues (priority 1-2)
  const getPriorityIssues = () => {
    return issues
      .filter(issue => issue.priority <= 2)
      .sort((a, b) => a.priority - b.priority || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  const priorityIssues = getPriorityIssues();

  const priorityColors = {
    1: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    2: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    4: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };

  const priorityLabels = {
    1: 'Critical',
    2: 'High',
    3: 'Medium',
    4: 'Low',
  };

  const statusColors = {
    submitted: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    verified: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    in_progress: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    closed: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Calculate days until SLA due date
  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
          High Priority Issues
        </h4>
        <Link 
          to="/issues?priority=1,2" 
          className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View all →
        </Link>
      </div>
      
      {priorityIssues.length > 0 ? (
        <div className="space-y-4">
          {priorityIssues.map((issue) => {
            const daysUntilDue = getDaysUntilDue(issue.slaDueDate);
            const isUrgent = daysUntilDue <= 3;
            
            return (
              <div key={issue._id} className="p-4 border rounded-xl dark:border-gray-700 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{getCategoryIcon(issue.category)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[issue.priority]}`}>
                      {priorityLabels[issue.priority]}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isUrgent 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {isUrgent ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}` : `Due: ${formatDate(issue.slaDueDate)}`}
                  </span>
                </div>
                
                <h5 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
                  {issue.title}
                </h5>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {issue.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[issue.status] || 'bg-gray-100 text-gray-800'}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  
                  <Link
                    to={`/issues/${issue._id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center"
                  >
                    View Details
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">✅</div>
          <p className="text-gray-500 dark:text-gray-400">No high priority issues</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">All issues are currently under control</p>
        </div>
      )}
    </div>
  );
};

export default PriorityIssues;