import React, { useState, useEffect } from 'react';
import { getPendingApprovals, approveExpense, rejectExpense } from '../../services/api';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ExpenseApprovals = () => {
  const [expenseRequests, setExpenseRequests] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectionReason, setRejectionReason] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalExpenses: 0,
    totalExtensions: 0,
    pages: 1
  });

  useEffect(() => {
    fetchPendingApprovals();
  }, [pagination.page]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const data = await getPendingApprovals(pagination.page, pagination.limit);
      
      setExpenseRequests(data.expenseRequests || []);
      setExtensionRequests(data.extensionRequests || []);
      setPagination(prev => ({
        ...prev,
        totalExpenses: data.pagination.totalExpenses,
        totalExtensions: data.pagination.totalExtensions,
        pages: data.pagination.pages
      }));
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      alert('Failed to fetch pending approvals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExpense = async (expenseId) => {
    setActionLoading(prev => ({ ...prev, [expenseId]: true }));
    try {
      await approveExpense(expenseId);
      alert('Expense approved successfully');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('Failed to approve expense: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [expenseId]: false }));
    }
  };

  const handleRejectExpense = async (expenseId) => {
    if (!rejectionReason[expenseId]?.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(prev => ({ ...prev, [expenseId]: true }));
    try {
      await rejectExpense(expenseId, rejectionReason[expenseId]);
      alert('Expense rejected successfully');
      setShowRejectModal(null);
      setRejectionReason(prev => ({ ...prev, [expenseId]: '' }));
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error rejecting expense:', error);
      alert('Failed to reject expense: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [expenseId]: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'expenses'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Expense Requests
              {expenseRequests.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                  {expenseRequests.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('extensions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'extensions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Extension Requests
              {extensionRequests.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                  {extensionRequests.length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Expense Requests Tab */}
      {activeTab === 'expenses' && (
        <>
          {expenseRequests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">💰</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Pending Expense Requests
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                All expense requests have been reviewed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenseRequests.map((request) => {
                const isLoading = actionLoading[request._id];
                const totalCost = request.items.reduce((sum, item) => sum + item.totalCost, 0);

                return (
                  <div key={request._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                            <DocumentTextIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              Expense Request #{request._id.slice(-6).toUpperCase()}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div>
                                <span className="font-medium">Officer:</span> {request.officerId.fullName}
                              </div>
                              <div>
                                <span className="font-medium">Request Date:</span> {formatDate(request.requestedAt)}
                              </div>
                              <div>
                                <span className="font-medium">Issue:</span> {request.issueId.title}
                              </div>
                              <div>
                                <span className="font-medium">Total Value:</span>{' '}
                                <span className="text-green-600 dark:text-green-400 font-semibold">
                                  {formatCurrency(totalCost)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          {request.status}
                        </span>
                      </div>
                      
                      {/* Items List */}
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Requested Items:
                        </h4>
                        <div className="space-y-3">
                          {request.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                  <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                                    {item.quantity}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.name}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatCurrency(item.unitCost)} each
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                  {formatCurrency(item.totalCost)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Approve Button */}
                        <button
                          onClick={() => handleApproveExpense(request._id)}
                          disabled={isLoading}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          {isLoading ? 'Processing...' : 'Approve Expense'}
                        </button>
                        
                        {/* Reject Button */}
                        <button
                          onClick={() => setShowRejectModal(request._id)}
                          disabled={isLoading}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <XCircleIcon className="w-5 h-5 mr-2" />
                          {isLoading ? 'Processing...' : 'Reject Expense'}
                        </button>
                      </div>
                    </div>

                    {/* Rejection Modal */}
                    {showRejectModal === request._id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Reject Expense Request
                          </h3>
                          <textarea
                            placeholder="Please provide a reason for rejecting this expense request..."
                            value={rejectionReason[request._id] || ''}
                            onChange={(e) => setRejectionReason(prev => ({
                              ...prev,
                              [request._id]: e.target.value
                            }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            rows="4"
                          />
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              onClick={() => {
                                setShowRejectModal(null);
                                setRejectionReason(prev => ({ ...prev, [request._id]: '' }));
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRejectExpense(request._id)}
                              disabled={!rejectionReason[request._id]?.trim() || isLoading}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <XCircleIcon className="w-5 h-5 mr-2" />
                              {isLoading ? 'Processing...' : 'Reject Expense'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Extension Requests Tab */}
      {activeTab === 'extensions' && (
        <>
          {extensionRequests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">⏰</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Pending Extension Requests
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                All extension requests have been reviewed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {extensionRequests.map((request) => (
                <div key={request._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
                          <ClockIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Extension Request #{request._id.slice(-6).toUpperCase()}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-medium">Officer:</span> {request.officerId.fullName}
                            </div>
                            <div>
                              <span className="font-medium">Request Date:</span> {formatDate(request.createdAt)}
                            </div>
                            <div>
                              <span className="font-medium">Issue:</span> {request.issueId.title}
                            </div>
                            <div>
                              <span className="font-medium">Extend Until:</span> {formatDate(request.requestedUntil)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reason for Extension:
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100">{request.reason}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Approve Extension
                      </button>
                      <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors">
                        <XCircleIcon className="w-5 h-5 mr-2" />
                        Reject Extension
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing page {pagination.page} of {pagination.pages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              {pagination.page}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseApprovals;