import React, { useState } from 'react';
import { ChevronDown, Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const IssuesTable = ({ issues, title }) => {
  const [filters, setFilters] = useState({ status: 'all', priority: 'all' });
  const [searchTerm, setSearchTerm] = useState('');

  const getPriorityClass = (priority) => {
    if (priority === 1) return 'bg-red-100 text-red-800 border-red-200';
    if (priority === 2) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (priority === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getStatusClass = (status) => {
    if (status === 'resolved') return 'bg-green-100 text-green-800';
    if (status === 'in_progress') return 'bg-blue-100 text-blue-800';
    if (status === 'verification_pending') return 'bg-purple-100 text-purple-800';
    return 'bg-slate-100 text-slate-800';
  };

  const filteredIssues = issues
    .filter(issue => 
      (filters.status === 'all' || issue.status === filters.status) &&
      (filters.priority === 'all' || issue.priority.toString() === filters.priority)
    )
    .filter(issue => 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">{title}</h3>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Search by title or ID..." 
          className="flex-grow p-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="p-2 border rounded-md"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="all">All Statuses</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="verification_pending">Pending Verification</option>
        </select>
        <select 
          className="p-2 border rounded-md"
          value={filters.priority}
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
        >
          <option value="all">All Priorities</option>
          <option value="1">Priority 1</option>
          <option value="2">Priority 2</option>
          <option value="3">Priority 3</option>
          <option value="4">Priority 4</option>
        </select>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issue ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredIssues.map(issue => (
              <tr key={issue._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{issue._id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{issue.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(issue.status)}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityClass(issue.priority)}`}>
                    Priority {issue.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{issue.assignedOfficer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {issue.status === 'verification_pending' ? (
                     <div className="flex items-center gap-2">
                      <button className="text-green-600 hover:text-green-900" title="Approve Issue"><CheckCircle size={18} /></button>
                      <button className="text-red-600 hover:text-red-900" title="Reject Issue"><AlertTriangle size={18} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button className="text-indigo-600 hover:text-indigo-900" title="Edit Issue"><Edit size={18} /></button>
                      <button className="text-slate-500 hover:text-slate-700" title="Delete Issue"><Trash2 size={18} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssuesTable;
