// src/components/issues/IssuesTable.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EyeIcon,
  PencilSquareIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const IssuesTable = ({ issues }) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const statusColors = {
    submitted: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    verified: 'bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300',
    acknowledged: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300',
    in_progress: 'bg-orange-100 text-orange-700 dark:bg-orange-800/30 dark:text-orange-300',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300',
    closed: 'bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300',
  };

  const priorityColors = {
    1: 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300',
    2: 'bg-orange-100 text-orange-700 dark:bg-orange-800/30 dark:text-orange-300',
    3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300',
    4: 'bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300',
    5: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
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

  const priorityLabels = {
    1: 'Critical',
    2: 'High',
    3: 'Medium',
    4: 'Low',
    5: 'Very Low',
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedIssues = issues
    .filter(issue => 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'priority') {
        // For priority, lower number = higher priority
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const SortableHeader = ({ field, children }) => (
    <th 
      className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ChevronUpDownIcon className={`w-4 h-4 ${sortField === field ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
      </div>
    </th>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Search and Filter Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <SortableHeader field="title">Issue</SortableHeader>
              <SortableHeader field="category">Category</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="priority">Priority</SortableHeader>
              <SortableHeader field="createdAt">Date</SortableHeader>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedIssues.map((issue) => (
              <tr key={issue._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      issue.priority === 1 ? 'bg-red-500' :
                      issue.priority === 2 ? 'bg-orange-500' :
                      issue.priority === 3 ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {issue.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {issue.category}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[issue.status]}`}>
                    {statusLabels[issue.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[issue.priority]}`}>
                    {priorityLabels[issue.priority]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/issues/${issue._id}`}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                    <button
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit Issue"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedIssues.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📋</div>
          <p className="text-gray-500 dark:text-gray-400">No issues found</p>
          {searchTerm && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Try adjusting your search terms
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default IssuesTable;