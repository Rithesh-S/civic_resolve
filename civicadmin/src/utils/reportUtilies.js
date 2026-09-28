import { format } from 'date-fns';

/**
 * Processes a raw list of issues to count occurrences of each category.
 * @param {Array} issues - The raw list of issues.
 * @returns {Array} Data formatted for the BarChart.
 */
export const processCategoryData = (issues) => {
  const categoryCounts = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
};

/**
 * Processes resolved issues to calculate the average resolution time per month.
 * @param {Array} issues - The raw list of issues.
 * @returns {Array} Data formatted for the LineChart.
 */
export const processResolutionTrendData = (issues) => {
  const resolvedIssues = issues.filter(i => i.status === 'resolved' && i.resolvedAt);
  
  const monthlyData = resolvedIssues.reduce((acc, issue) => {
    const month = format(new Date(issue.resolvedAt), 'MMM yyyy');
    const resolutionHours = (new Date(issue.resolvedAt) - new Date(issue.createdAt)) / (1000 * 60 * 60);
    
    if (!acc[month]) {
      acc[month] = { totalHours: 0, count: 0 };
    }
    acc[month].totalHours += resolutionHours;
    acc[month].count += 1;
    
    return acc;
  }, {});
  
  return Object.entries(monthlyData)
    .sort(([monthA], [monthB]) => new Date(monthA) - new Date(monthB))
    .map(([month, data]) => ({
      month,
      avgHours: Math.round(data.totalHours / data.count),
    }));
};

/**
 * Converts the raw issues array to a CSV string and triggers a download.
 * @param {Array} issues - The raw list of issues.
 */
export const exportIssuesToCSV = (issues) => {
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Category', 'Ward', 'Assigned Officer', 'Created At', 'Resolved At', 'Upvotes'];
  const rows = issues.map(issue => [
    issue._id,
    `"${issue.title.replace(/"/g, '""')}"`, // Handle commas in title
    issue.status,
    issue.priority,
    issue.category,
    issue.ward,
    issue.assignedOfficer,
    issue.createdAt,
    issue.resolvedAt || 'N/A',
    issue.upvotes
  ].join(','));

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `civic_issues_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
