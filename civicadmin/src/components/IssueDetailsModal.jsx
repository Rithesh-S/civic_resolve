import React from 'react';
import { X } from 'lucide-react';

const IssueDetailsModal = ({ issue, onClose }) => {
  if (!issue) return null;

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Issue Details</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">{issue.title}</h2>
          <div className="flex items-center gap-4">
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getPriorityClass(issue.priority)}`}>
              PRIORITY {issue.priority}
            </span>
            <span className="px-2 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800">
              {issue.category.toUpperCase()}
            </span>
          </div>
          <p className="text-slate-600">{issue.description}</p>
          <div className="border-t pt-4">
            <p><strong className="text-slate-700">Status:</strong> <span className="capitalize text-slate-600">{issue.status.replace('_', ' ')}</span></p>
            <p><strong className="text-slate-700">Ward:</strong> <span className="text-slate-600">{issue.ward}</span></p>
            <p><strong className="text-slate-700">Assigned Officer:</strong> <span className="text-slate-600">{issue.assignedOfficer}</span></p>
            <p><strong className="text-slate-700">Upvotes:</strong> <span className="text-slate-600">{issue.upvotes}</span></p>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
           <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md text-sm font-semibold hover:bg-slate-300">
            Close
          </button>
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700">
            Take Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsModal;
