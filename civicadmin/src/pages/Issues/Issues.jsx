// src/pages/Issues/Issues.jsx
import React, { useState, useEffect } from 'react';
import IssuesTable from '../../components/issues/IssuesTable';
import IssueFilters from '../../components/issues/IssueFilters';
import { getAllIssues } from '../../services/api';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const issuesData = await getAllIssues();
      
      // The API returns { issues: [], pagination: {} }
      setIssues(issuesData.issues || []);
      setFilteredIssues(issuesData.issues || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    let filtered = issues;
    
    // Apply status filter
    if (newFilters.status !== 'all') {
      filtered = filtered.filter(issue => issue.status === newFilters.status);
    }
    
    // Apply category filter
    if (newFilters.category !== 'all') {
      filtered = filtered.filter(issue => issue.category === newFilters.category);
    }
    
    // Apply priority filter
    if (newFilters.priority !== 'all') {
      filtered = filtered.filter(issue => issue.priority.toString() === newFilters.priority);
    }
    
    // Apply search filter
    if (newFilters.search) {
      const searchTerm = newFilters.search.toLowerCase();
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm) ||
        issue.description.toLowerCase().includes(searchTerm) ||
        (issue.reporterId?.fullName && issue.reporterId.fullName.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredIssues(filtered);
  };

  const refreshIssues = async () => {
    await fetchIssues();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading issues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={fetchIssues}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          Issues Management
        </h2>
        <div className="flex space-x-3">
          <button 
            onClick={refreshIssues}
            className="px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition-colors duration-150 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:shadow-outline-gray"
          >
            Refresh
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue">
            + New Issue
          </button>
        </div>
      </div>

      {/* Filters */}
      <IssueFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        issuesCount={filteredIssues.length}
        totalIssuesCount={issues.length}
      />
      
      {/* Issues Table */}
      <IssuesTable issues={filteredIssues} onRefresh={refreshIssues} />
    </div>
  );
};

export default Issues;