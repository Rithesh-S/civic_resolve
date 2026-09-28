// src/contexts/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import { adminAPI } from '../services/api';
import { useAuth } from './AuthContext'; // Import useAuth hook

// Initial state
const initialState = {
  issues: [],
  officers: [],
  inventory: [],
  inventoryRequests: [],
  slaExtensions: [],
  notifications: [],
  isLoading: false,
  error: null,
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ISSUES: 'SET_ISSUES',
  SET_OFFICERS: 'SET_OFFICERS',
  SET_INVENTORY: 'SET_INVENTORY',
  SET_INVENTORY_REQUESTS: 'SET_INVENTORY_REQUESTS',
  SET_SLA_EXTENSIONS: 'SET_SLA_EXTENSIONS',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  UPDATE_ISSUE: 'UPDATE_ISSUE',
  ADD_ISSUE: 'ADD_ISSUE',
  DELETE_ISSUE: 'DELETE_ISSUE',
  UPDATE_OFFICER: 'UPDATE_OFFICER',
  ADD_OFFICER: 'ADD_OFFICER',
  UPDATE_INVENTORY: 'UPDATE_INVENTORY',
  ADD_INVENTORY: 'ADD_INVENTORY',
  UPDATE_INVENTORY_REQUEST: 'UPDATE_INVENTORY_REQUEST',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case actionTypes.SET_ISSUES:
      return { ...state, issues: action.payload };
    
    case actionTypes.SET_OFFICERS:
      return { ...state, officers: action.payload };
    
    case actionTypes.SET_INVENTORY:
      return { ...state, inventory: action.payload };
    
    case actionTypes.SET_INVENTORY_REQUESTS:
      return { ...state, inventoryRequests: action.payload };
    
    case actionTypes.SET_SLA_EXTENSIONS:
      return { ...state, slaExtensions: action.payload };
    
    case actionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    
    case actionTypes.UPDATE_ISSUE:
      return {
        ...state,
        issues: state.issues.map(issue =>
          issue._id === action.payload._id ? action.payload : issue
        ),
      };
    
    case actionTypes.ADD_ISSUE:
      return {
        ...state,
        issues: [action.payload, ...state.issues],
      };
    
    case actionTypes.DELETE_ISSUE:
      return {
        ...state,
        issues: state.issues.filter(issue => issue._id !== action.payload),
      };
    
    case actionTypes.UPDATE_OFFICER:
      return {
        ...state,
        officers: state.officers.map(officer =>
          officer._id === action.payload._id ? action.payload : officer
        ),
      };
    
    case actionTypes.ADD_OFFICER:
      return {
        ...state,
        officers: [action.payload, ...state.officers],
      };
    
    case actionTypes.UPDATE_INVENTORY:
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item._id === action.payload._id ? action.payload : item
        ),
      };
    
    case actionTypes.ADD_INVENTORY:
      return {
        ...state,
        inventory: [action.payload, ...state.inventory],
      };
    
    case actionTypes.UPDATE_INVENTORY_REQUEST:
      return {
        ...state,
        inventoryRequests: state.inventoryRequests.map(request =>
          request._id === action.payload._id ? action.payload : request
        ),
      };
    
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    
    case actionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated } = useAuth(); // Get authentication status from AuthContext

  // Fetch data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    } else {
      // Clear data when not authenticated
      dispatch({ type: actionTypes.SET_ISSUES, payload: [] });
      dispatch({ type: actionTypes.SET_OFFICERS, payload: [] });
      dispatch({ type: actionTypes.SET_INVENTORY, payload: [] });
      dispatch({ type: actionTypes.SET_INVENTORY_REQUESTS, payload: [] });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, [isAuthenticated]); // Run when authentication status changes

  const fetchAllData = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      // Fetch all data in parallel
      const [issuesResponse] = await Promise.all([
        adminAPI.getAllIssues(),
        // These endpoints need to be implemented in your backend
        // adminAPI.getOfficers(),
        // adminAPI.getInventory(),
        // adminAPI.getInventoryRequests()
      ]);
      
      if (issuesResponse.data) {
        dispatch({ type: actionTypes.SET_ISSUES, payload: issuesResponse.data });
      }
      
      if (issuesResponse.error) {
        console.error('Failed to fetch issues:', issuesResponse.error);
      }
      
      // Set dummy data for other endpoints until they're implemented
      dispatch({ type: actionTypes.SET_OFFICERS, payload: [] });
      dispatch({ type: actionTypes.SET_INVENTORY, payload: [] });
      dispatch({ type: actionTypes.SET_INVENTORY_REQUESTS, payload: [] });
      
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await adminAPI.getAllIssues();
      if (response.data) {
        dispatch({ type: actionTypes.SET_ISSUES, payload: response.data });
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      return { error: error.message };
    }
  };

  const fetchOfficers = async () => {
    try {
      // This endpoint needs to be implemented
      // const response = await adminAPI.getOfficers();
      // if (response.data) {
      //   dispatch({ type: actionTypes.SET_OFFICERS, payload: response.data });
      // }
      // return response;
      return { data: [] };
    } catch (error) {
      console.error('Failed to fetch officers:', error);
      return { error: error.message };
    }
  };

  const fetchInventoryRequests = async () => {
    try {
      // This endpoint needs to be implemented
      // const response = await adminAPI.getInventoryRequests();
      // if (response.data) {
      //   dispatch({ type: actionTypes.SET_INVENTORY_REQUESTS, payload: response.data });
      // }
      // return response;
      return { data: [] };
    } catch (error) {
      console.error('Failed to fetch inventory requests:', error);
      return { error: error.message };
    }
  };

  const value = {
    // State
    ...state,
    
    // Data fetching functions
    fetchIssues,
    fetchOfficers,
    fetchInventoryRequests,
    fetchAllData,
    
    // Actions
    setLoading: (isLoading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: isLoading });
    },
    
    updateIssue: (issue) => {
      dispatch({ type: actionTypes.UPDATE_ISSUE, payload: issue });
    },
    
    addIssue: (issue) => {
      dispatch({ type: actionTypes.ADD_ISSUE, payload: issue });
    },
    
    deleteIssue: (issueId) => {
      dispatch({ type: actionTypes.DELETE_ISSUE, payload: issueId });
    },
    
    updateOfficer: (officer) => {
      dispatch({ type: actionTypes.UPDATE_OFFICER, payload: officer });
    },
    
    addOfficer: (officer) => {
      dispatch({ type: actionTypes.ADD_OFFICER, payload: officer });
    },
    
    updateInventory: (item) => {
      dispatch({ type: actionTypes.UPDATE_INVENTORY, payload: item });
    },
    
    addInventory: (item) => {
      dispatch({ type: actionTypes.ADD_INVENTORY, payload: item });
    },
    
    updateInventoryRequest: (request) => {
      dispatch({ type: actionTypes.UPDATE_INVENTORY_REQUEST, payload: request });
    },
    
    addNotification: (notification) => {
      dispatch({ type: actionTypes.ADD_NOTIFICATION, payload: notification });
    },
    
    markNotificationRead: (notificationId) => {
      dispatch({ type: actionTypes.MARK_NOTIFICATION_READ, payload: notificationId });
    },
    
    // Helper functions
    getIssueById: (issueId) => {
      return state.issues.find(issue => issue._id === issueId);
    },
    
    getOfficerById: (officerId) => {
      return state.officers.find(officer => officer._id === officerId);
    },
    
    getInventoryItemById: (itemId) => {
      return state.inventory.find(item => item._id === itemId);
    },
    
    getUnreadNotifications: () => {
      return state.notifications.filter(notification => !notification.isRead);
    },
    
    getIssuesByStatus: (status) => {
      return state.issues.filter(issue => issue.status === status);
    },
    
    getIssuesByPriority: (priority) => {
      return state.issues.filter(issue => issue.priority === priority);
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};