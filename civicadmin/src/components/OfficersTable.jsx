import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const OfficersTable = ({ officers }) => {
  const getStatusClass = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'on_leave') return 'bg-yellow-100 text-yellow-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Officer</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Performance</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {officers.map((officer) => (
            <tr key={officer.id} className="hover:bg-slate-50 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900">{officer.fullName}</div>
                <div className="text-xs text-slate-500">{officer.officerCode} | {officer.department}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">{officer.email}</div>
                <div className="text-xs text-slate-500">{officer.phone}</div>
              </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                 <div>SLA: <span className="font-semibold text-indigo-600">{officer.slaAdherence}</span></div>
                 <div className="text-xs">Tasks: <span className="font-semibold">{officer.tasksAssigned}</span></div>
               </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(officer.status)}`}>
                  {officer.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-4">
                  <button className="text-indigo-600 hover:text-indigo-900" title="Edit Officer"><Edit size={18} /></button>
                  <button className="text-slate-500 hover:text-slate-700" title="Delete Officer"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OfficersTable;
