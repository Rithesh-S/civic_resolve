import React from 'react';
import { X, UserPlus } from 'lucide-react';

const AddOfficerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <UserPlus className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-800">Add New Officer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" id="fullName" placeholder="e.g., Arjun Kumar" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="officerCode" className="block text-sm font-medium text-slate-700">Officer Code</label>
              <input type="text" id="officerCode" placeholder="e.g., JE-CBE-007" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" id="email" placeholder="e.g., arjun.k@example.com" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input type="tel" id="phone" placeholder="e.g., +91 9876543210" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="col-span-2">
              <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department</label>
              <select id="department" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option>Public Works</option>
                <option>Sanitation</option>
                <option>Electrical</option>
                <option>Parks</option>
                <option>Water Management</option>
              </select>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 shadow-sm">
              Add Officer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOfficerModal;
