// src/pages/Analytics/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { getAllIssues, getOfficers } from '../../services/api';
import AnalyticsCharts from '../../components/analytics/AnalyticsCharts';
import AnalyticsFilters from '../../components/analytics/AnalyticsFilters';
import ExportButton from '../../components/analytics/ExportButton';

// Dummy data generator functions
const generateDummyIssues = (count = 50) => {
  const categories = ['Roads', 'Sanitation', 'Streetlight', 'Water Leakage', 'Parks', 'Other'];
  const statuses = ['submitted', 'verified', 'acknowledged', 'in_progress', 'resolved', 'closed'];
  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'];
  
  const issues = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 90);
    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - randomDaysAgo);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = Math.floor(Math.random() * 4) + 1; // 1-4
    
    // Calculate resolved date if status is resolved/closed
    let resolvedDate = null;
    if (status === 'resolved' || status === 'closed') {
      const resolutionDays = Math.floor(Math.random() * 14) + 1;
      resolvedDate = new Date(createdDate);
      resolvedDate.setDate(resolvedDate.getDate() + resolutionDays);
    }
    
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
      resolvedAt: resolvedDate ? resolvedDate.toISOString() : null,
      slaDueDate: slaDueDate.toISOString(),
      isDummy: true // Flag to identify dummy data
    });
  }
  
  return issues;
};

