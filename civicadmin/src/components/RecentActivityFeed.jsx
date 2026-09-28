import React from 'react';
import { Clock } from 'lucide-react';

const RecentActivityFeed = ({ issues }) => {
  // Sort issues by date to get the most recent ones
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5); // Get top 5

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {recentIssues.map(issue => (
          <div key={issue._id} className="flex items-start">
            <div className="flex-shrink-0">
              <span className={`w-3 h-3 mt-1.5 rounded-full block ${issue.priority === 1 ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">{issue.title}</p>
              <p className="text-xs text-slate-500 flex items-center">
                <Clock size={12} className="mr-1"/> 
                {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })} in {issue.ward}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityFeed;
