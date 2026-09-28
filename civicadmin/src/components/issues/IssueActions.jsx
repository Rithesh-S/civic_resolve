// src/components/issues/IssueActions.jsx
import React, { useState, useEffect } from "react";
import {
  deleteIssue,
  approveExtension,
  rejectExtension,
  reviewFlaggedIssue,
  getPendingApprovals
} from "../../services/api";

const IssueActions = ({ issue, onIssueUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingExtensions, setPendingExtensions] = useState([]);

  useEffect(() => {
    // Fetch pending approvals to check if this issue has extension requests
    const fetchPendingApprovals = async () => {
      try {
        const approvals = await getPendingApprovals();
        // Filter extensions for this specific issue
        const issueExtensions = approvals.extensionRequests.filter(
          ext => ext.issueId._id === issue._id
        );
        setPendingExtensions(issueExtensions);
      } catch (error) {
        console.error("Error fetching pending approvals:", error);
      }
    };

    if (issue && issue._id) {
      fetchPendingApprovals();
    }
  }, [issue]);

  const handleDeleteIssue = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this issue? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        await deleteIssue(issue._id);
        alert("Issue deleted successfully");
        // You might want to redirect or refresh the issue list here
      } catch (error) {
        console.error("Error deleting issue:", error);
        alert("Failed to delete issue: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleApproveExtension = async (extensionId) => {
    setIsLoading(true);
    try {
      await approveExtension(extensionId);
      alert("Extension approved successfully");
      onIssueUpdate(); // Refresh the issue data
      // Remove the approved extension from the list
      setPendingExtensions(prev => prev.filter(ext => ext._id !== extensionId));
    } catch (error) {
      console.error("Error approving extension:", error);
      alert("Failed to approve extension: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectExtension = async (extensionId) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setIsLoading(true);
    try {
      await rejectExtension(extensionId, rejectionReason);
      alert("Extension rejected successfully");
      onIssueUpdate(); // Refresh the issue data
      // Remove the rejected extension from the list
      setPendingExtensions(prev => prev.filter(ext => ext._id !== extensionId));
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting extension:", error);
      alert("Failed to reject extension: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewFlaggedIssue = async (action) => {
    setIsLoading(true);
    try {
      await reviewFlaggedIssue(issue._id, action);
      alert(`Issue ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      onIssueUpdate(); // Refresh the issue data
    } catch (error) {
      console.error(`Error ${action}ing flagged issue:`, error);
      alert(`Failed to ${action} issue: ` + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFlaggedForReview = issue.verification && issue.verification.status === "flagged";
  const hasPendingExtensions = pendingExtensions.length > 0;

  return (
    <div className="mb-6 bg-white rounded-lg shadow-xs dark:bg-gray-800">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Actions
        </h3>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Flag Review Actions - Only show if issue is flagged for review */}
        {isFlaggedForReview && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Flagged for Review
            </h4>
            <div className="mb-2 p-3 bg-red-50 rounded-lg dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-200">
                This issue has been flagged for admin review
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleReviewFlaggedIssue('approve')}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Approve Issue"}
              </button>
              <button
                onClick={() => handleReviewFlaggedIssue('reject')}
                disabled={isLoading}
                className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Reject Issue"}
              </button>
            </div>
          </div>
        )}

        {/* Extension Actions - Only show if there are pending extensions for this issue */}
        {hasPendingExtensions && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Extension Requests
            </h4>
            {pendingExtensions.map((extension) => (
              <div key={extension._id} className="mb-4 p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Extension Request #{extension._id.slice(-6)}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Requested by: {extension.officerId.fullName}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  New deadline: {new Date(extension.requestedUntil).toLocaleDateString()}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Reason: {extension.reason}
                </p>
                
                <textarea
                  placeholder="Reason for rejection (required if rejecting)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="2"
                />
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => handleApproveExtension(extension._id)}
                    disabled={isLoading}
                    className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Approve Extension"}
                  </button>
                  <button
                    onClick={() => handleRejectExtension(extension._id)}
                    disabled={isLoading || !rejectionReason.trim()}
                    className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Reject Extension"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Action - Always available */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Danger Zone
          </h4>
          <button
            onClick={handleDeleteIssue}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
          >
            Delete Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueActions;