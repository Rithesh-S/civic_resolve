import React from 'react';
import { format } from 'date-fns';

export const StockTable = ({ items }) => (
  <div className="overflow-x-auto bg-white rounded-lg shadow">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Name</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Stock</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Cost</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {items.map((item) => (
          <tr key={item._id}>
            <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
            <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{`${item.availableCount} ${item.unit}`}</td>
            <td className="px-6 py-4 text-sm text-slate-600">₹{item.unitCost.toLocaleString('en-IN')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const LogsTable = ({ logs }) => {
  const getStatusClass = (status) => {
    if (status === 'approved') return 'text-green-700';
    if (status === 'rejected') return 'text-red-700';
    return 'text-slate-600';
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Details</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {logs.map((log) => (
            <tr key={log._id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-slate-900">{log.issueTitle}</div>
                <div className="text-xs text-slate-500">By: {log.officerName}</div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {log.items.map(item => `${item.quantity} x ${item.name}`).join(', ')}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-900">Reviewed by: {log.reviewedBy}</div>
                <div className="text-xs text-slate-500">{format(new Date(log.reviewedAt), 'PPp')}</div>
              </td>
               <td className="px-6 py-4 text-sm font-semibold">
                <span className={getStatusClass(log.status)}>
                  {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