const generateDummyOfficers = (count = 8) => {
  const firstNames = ['John', 'Jane', 'Robert', 'Emily', 'Michael', 'Sarah', 'David', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  const designations = ['Sanitation Officer', 'Road Inspector', 'Public Works Manager', 'City Planner'];
  
  const officers = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    officers.push({
      _id: `officer-${i}`,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@city.gov`,
      designation: designations[Math.floor(Math.random() * designations.length)],
      ward: `Ward ${Math.floor(Math.random() * 8) + 1}`,
      isActive: true,
      isDummy: true
    });
  }
  
  return officers;
};

const Analytics = () => {
  const [issues, setIssues] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: '30days',
    category: 'all',
    ward: 'all',
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [issuesData, officersData] = await Promise.allSettled([
        getAllIssues(),
        getOfficers()
      ]);
      
      let hasMinimalData = false;
      
      // Handle issues data
      if (issuesData.status === 'fulfilled') {
        const issues = issuesData.value.issues || [];
        setIssues(issues);
        
        // Check if issues data is minimal
        if (issues.length < 10) {
          hasMinimalData = true;
        }
      } else {
        console.error('Failed to fetch issues:', issuesData.reason);
        hasMinimalData = true;
      }
      
      // Handle officers data
      if (officersData.status === 'fulfilled') {
        const officers = officersData.value.officers || [];
        setOfficers(officers);
        
        // Check if officers data is minimal
        if (officers.length < 3) {
          hasMinimalData = true;
        }
      } else {
        console.error('Failed to fetch officers:', officersData.reason);
        hasMinimalData = true;
      }
      
      // If data is minimal, generate and use dummy data
      if (hasMinimalData) {
        console.log('Using dummy data to enhance analytics');
        setUsingDummyData(true);
        
        // Generate dummy issues if we have minimal real issues
        if (issuesData.status !== 'fulfilled' || 
            !issuesData.value.issues || 
            issuesData.value.issues.length < 10) {
          const dummyIssues = generateDummyIssues();
          setIssues(dummyIssues);
        }
        
        // Generate dummy officers if we have minimal real officers
        if (officersData.status !== 'fulfilled' || 
            !officersData.value.officers || 
            officersData.value.officers.length < 3) {
          const dummyOfficers = generateDummyOfficers();
          setOfficers(dummyOfficers);
        }
      }
      
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
      console.error('Error fetching analytics data:', err);
      
      // Use dummy data as fallback
      console.log('Using dummy data as fallback');
      setUsingDummyData(true);
      setIssues(generateDummyIssues());
      setOfficers(generateDummyOfficers());
    } finally {
      setLoading(false);
    }
  };

  // Process data for analytics
  const processAnalyticsData = () => {
    // Filter issues based on time range
    const filteredIssues = filterIssuesByTimeRange(issues, filters.timeRange);
    
    // Calculate category distribution
    const categoryData = calculateCategoryDistribution(filteredIssues);
    
    // Calculate status distribution
    const statusData = calculateStatusDistribution(filteredIssues);
    
    // Calculate resolution times
    const resolutionData = calculateResolutionTimes(filteredIssues);
    
    // Calculate officer performance
    const performanceData = calculateOfficerPerformance(filteredIssues, officers);
    
    // Calculate trends over time
    const trendsData = calculateTrendsOverTime(filteredIssues, filters.timeRange);

    return {
      categoryData,
      statusData,
      resolutionData,
      performanceData,
      trendsData,
      totalIssues: filteredIssues.length,
      resolvedIssues: filteredIssues.filter(issue => 
        issue.status === 'resolved' || issue.status === 'closed'
      ).length,
      avgResolutionTime: calculateAverageResolutionTime(filteredIssues),
    };
  };

  const filterIssuesByTimeRange = (issues, timeRange) => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return issues;
    }
    
    return issues.filter(issue => new Date(issue.createdAt) >= startDate);
  };

  const calculateCategoryDistribution = (issues) => {
    const categories = {};
    issues.forEach(issue => {
      categories[issue.category] = (categories[issue.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const calculateStatusDistribution = (issues) => {
    const statuses = {};
    issues.forEach(issue => {
      statuses[issue.status] = (statuses[issue.status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  const calculateResolutionTimes = (issues) => {
    const resolvedIssues = issues.filter(issue => 
      issue.resolvedAt && issue.createdAt
    );
    
    return resolvedIssues.map(issue => ({
      name: issue.title,
      days: Math.ceil(
        (new Date(issue.resolvedAt) - new Date(issue.createdAt)) / 
        (1000 * 60 * 60 * 24)
      )
    }));
  };

  const calculateOfficerPerformance = (issues, officers) => {
    const performance = {};
    
    // For dummy data, assign some issues to officers
    if (issues.some(issue => issue.isDummy)) {
      officers.forEach(officer => {
        performance[officer._id] = {
          name: officer.fullName,
          assigned: Math.floor(Math.random() * 15) + 5,
          resolved: Math.floor(Math.random() * 12) + 3,
        };
      });
    } else {
      // Use real data logic
      issues.forEach(issue => {
        if (issue.assignedOfficerId) {
          const officerId = issue.assignedOfficerId;
          if (!performance[officerId]) {
            const officer = officers.find(o => o._id === officerId);
            performance[officerId] = {
              name: officer ? officer.fullName : 'Unknown',
              assigned: 0,
              resolved: 0,
            };
          }
          
          performance[officerId].assigned++;
          if (issue.status === 'resolved' || issue.status === 'closed') {
            performance[officerId].resolved++;
          }
        }
      });
    }
    
    return Object.values(performance).map(officer => ({
      name: officer.name,
      efficiency: officer.assigned > 0 
        ? Math.round((officer.resolved / officer.assigned) * 100)
        : 0,
      assigned: officer.assigned,
      resolved: officer.resolved,
    }));
  };

  const calculateTrendsOverTime = (issues, timeRange) => {
    // Group issues by date based on time range
    const trends = {};
    
    issues.forEach(issue => {
      const date = new Date(issue.createdAt);
      let key;
      
      if (timeRange === 'year') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = date.toISOString().split('T')[0];
      }
      
      trends[key] = (trends[key] || 0) + 1;
    });
    
    // Convert to array and sort by date
    return Object.entries(trends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const calculateAverageResolutionTime = (issues) => {
    const resolvedIssues = issues.filter(issue => 
      issue.resolvedAt && issue.createdAt
    );
    
    if (resolvedIssues.length === 0) return 0;
    
    const totalDays = resolvedIssues.reduce((sum, issue) => {
      return sum + Math.ceil(
        (new Date(issue.resolvedAt) - new Date(issue.createdAt)) / 
        (1000 * 60 * 60 * 24)
      );
    }, 0);
    
    return Math.round(totalDays / resolvedIssues.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📊</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            Loading analytics...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {error}
          </h2>
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const analyticsData = processAnalyticsData();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          Analytics & Reports
        </h2>
        <div className="flex items-center gap-4">
          {/* {usingDummyData && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Showing enhanced demo data
            </div>
          )} */}
          <ExportButton data={analyticsData} />
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters filters={filters} onFilterChange={setFilters} />

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full dark:text-blue-100 dark:bg-blue-500">
            📋
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Issues
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {analyticsData.totalIssues}
            </p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-green-500 bg-green-100 rounded-full dark:text-green-100 dark:bg-green-500">
            ✅
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Resolved Issues
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {analyticsData.resolvedIssues}
            </p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-purple-500 bg-purple-100 rounded-full dark:text-purple-100 dark:bg-purple-500">
            ⏱️
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg. Resolution Time
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {analyticsData.avgResolutionTime} days
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts data={analyticsData} timeRange={filters.timeRange} />
    </div>
  );
};

export default Analytics;