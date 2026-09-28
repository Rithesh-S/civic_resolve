// src/pages/IssueDetail/IssueDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getIssueById, getOfficers } from "../../services/api";
import IssueTimeline from "../../components/issues/IssueTimeline";
import IssueMedia from "../../components/issues/IssueMedia";
import IssueActions from "../../components/issues/IssueActions";
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  HeartIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const IssueDetail = () => {
  const { id } = useParams();
  console.log(id);
  const [issue, setIssue] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIssueAndOfficers();
  }, [id]);

  const fetchIssueAndOfficers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch issue details
      const issueData = await getIssueById(id);
      setIssue(issueData.issue);

      // Fetch officers list
      // Fetch officers list
      const officersData = await getOfficers();
      setOfficers(officersData.officers || []);
    } catch (err) {
      setError(err.message || "Failed to fetch issue details");
      console.error("Error fetching issue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueUpdate = (updatedIssue) => {
    setIssue(updatedIssue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📋</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            Loading issue details...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {error || "Issue not found"}
          </h2>
          <Link
            to="/issues"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Issues
          </Link>
          <button
            onClick={fetchIssueAndOfficers}
            className="ml-4 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const assignedOfficer = officers.find(
    (o) => o._id === issue.assignedOfficerId
  );

  const statusLabels = {
    submitted: "Submitted",
    verified: "Verified",
    rejected: "Rejected",
    acknowledged: "Acknowledged",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  };

  const priorityLabels = {
    1: "Critical",
    2: "High",
    3: "Medium",
    4: "Low",
    5: "Very Low",
  };

  const priorityColors = {
    1: "bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300",
    2: "bg-orange-100 text-orange-700 dark:bg-orange-800/30 dark:text-orange-300",
    3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300",
    4: "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300",
    5: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted:
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
      verified:
        "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300",
      rejected: "bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300",
      acknowledged:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300",
      in_progress:
        "bg-orange-100 text-orange-700 dark:bg-orange-800/30 dark:text-orange-300",
      resolved:
        "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300",
      closed:
        "bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300",
    };
    return colors[status] || colors.submitted;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/issues"
          className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Issues
        </Link>
        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              priorityColors[issue.priority]
            }`}
          >
            {priorityLabels[issue.priority]}
          </span>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
              issue.status
            )}`}
          >
            {statusLabels[issue.status]}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {issue.title}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {issue.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ward
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Ward {issue.wardId}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reported
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Assigned Officer
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {issue ? issue.assignedOfficerId.fullName : "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <HeartIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upvotes
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {issue.upvote || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <IssueMedia media={issue.media} />

          {/* Timeline */}
          <IssueTimeline statusHistory={issue.statusHistory} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <IssueActions issue={issue} onIssueUpdate={handleIssueUpdate} />

          {/* Verification Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Verification Status
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  AI Verification
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    issue.verification?.status === "success"
                      ? "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300"
                      : issue.verification?.status === "flagged"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300"
                      : "bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300"
                  }`}
                >
                  {issue.verification?.status || "pending"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence Score
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {((issue.verification?.confidenceScore || 0) * 100).toFixed(
                    1
                  )}
                  %
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Duplicate Check
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {issue.verification?.isDuplicate
                    ? "Possible Duplicate"
                    : "Unique"}
                </span>
              </div>
            </div>
          </div>

          {/* Citizen Feedback */}
          {issue.citizenFeedback && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Citizen Feedback
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Rating:
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">
                        {i < (issue.citizenFeedback?.rating || 0) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>

                {issue.citizenFeedback?.comment && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Comment:
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      "{issue.citizenFeedback.comment}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLA Information */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">SLA Due Date</h3>
            <p className="text-2xl font-bold mb-2">
              {new Date(issue.slaDueDate).toLocaleDateString()}
            </p>
            <p className="text-sm opacity-90">
              {new Date(issue.slaDueDate) > new Date()
                ? "Time remaining to resolve"
                : "Overdue by"}
            </p>
            <div className="mt-3 w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      100 -
                        ((new Date(issue.slaDueDate) - new Date()) /
                          (7 * 24 * 60 * 60 * 1000)) *
                          100
                    )
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
