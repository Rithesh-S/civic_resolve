const User = require('../models/User');
const Issue = require('../models/Issue');

// Calculate officer workload (number of active issues)
const calculateWorkload = async (officerId) => {
  const activeIssues = await Issue.countDocuments({
    assignedOfficerId: officerId,
    status: { $in: ['acknowledged', 'in_progress'] }
  });
  return activeIssues;
};

// Find nearest officers to issue location
const findNearestOfficers = async (location, department, limit = 5) => {

    const nearbyOfficers = await User.aggregate([
    {
        $geoNear: {
        near: { type: 'Point', coordinates: location },
        distanceField: 'distance',
        spherical: true,
        key: 'officerProfile.location',
        query: {
            role: 'officer',
            'officerProfile.status': 'active'
        }
        }
    },
    { $match: { 'officerProfile.department': department } },
    { $sort: { distance: 1 } },
    { $limit: limit }
    ]);

    return nearbyOfficers;
};

// Assign officer to issue based on multiple factors
const assignOfficerToIssue = async (issue) => {
  const { category, location, priority } = issue;
  
  // Map issue category to department
  const categoryToDepartment = {
    'Roads': 'Public Works',
    'Sanitation': 'Sanitation',
    'Streetlight': 'Electrical',
    'Waterleakage': 'Public Works',
    'Parks': 'Horticulture'
  };

  const department = categoryToDepartment[category];
  
  // Find nearest officers in the relevant department
  const potentialOfficers = await findNearestOfficers(location.coordinates, department, 10);
  
  if (potentialOfficers.length === 0) {
    throw new Error('No available officers in this department');
  }
  
  // Calculate workload for each officer and create a score
  const officersWithScores = await Promise.all(
    potentialOfficers.map(async (officer) => {
      const workload = await calculateWorkload(officer._id);
      const distance = officer.distance;
      
      // Score calculation (lower is better)
      // Adjust weights based on your priorities
      const workloadWeight = 0.6;
      const distanceWeight = 0.4;
      
      const score = (workload * workloadWeight) + (distance * distanceWeight);
      
      return {
        officer: officer,
        workload,
        distance,
        score
      };
    })
  );
  
  // Sort by score (lowest score first)
  officersWithScores.sort((a, b) => a.score - b.score);
  
  // Return the best candidate
  return officersWithScores[0].officer;
};

module.exports = {
  assignOfficerToIssue
};