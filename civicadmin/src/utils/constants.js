// src/utils/constants.js
// Application constants and configuration

export const APP_CONFIG = {
  NAME: 'Civic Resolution Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Jharkhand Government Civic Issue Management System',
  SUPPORT_EMAIL: 'support@jharkhand.gov.in',
  SUPPORT_PHONE: '+91 1800-123-4567',
};

export const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const ISSUE_CATEGORIES = {
  ROADS: 'Roads',
  SANITATION: 'Sanitation',
  STREETLIGHT: 'Streetlight',
  WATER_LEAKAGE: 'Water Leakage',
  PARKS: 'Parks',
};

export const ISSUE_STATUS = {
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const ISSUE_PRIORITY = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  VERY_LOW: 5,
};

export const INVENTORY_CATEGORIES = {
  ELECTRICAL: 'Electrical',
  CONSTRUCTION: 'Construction',
  SANITATION: 'Sanitation',
};

export const OFFICER_DEPARTMENTS = {
  PUBLIC_WORKS: 'Public Works',
  SANITATION: 'Sanitation',
  HORTICULTURE: 'Horticulture',
  ELECTRICAL: 'Electrical',
};

export const OFFICER_ROLES = {
  JE: 'JE',
  SI: 'SI',
  AE: 'AE',
  CSI: 'CSI',
  EE: 'EE',
};

export const OFFICER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
};

export const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  SMS: 'sms',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FLAGGED: 'flagged',
  FAILED: 'failed',
};

export const INVENTORY_REQUEST_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BILLED: 'billed',
};

export const SLA_EXTENSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const COLOR_SCHEME = {
  PRIMARY: '#2563EB',
  SECONDARY: '#06B6D4',
  ACCENT: '#FACC15',
  BACKGROUND_DARK: '#0F172A',
  BACKGROUND_LIGHT: '#F9FAFB',
  TEXT_PRIMARY: '#1E293B',
  TEXT_SECONDARY: '#64748B',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  ISSUES: {
    LIST: '/api/issues',
    CREATE: '/api/issues',
    DETAIL: '/api/issues/:id',
    UPDATE: '/api/issues/:id',
    DELETE: '/api/issues/:id',
    STATS: '/api/issues/stats',
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    DETAIL: '/api/users/:id',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id',
  },
  INVENTORY: {
    LIST: '/api/inventory',
    CREATE: '/api/inventory',
    DETAIL: '/api/inventory/:id',
    UPDATE: '/api/inventory/:id',
    DELETE: '/api/inventory/:id',
  },
  REPORTS: {
    GENERATE: '/api/reports/generate',
    DOWNLOAD: '/api/reports/download',
  },
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  PREFERENCES: 'userPreferences',
  RECENT_SEARCHES: 'recentSearches',
};

export const DATE_FORMATS = {
  DISPLAY_DATE: 'DD MMM YYYY',
  DISPLAY_DATETIME: 'DD MMM YYYY, hh:mm A',
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ssZ',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100],
};

export const MAP_CONFIG = {
  DEFAULT_CENTER: [23.3441, 85.3096], // Ranchi coordinates
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 18,
  MIN_ZOOM: 8,
};

export default {
  APP_CONFIG,
  ROLES,
  ISSUE_CATEGORIES,
  ISSUE_STATUS,
  ISSUE_PRIORITY,
  COLOR_SCHEME,
  API_ENDPOINTS,
};