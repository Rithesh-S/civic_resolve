import React, { useState, useEffect } from "react";
import { getFlaggedIssues, reviewFlaggedIssue } from "../../services/api.js";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  SignalIcon,
  DocumentMagnifyingGlassIcon
} from "@heroicons/react/24/outline";

const FlaggedIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const BASE_URL = "http://10.92.162.88:5000";
  useEffect(() => {
    fetchFlaggedIssues();
  }, [pagination.page, filters]);

  const fetchFlaggedIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFlaggedIssues(pagination.page, pagination.limit, filters);
      setIssues(response.issues);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message || "Failed to fetch flagged issues");
      console.error("Error fetching flagged issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (issueId, action) => {
    try {
      await reviewFlaggedIssue(issueId, action);
      // Show a more elegant success message
      const message = `Issue ${action === "approve" ? "approved" : "rejected"} successfully`;
      
      // Create a temporary success indicator
      const updatedIssues = issues.map(issue => 
        issue._id === issueId 
          ? {...issue, recentlyProcessed: true, processAction: action}
          : issue
      );
      setIssues(updatedIssues);
      
      // Refresh the list after a short delay
      setTimeout(() => {
        fetchFlaggedIssues();
        // Close detail modal if open
        if (isDetailModalOpen) {
          setIsDetailModalOpen(false);
          setSelectedIssue(null);
        }
      }, 1500);
    } catch (err) {
      alert(err.message || `Failed to ${action} issue`);
      console.error(`Error ${action}ing issue:`, err);
    }
  };

  const openDetailModal = (issue) => {
    setSelectedIssue(issue);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedIssue(null);
    setIsDetailModalOpen(false);
  };

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({ ...filters, [filterType]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.7) return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (score >= 0.4) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
  };

  const getConfidenceLevel = (score) => {
    if (score >= 0.7) return "High";
    if (score >= 0.4) return "Medium";
    return "Low";
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return "Critical";
      case 2: return "High";
      case 3: return "Medium";
      case 4: return "Low";
      default: return "Unknown";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return "bg-red-500 text-white";
      case 2: return "bg-orange-500 text-white";
      case 3: return "bg-yellow-500 text-white";
      case 4: return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "flagged": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Streetlight", label: "Streetlight" },
    { value: "Roads", label: "Roads" },
    { value: "Sanitation", label: "Sanitation" },
    { value: "Water Leakage", label: "Water Leakage" },
    { value: "Parks", label: "Parks" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Date" },
    { value: "title", label: "Title" },
    { value: "category", label: "Category" },
    { value: "priority", label: "Priority" },
    { value: "confidence", label: "Confidence Score" },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6">
            <DocumentMagnifyingGlassIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Scanning Flagged Issues
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            We're carefully reviewing all flagged content for verification
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-6">
            <XCircleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {error}
          </h2>
          <button
            onClick={fetchFlaggedIssues}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Flagged Issues Review
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verify and take action on issues flagged by our verification system
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl px-4 py-3 shadow-lg">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
              {pagination.total} issue{pagination.total !== 1 ? "s" : ""} need{pagination.total === 1 ? "s" : ""} review
            </span>
          </div>
          
          <button
            onClick={fetchFlaggedIssues}
            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Refresh issues"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Flagged</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pagination.total}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {issues.filter(issue => issue.priority <= 2).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <SignalIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Confidence</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {issues.filter(issue => issue.verification.confidenceScore < 0.4).length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <DocumentMagnifyingGlassIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Page</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{issues.length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TagIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search flagged issues..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all duration-200"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 transition-all duration-200"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {(filters.search !== "" || filters.category !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {isFilterOpen && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort by
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 transition-all duration-200 ${
                      filters.sortOrder === 'desc' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
                    }`}
                    title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    <svg className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                      filters.sortOrder === 'desc' ? 'rotate-180' : ''
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Issues Grid */}
        <div className="p-6">
          {issues.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-6">
                <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No flagged issues found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filters.search || filters.category !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "All issues have been reviewed and processed"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((issue) => (
                  <div 
                    key={issue._id} 
                    className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                      issue.recentlyProcessed 
                        ? issue.processAction === 'approve' 
                          ? 'border-green-500 ring-2 ring-green-500/20' 
                          : 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {issue.title}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                              {getPriorityText(issue.priority)}
                            </span>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              {issue.category}
                            </span>
                          </div>
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {issue.description}
                      </p>

                      {/* Confidence Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Verification Confidence</span>
                          <span className={`px-2 py-1 rounded-full ${getConfidenceColor(issue.verification.confidenceScore)}`}>
                            {getConfidenceLevel(issue.verification.confidenceScore)} ({(issue.verification.confidenceScore * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                          <div 
                            className={`h-1.5 rounded-full ${
                              issue.verification.confidenceScore >= 0.7 ? 'bg-green-500' :
                              issue.verification.confidenceScore >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${issue.verification.confidenceScore * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 mr-1" />
                          <span className="truncate">{issue.reporterId?.fullName || "Unknown"}</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          <span>{formatDate(issue.createdAt)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openDetailModal(issue)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          <span className="text-sm">Details</span>
                        </button>
                        <button
                          onClick={() => handleReview(issue._id, "approve")}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          <span className="text-sm">Approve</span>
                        </button>
                        <button
                          onClick={() => handleReview(issue._id, "reject")}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                        >
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          <span className="text-sm">Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span> results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => changePage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      <button
                        onClick={() => changePage(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        Next
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Issue Detail Modal */}
      {isDetailModalOpen && selectedIssue && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Issue Details
                </h3>
                <button
                  onClick={closeDetailModal}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedIssue.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</h5>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIssue.category}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(selectedIssue.priority)}`}>
                        {getPriorityText(selectedIssue.priority)} (Level {selectedIssue.priority})
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reporter</h5>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIssue.reporterId?.fullName || "Unknown"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedIssue.reporterId?.phone || selectedIssue.reporterId?.email || "No contact"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Reported</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatDateTime(selectedIssue.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedIssue.media && selectedIssue.media.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Media Evidence</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {selectedIssue.media.map((media, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={`${BASE_URL}${media.url}`}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-48 object-contain"
                          onError={(e) => {
                            e.target.src = "/api/placeholder/192/192";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <DocumentMagnifyingGlassIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Verification Analysis
                  </h5>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedIssue.verification.confidenceScore >= 0.7 ? 'bg-green-500' :
                      selectedIssue.verification.confidenceScore >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getConfidenceLevel(selectedIssue.verification.confidenceScore)} Confidence
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                  {/* Overall Confidence Score */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Overall Confidence Score
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getConfidenceColor(selectedIssue.verification.confidenceScore)}`}>
                          {(selectedIssue.verification.confidenceScore * 100).toFixed(0)}%
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedIssue.verification.confidenceScore >= 0.7 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          selectedIssue.verification.confidenceScore >= 0.4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {getConfidenceLevel(selectedIssue.verification.confidenceScore)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-300 rounded-full h-3 dark:bg-gray-600 shadow-inner">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ease-out shadow-sm ${
                            selectedIssue.verification.confidenceScore >= 0.7 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            selectedIssue.verification.confidenceScore >= 0.4 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                            'bg-gradient-to-r from-red-400 to-red-500'
                          }`} 
                          style={{ width: `${selectedIssue.verification.confidenceScore * 100}%` }}
                        ></div>
                      </div>
                      {/* Progress markers */}
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                      </div>
                    </div>

                    {/* Confidence interpretation */}
                    <div className={`mt-3 p-3 rounded-xl text-sm ${
                      selectedIssue.verification.confidenceScore >= 0.7 ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' :
                      selectedIssue.verification.confidenceScore >= 0.4 ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' :
                      'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {selectedIssue.verification.confidenceScore >= 0.7 ? (
                          <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        ) : selectedIssue.verification.confidenceScore >= 0.4 ? (
                          <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">
                            {selectedIssue.verification.confidenceScore >= 0.7 ? 'Likely Authentic' :
                             selectedIssue.verification.confidenceScore >= 0.4 ? 'Requires Review' :
                             'Potentially Suspicious'}
                          </p>
                          <p className="text-xs mt-1 opacity-90">
                            {selectedIssue.verification.confidenceScore >= 0.7 ? 'This issue appears genuine based on our verification checks.' :
                             selectedIssue.verification.confidenceScore >= 0.4 ? 'Manual review recommended due to mixed verification signals.' :
                             'Multiple verification flags detected - proceed with caution.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Checks Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* EXIF Analysis */}
                    {selectedIssue.verification.checks.exif && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h6 className="font-semibold text-gray-800 dark:text-gray-200">EXIF Analysis</h6>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedIssue.verification.checks.exif.reasons.length === 0 ? 
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {selectedIssue.verification.checks.exif.reasons.length === 0 ? 'Clean' : 
                             `${selectedIssue.verification.checks.exif.reasons.length} Flag${selectedIssue.verification.checks.exif.reasons.length > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        
                        {selectedIssue.verification.checks.exif.reasons.length > 0 ? (
                          <ul className="space-y-2">
                            {selectedIssue.verification.checks.exif.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-start text-sm">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-gray-600 dark:text-gray-400">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No suspicious EXIF data detected
                          </p>
                        )}
                      </div>
                    )}

                    {/* AI Detection */}
                    {selectedIssue.verification.checks.aiGenerated && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h6 className="font-semibold text-gray-800 dark:text-gray-200">AI Detection</h6>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedIssue.verification.checks.aiGenerated.confidence < 0.3 ? 
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            selectedIssue.verification.checks.aiGenerated.confidence < 0.7 ?
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {(selectedIssue.verification.checks.aiGenerated.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">AI Generation Confidence:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {(selectedIssue.verification.checks.aiGenerated.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                selectedIssue.verification.checks.aiGenerated.confidence < 0.3 ? 'bg-green-500' :
                                selectedIssue.verification.checks.aiGenerated.confidence < 0.7 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} 
                              style={{ width: `${selectedIssue.verification.checks.aiGenerated.confidence * 100}%` }}
                            ></div>
                          </div>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {selectedIssue.verification.checks.aiGenerated.confidence < 0.3 ? 
                             'Low probability of AI generation' :
                             selectedIssue.verification.checks.aiGenerated.confidence < 0.7 ?
                             'Moderate AI generation indicators detected' :
                             'High probability of AI-generated content'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Additional checks can be added here */}
                    {/* Placeholder for future verification checks */}
                    {/* <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm opacity-50">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <h6 className="font-semibold text-gray-500 dark:text-gray-400">Location Verification</h6>
                      </div>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Coming soon - GPS and location authenticity checks
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm opacity-50">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <h6 className="font-semibold text-gray-500 dark:text-gray-400">Reporter History</h6>
                      </div>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Coming soon - Reporter credibility analysis
                      </p>
                    </div> */}
                  </div>

                  {/* Summary/Recommendation */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h6 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                          Verification Summary
                        </h6>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          {selectedIssue.verification.confidenceScore >= 0.7 ? 
                           'Based on our analysis, this issue appears to be authentic and should likely be approved for processing.' :
                           selectedIssue.verification.confidenceScore >= 0.4 ?
                           'Mixed verification signals detected. Manual review is recommended before making a decision.' :
                           'Multiple red flags detected. Consider rejecting this issue or requesting additional verification from the reporter.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleReview(selectedIssue._id, "reject")}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                >
                  Reject Issue
                </button>
                <button
                  onClick={() => handleReview(selectedIssue._id, "approve")}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Approve Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlaggedIssues;