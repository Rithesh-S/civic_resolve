// src/services/api.js
import axios from "axios";
const ip = import.meta.env.VITE_BASE_IP;

const API_BASE_URL = `http://${ip}:5000/api`;

// Helper function to get user ID from localStorage
const getUserId = () => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user._id; // Handle both 'id' and '_id' formats
    }
    return null;
  } catch (error) {
    console.error("Error getting user ID from localStorage:", error);
    return null;
  }
};

// Helper function to create headers with auth token and user ID
const createHeaders = () => {
  const token = localStorage.getItem("authToken");
  const userId = getUserId();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Only add x-user-id header if userId is available
  if (userId) {
    headers["x-user-id"] = userId;
  }

  return headers;
};
// Inventory API functions
export const getInventory = async (page = 1, limit = 10, filters = {}) => {
  try {
    const headers = createHeaders();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await axios.get(`${API_BASE_URL}/inventory?${params}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch inventory");
  }
};
// Flagged Issues API functions
export const getFlaggedIssues = async (page = 1, limit = 10, filters = {}) => {
  try {
    const headers = createHeaders();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      
    });

    const response = await axios.get(
      `${API_BASE_URL}/admin/issues/flagged?${params}`,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch flagged issues"
    );
  }
};

export const reviewFlaggedIssue = async (issueId, action) => {
  try {
    const headers = createHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/admin/issues/${issueId}/review`,
      { action },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to review flagged issue"
    );
  }
};

export const getInventoryItem = async (itemId) => {
  try {
    const headers = createHeaders();
    const response = await axios.get(`${API_BASE_URL}/inventory/${itemId}`, {
      headers,
    });
    return response.data.item;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch inventory item"
    );
  }
};
export const assignIssueToOfficer = async (issueId, officerId) => {
  try {
    const headers = createHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/admin/issues/${issueId}/assign`,
      { officerId },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to assign issue");
  }
};

// Delete issue
export const deleteIssue = async (issueId) => {
  try {
    const headers = createHeaders();
    const response = await axios.delete(
      `${API_BASE_URL}/admin/issues/${issueId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete issue");
  }
};
// src/services/api.js - Update the createInventoryItem function
export const createInventoryItem = async (formData) => {
  try {
    const token = localStorage.getItem("authToken");
    let userId = null;
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id || user._id;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    if (userId) {
      headers["x-user-id"] = userId;
    }
    const response = await axios.post(`${API_BASE_URL}/inventory`, formData, {
      headers: headers,
    });

    return response.data.item;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to create inventory item"
    );
  }
};

export const updateInventoryItem = async (itemId, updatedData) => {
  try {
    const headers = createHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/inventory/${itemId}`,
      updatedData,
      { headers }
    );
    return response.data.item;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update inventory item"
    );
  }
};

export const deleteInventoryItem = async (itemId) => {
  try {
    const headers = createHeaders();
    const response = await axios.delete(`${API_BASE_URL}/inventory/${itemId}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to delete inventory item"
    );
  }
};

// Inventory Requests API functions
export const getInventoryRequests = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  try {
    const headers = createHeaders();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await axios.get(
      `${API_BASE_URL}/inventory/requests?${params}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch inventory requests"
    );
  }
};

export const updateInventoryRequest = async (requestId, updatedData) => {
  try {
    const headers = createHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/inventory/requests/${requestId}`,
      updatedData,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update inventory request"
    );
  }
};
// Authentication API - Login
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      credentials
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

// Authentication API - Logout
export const logoutUser = async () => {
  try {
    const headers = createHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/logout`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Logout failed");
  }
};

// Dashboard stats
export const getDashboardStats = async () => {
  try {
    const headers = createHeaders();
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch dashboard stats"
    );
  }
};

// Get all issues
export const getAllIssues = async () => {
  try {
    const headers = createHeaders();
    const response = await axios.get(`${API_BASE_URL}/admin/issues`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch issues");
  }
};
export const getOfficers = async () => {
  try {
    const headers = createHeaders();
    const response = await axios.get(`${API_BASE_URL}/admin/officers`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch issues");
  }
};
export const createOfficer = async (officerData) => {
  try {
    const headers = createHeaders();
    const response = await axios.post(`${API_BASE_URL}/officers`, officerData, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create officer");
  }
};
export const getIssueById = async (issueId) => {
  try {
    const headers = createHeaders();
    const response = await axios.get(`${API_BASE_URL}/issues/${issueId}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch issues");
  }
};

// Get flagged issues
// export const getFlaggedIssues = async (page = 1, limit = 10) => {
//   try {
//     const headers = createHeaders();
//     const response = await axios.get(
//       `${API_BASE_URL}/admin/issues/flagged?page=${page}&limit=${limit}`,
//       { headers }
//     );
//     return response.data;
//   } catch (error) {
//     throw new Error(
//       error.response?.data?.error || "Failed to fetch flagged issues"
//     );
//   }
// };

// Get pending approvals
export const getPendingApprovals = async (page = 1, limit = 10) => {
  try {
    const headers = createHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/admin/approvals/pending?page=${page}&limit=${limit}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch pending approvals"
    );
  }
};

// Review flagged issue
// export const reviewFlaggedIssue = async (issueId, action) => {
//   try {
//     const headers = createHeaders();
//     const response = await axios.post(
//       `${API_BASE_URL}/admin/issues/${issueId}/review`,
//       { action },
//       { headers }
//     );
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || "Failed to review issue");
//   }
// };

// Approve expense
export const approveExpense = async (expenseId) => {
  try {
    const headers = createHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/admin/expenses/${expenseId}/approve`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to approve expense");
  }
};

// Reject expense
export const rejectExpense = async (expenseId, reason) => {
  try {
    const headers = createHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/admin/expenses/${expenseId}/reject`,
      { reason },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to reject expense");
  }
};

// Approve extension
export const approveExtension = async (extensionId) => {
  try {
    const headers = createHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/admin/extensions/${extensionId}/approve`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to approve extension"
    );
  }
};

// Reject extension
export const rejectExtension = async (extensionId, reason) => {
  try {
    const headers = createHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/admin/extensions/${extensionId}/reject`,
      { reason },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to reject extension"
    );
  }
};

export const getNotifications = async (
  unreadOnly = false,
  page = 1,
  limit = 10
) => {
  try {
    const headers = createHeaders();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (unreadOnly) {
      params.append("unreadOnly", "true");
    }

    const response = await axios.get(
      `${API_BASE_URL}/notifications?${params}`,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch notifications"
    );
  }
};

// Get unread notifications count
export const getUnreadCount = async () => {
  try {
    const headers = createHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/notifications?unreadOnly=true&limit=1`,
      {
        headers,
      }
    );
    return response.data.unreadCount;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch unread count"
    );
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const headers = createHeaders();
    const response = await axios.patch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to mark notification as read"
    );
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const headers = createHeaders();
    const response = await axios.patch(
      `${API_BASE_URL}/notifications/read-all`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to mark all notifications as read"
    );
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const headers = createHeaders();
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/${notificationId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to delete notification"
    );
  }
};
