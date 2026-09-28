// src/components/issues/IssueTimeline.jsx
import React from 'react';

const IssueTimeline = ({ statusHistory }) => {
  const getUserName = (userId) => {
    if (userId === 'system') return 'System';
    // In a real app, you might fetch user data from an API
    return userId || 'Unknown User';
  };

  const statusIcons = {
    submitted: '📝',
    verified: '✅',
    rejected: '❌',
    acknowledged: '👁️',
    in_progress: '⚙️',
    resolved: '✅',
    closed: '🔒',
    flagged: '🔴'
  };

  const statusLabels = {
    submitted: 'Submitted',
    verified: 'Verified',
    rejected: 'Rejected',
    flagged: 'Flagged',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow-xs dark:bg-gray-800">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Status Timeline
        </h3>
      </div>
      
      <div className="px-6 py-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          <div className="space-y-4">
            {statusHistory.map((historyItem, index) => (
              <div key={index} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-3.5 top-1.5 w-2 h-2 bg-blue-500 rounded-full"></div>
                
                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{statusIcons[historyItem.status]}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {statusLabels[historyItem.status]}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(historyItem.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Updated by: <span className="font-medium">{getUserName(historyItem.updatedBy)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {statusHistory.length === 0 && (
          <p className="py-4 text-center text-gray-500 dark:text-gray-400">
            No status history available
          </p>
        )}
      </div>
    </div>
  );
};

export default IssueTimeline;