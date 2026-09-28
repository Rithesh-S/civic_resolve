// src/utils/helpers.js
// Utility helper functions

import { 
  ISSUE_STATUS, 
  ISSUE_PRIORITY, 
  COLOR_SCHEME,
  DATE_FORMATS 
} from './constants';
import dayjs from 'dayjs';

// Format currency (Indian Rupees)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (date, format = DATE_FORMATS.DISPLAY_DATE) => {
  return dayjs(date).format(format);
};

// Format date with time
export const formatDateTime = (date, format = DATE_FORMATS.DISPLAY_DATETIME) => {
  return dayjs(date).format(format);
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  const now = dayjs();
  const inputDate = dayjs(date);
  const diffInMinutes = now.diff(inputDate, 'minute');
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = now.diff(inputDate, 'hour');
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = now.diff(inputDate, 'day');
  if (diffInDays < 30) return `${diffInDays} days ago`;
  
  const diffInMonths = now.diff(inputDate, 'month');
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  
  return `${now.diff(inputDate, 'year')} years ago`;
};

// Get status label
export const getStatusLabel = (status) => {
  const statusLabels = {
    [ISSUE_STATUS.SUBMITTED]: 'Submitted',
    [ISSUE_STATUS.VERIFIED]: 'Verified',
    [ISSUE_STATUS.REJECTED]: 'Rejected',
    [ISSUE_STATUS.ACKNOWLEDGED]: 'Acknowledged',
    [ISSUE_STATUS.IN_PROGRESS]: 'In Progress',
    [ISSUE_STATUS.RESOLVED]: 'Resolved',
    [ISSUE_STATUS.CLOSED]: 'Closed',
  };
  return statusLabels[status] || status;
};

// Get priority label
export const getPriorityLabel = (priority) => {
  const priorityLabels = {
    [ISSUE_PRIORITY.CRITICAL]: 'Critical',
    [ISSUE_PRIORITY.HIGH]: 'High',
    [ISSUE_PRIORITY.MEDIUM]: 'Medium',
    [ISSUE_PRIORITY.LOW]: 'Low',
    [ISSUE_PRIORITY.VERY_LOW]: 'Very Low',
  };
  return priorityLabels[priority] || `Priority ${priority}`;
};

// Get status color
export const getStatusColor = (status) => {
  const statusColors = {
    [ISSUE_STATUS.SUBMITTED]: 'gray',
    [ISSUE_STATUS.VERIFIED]: 'blue',
    [ISSUE_STATUS.REJECTED]: 'red',
    [ISSUE_STATUS.ACKNOWLEDGED]: 'yellow',
    [ISSUE_STATUS.IN_PROGRESS]: 'orange',
    [ISSUE_STATUS.RESOLVED]: 'green',
    [ISSUE_STATUS.CLOSED]: 'purple',
  };
  return statusColors[status] || 'gray';
};

// Get priority color
export const getPriorityColor = (priority) => {
  const priorityColors = {
    [ISSUE_PRIORITY.CRITICAL]: 'red',
    [ISSUE_PRIORITY.HIGH]: 'orange',
    [ISSUE_PRIORITY.MEDIUM]: 'yellow',
    [ISSUE_PRIORITY.LOW]: 'blue',
    [ISSUE_PRIORITY.VERY_LOW]: 'gray',
  };
  return priorityColors[priority] || 'gray';
};

// Calculate days until due date
export const getDaysUntilDue = (dueDate) => {
  const now = dayjs();
  const due = dayjs(dueDate);
  return due.diff(now, 'day');
};

// Check if due date is urgent (less than 3 days)
export const isUrgent = (dueDate) => {
  return getDaysUntilDue(dueDate) <= 3;
};

// Generate random ID
export const generateId = (prefix = '') => {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Get initial letters for avatar
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substr(0, 2);
};

// Calculate efficiency percentage
export const calculateEfficiency = (assigned, resolved) => {
  if (assigned === 0) return 0;
  return Math.round((resolved / assigned) * 100);
};

// Filter array by search term
export const filterBySearch = (array, searchTerm, fields = []) => {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item => 
    fields.some(field => 
      item[field]?.toString().toLowerCase().includes(term)
    )
  );
};

// Sort array by field
export const sortByField = (array, field, direction = 'asc') => {
  return [...array].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Group array by field
export const groupByField = (array, field) => {
  return array.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
};

// Get color class for Tailwind
export const getColorClass = (color, type = 'bg') => {
  const colorClasses = {
    blue: `${type}-blue-600 text-white`,
    green: `${type}-green-600 text-white`,
    red: `${type}-red-600 text-white`,
    yellow: `${type}-yellow-600 text-white`,
    orange: `${type}-orange-600 text-white`,
    purple: `${type}-purple-600 text-white`,
    gray: `${type}-gray-600 text-white`,
  };
  return colorClasses[color] || `${type}-gray-600 text-white`;
};

// Export CSV data
export const exportToCSV = (data, filename) => {
  const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  getRelativeTime,
  getStatusLabel,
  getPriorityLabel,
  getStatusColor,
  getPriorityColor,
  getDaysUntilDue,
  isUrgent,
  generateId,
  debounce,
  truncateText,
  isValidEmail,
  isValidPhone,
  getInitials,
  calculateEfficiency,
  filterBySearch,
  sortByField,
  groupByField,
  getColorClass,
  exportToCSV,
};