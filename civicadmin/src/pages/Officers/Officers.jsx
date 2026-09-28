// src/pages/Officers/Officers.jsx
import React, { useState, useEffect } from 'react';
import { getOfficers, getAllIssues } from '../../services/api';
import OfficersTable from '../../components/officers/OfficersTable';
import OfficerFilters from '../../components/officers/OfficerFilters';
import AddOfficerModal from '../../components/officers/AddOfficerModal';

const Officers = () => {
  const [officers, setOfficers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    search: '',
  });

  useEffect(() => {
    fetchOfficersData();
  }, []);

  const fetchOfficersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [officersData, issuesData] = await Promise.all([
        getOfficers(),
        getAllIssues()
      ]);
      
      setOfficers(officersData.officers);
      setFilteredOfficers(officersData.officers);
      setIssues(issuesData.issues);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch officers data');
      console.error('Error fetching officers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    let filtered = officers;
    
    // Apply department filter
    if (newFilters.department !== 'all') {
      filtered = filtered.filter(officer => 
        officer.officerProfile?.department === newFilters.department
      );
    }
    
    // Apply status filter
    if (newFilters.status !== 'all') {
      filtered = filtered.filter(officer => 
        officer.officerProfile?.status === newFilters.status
      );
    }
    
    // Apply search filter
    if (newFilters.search) {
      const searchTerm = newFilters.search.toLowerCase();
      filtered = filtered.filter(officer => 
        officer.fullName.toLowerCase().includes(searchTerm) ||
        officer.email.toLowerCase().includes(searchTerm) ||
        officer.officerProfile?.officerCode.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredOfficers(filtered);
  };

  const handleOfficerUpdate = (updatedOfficers) => {
    setOfficers(updatedOfficers);
    setFilteredOfficers(updatedOfficers);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">👮</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            Loading officers...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {error}
          </h2>
          <button 
            onClick={fetchOfficersData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'Public Works', label: 'Public Works' },
    { value: 'Sanitation', label: 'Sanitation' },
    { value: 'Horticulture', label: 'Horticulture' },
    { value: 'Electrical', label: 'Electrical' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on_leave', label: 'On Leave' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          Officer Management
        </h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
        >
          + Add Officer
        </button>
      </div>

      {/* Filters */}
      <OfficerFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        departmentOptions={departmentOptions}
        statusOptions={statusOptions}
      />
      
      {/* Officers Table */}
      <OfficersTable officers={filteredOfficers} issues={issues} />

      {/* Add Officer Modal */}
      <AddOfficerModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onOfficerUpdate={handleOfficerUpdate}
      />
    </div>
  );
};

export default Officers;