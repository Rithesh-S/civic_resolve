// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import StatsGrid from '../../components/dashboard/StatsGrid';
import IssueHeatmap from '../../components/dashboard/IssueHeatmap';
import RecentActivity from '../../components/dashboard/RecentActivity';
import PriorityIssues from '../../components/dashboard/PriorityIssues';
import { getAllIssues, getDashboardStats } from '../../services/api';

// Dummy data generator functions
const generateDummyIssues = (count = 20) => {
  const categories = ['Roads', 'Sanitation', 'Streetlight', 'Water Leakage', 'Parks', 'Other'];
  const statuses = ['submitted', 'verified', 'acknowledged', 'in_progress', 'resolved', 'closed'];
  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'];
  
  const issues = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - randomDaysAgo);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = Math.floor(Math.random() * 4) + 1; // 1-4
    
    // Calculate SLA due date (1-7 days from creation)
    const slaDays = Math.floor(Math.random() * 7) + 1;
    const slaDueDate = new Date(createdDate);
    slaDueDate.setDate(slaDueDate.getDate() + slaDays);
    
    issues.push({
      _id: `dummy-${i}`,
      title: `${category} issue in ${wards[Math.floor(Math.random() * wards.length)]}`,
      description: `This is a sample ${category.toLowerCase()} issue that needs attention.`,
      category,
      status,
      priority,
      wardId: wards[Math.floor(Math.random() * wards.length)],
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      slaDueDate: slaDueDate.toISOString(),
      isDummy: true // Flag to identify dummy data
    });
  }
  
  return issues;
};

const generateDummyStats = () => {
  return {
    totalIssues: Math.floor(Math.random() * 100) + 50,
    resolvedIssues: Math.floor(Math.random() * 40) + 20,
    resolutionRate: Math.floor(Math.random() * 30) + 60, // 60-90%
    avgResolutionTime: Math.floor(Math.random() * 5) + 2 // 2-7 days
  };
};

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDummyData, setUsingDummyData] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel
      const [statsResult, issuesResult] = await Promise.allSettled([
        getDashboardStats(),
        getAllIssues()
      ]);
      
      let hasMinimalData = false;
      
      // Handle dashboard stats
      if (statsResult.status === 'fulfilled') {
        setDashboardStats(statsResult.value);
        // Check if stats data is minimal
        if (statsResult.value && 
            (statsResult.value.totalIssues < 5 || 
             !statsResult.value.resolutionRate)) {
          hasMinimalData = true;
        }
      } else {
        console.error('Failed to fetch dashboard stats:', statsResult.reason);
        hasMinimalData = true;
      }
      
      // Handle issues - extract the issues array from the response
      if (issuesResult.status === 'fulfilled') {
        const issuesData = issuesResult.value.issues || [];
        setIssues(issuesData);
        
        // Check if issues data is minimal
        if (issuesData.length < 5) {
          hasMinimalData = true;
        }
      } else {
        console.error('Failed to fetch issues:', issuesResult.reason);
        setError('Failed to load issues data');
        hasMinimalData = true;
      }
      
      // If data is minimal, generate and use dummy data
      if (hasMinimalData) {
        console.log('Using dummy data to enhance dashboard');
        setUsingDummyData(true);
        
        // Generate dummy issues if we have minimal real issues
        if (issuesResult.status !== 'fulfilled' || 
            !issuesResult.value.issues || 
            issuesResult.value.issues.length < 5) {
          const dummyIssues = generateDummyIssues();
          setIssues(dummyIssues);
        }
        
        // Generate dummy stats if we have minimal real stats
        if (statsResult.status !== 'fulfilled' || 
            !statsResult.value || 
            statsResult.value.totalIssues < 5) {
          const dummyStats = generateDummyStats();
          setDashboardStats(dummyStats);
        }
      }
      
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
      
      // Use dummy data as fallback
      console.log('Using dummy data as fallback');
      setUsingDummyData(true);
      setIssues(generateDummyIssues());
      setDashboardStats(generateDummyStats());
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from the issues data
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(issue => 
    issue.status === 'resolved' || issue.status === 'closed'
  ).length;
  
  const pendingIssues = issues.filter(issue => 
    ['submitted', 'verified', 'acknowledged', 'in_progress'].includes(issue.status)
  ).length;
  
  const criticalIssues = issues.filter(issue => issue.priority === 1).length;

  const stats = [
    { 
      title: 'Total Issues', 
      value: totalIssues, 
      change: dashboardStats ? `${Math.round(dashboardStats.resolutionRate || 0)}% resolution rate` : 'Loading...',
      icon: '📋',
      color: 'blue',
      trend: totalIssues > 0 ? 'up' : 'neutral'
    },
    { 
      title: 'Resolved Issues', 
      value: resolvedIssues, 
      change: dashboardStats ? `${Math.round(dashboardStats.avgResolutionTime || 0)} days avg resolution` : 'Loading...',
      icon: '✅',
      color: 'green',
      trend: resolvedIssues > 0 ? 'up' : 'neutral'
    },
    { 
      title: 'Pending Issues', 
      value: pendingIssues, 
      change: 'Needs attention',
      icon: '⏳',
      color: 'yellow',
      trend: pendingIssues > 0 ? 'up' : 'neutral'
    },
    { 
      title: 'Critical Issues', 
      value: criticalIssues, 
      change: 'Needs immediate attention',
      icon: '⚠️',
      color: 'red',
      trend: criticalIssues > 0 ? 'alert' : 'neutral'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          Dashboard
        </h2>
        {/* {usingDummyData && (
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            Showing enhanced demo data
          </div>
        )} */}
      </div>
      
      {/* Stats Grid */}
      <StatsGrid stats={stats} />
      
      {/* Charts & Grid */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Issue Heatmap */}
        <IssueHeatmap issues={issues} />
        
        {/* Priority Issues */}
        <PriorityIssues issues={issues} />
      </div>
      
      {/* Recent Activity */}
      <RecentActivity issues={issues} />
    </div>
  );
};

export default Dashboard;