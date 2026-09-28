export const transformDashboardStats = (apiData, contextData) => {
  const { issues, officers, inventoryRequests } = contextData;
  
  return {
    totalIssues: apiData?.totalIssues || issues.length,
    resolvedIssues: apiData?.resolvedIssues || 
      issues.filter(issue => ['resolved', 'closed'].includes(issue.status)).length,
    pendingIssues: issues.filter(issue => 
      ['submitted', 'verified', 'acknowledged', 'in_progress'].includes(issue.status)
    ).length,
    criticalIssues: issues.filter(issue => issue.priority === 1).length,
    activeOfficers: officers.filter(officer => 
      officer.officerProfile?.status === 'active'
    ).length,
    pendingRequests: inventoryRequests.filter(req => req.status === 'requested').length,
    resolutionRate: apiData?.resolutionRate || 0,
    avgResolutionTime: apiData?.avgResolutionTime || 0
  };
};

export const transformStatusData = (apiStatusCounts) => {
  if (!apiStatusCounts) return [];
  
  return apiStatusCounts.map(item => ({
    status: item._id,
    count: item.count
  }));
};

export const transformCategoryData = (apiCategoryCounts) => {
  if (!apiCategoryCounts) return [];
  
  return apiCategoryCounts.map(item => ({
    category: item._id,
    count: item.count
  }));
};