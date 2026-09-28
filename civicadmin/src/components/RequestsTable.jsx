import React from 'react';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

const RequestsTable = ({ requests, onApprove, onReject }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <PackageCheck size={48} className="mx-auto text-slate-400" />
        <h3 className="mt-2 text-lg font-medium text-slate-900">All Clear!</h3>
        <p className="mt-1 text-sm text-slate-500">There are no pending inventory requests.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Request Details</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Officer</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {requests.map((req) => (
            <tr key={req._id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-slate-900">{req.issueTitle}</div>
                <div className="text-xs text-slate-500">ID: {req.issueId}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-900">{req.officerName}</div>
                <div className="text-xs text-slate-500">{format(new Date(req.requestedAt), 'PPp')}</div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {req.items.map(item => `${item.quantity} x ${item.name}`).join(', ')}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => onApprove(req._id)} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors" title="Approve">
                    <Check size={16} />
                  </button>
                  <button onClick={() => onReject(req._id)} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors" title="Reject">
                    <X size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;
