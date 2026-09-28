// src/components/officers/OfficersTable.jsx
import React from 'react';

const OfficersTable = ({ officers, issues }) => {
  const getOfficerStats = (officerId) => {
    const assignedIssues = issues.filter(issue => issue.assignedOfficerId === officerId);
    const resolvedIssues = assignedIssues.filter(issue => 
      issue.status === 'resolved' || issue.status === 'closed'
    );
    
    return {
      assigned: assignedIssues.length,
      resolved: resolvedIssues.length,
      efficiency: assignedIssues.length > 0 
        ? Math.round((resolvedIssues.length / assignedIssues.length) * 100)
        : 0,
    };
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
  };

  if (officers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xs p-8 text-center">
        <div className="text-6xl mb-4">👮</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No officers found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full whitespace-no-wrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
              <th className="px-4 py-3">Officer</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3">Resolved</th>
              <th className="px-4 py-3">Efficiency</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {officers.map((officer) => {
              const stats = getOfficerStats(officer._id);
              const profile = officer.officerProfile || {};
              
              return (
                <tr key={officer._id} className="text-gray-700 dark:text-gray-400">
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm">
                      <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                        <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-800">
                          <span className="text-blue-600 dark:text-blue-200 text-sm">
                            {officer.fullName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">{officer.fullName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {profile.officerCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {profile.department || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {profile.roleTitle || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${
                      statusColors[profile.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                    }`}>
                      {profile.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {stats.assigned}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {stats.resolved}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stats.efficiency}%` }}
                        ></div>
                      </div>
                      <span>{stats.efficiency}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-4 text-sm">
                      <button className="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-blue-600 rounded-lg dark:text-blue-400 focus:outline-none focus:shadow-outline-gray">
                        Edit
                      </button>
                      <button className="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-red-600 rounded-lg dark:text-red-400 focus:outline-none focus:shadow-outline-gray">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfficersTable;