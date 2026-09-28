const Issue = require('../models/Issue');

const getIssues = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      priority, 
      wardId, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = parseInt(priority);
    if (wardId) filter.wardId = wardId;
    
    // For officers, only show issues in their ward/department
    if (req.user.role === 'officer' && req.user.officerProfile) {
      filter.wardId = req.user.officerProfile.wardId;
      filter.category = { $in: getCategoriesForDepartment(req.user.officerProfile.department) };
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const issues = await Issue.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('reporterId', 'fullName')
      .populate('assignedOfficerId', 'fullName officerProfile');
    
    const total = await Issue.countDocuments(filter);
    
    res.json({
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { issueId } = req.params;
    
    const issue = await Issue.findById(issueId)
      .populate('reporterId', 'fullName email phone')
      .populate('assignedOfficerId', 'fullName officerProfile');
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    res.json({ issue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
};

const getIssuesByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.query; // radius in meters
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      },
      status: { $nin: ['resolved', 'closed', 'rejected'] }
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('reporterId', 'fullName');
    
    res.json({ issues });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues by location' });
  }
};

// Helper function to get categories for a department
const getCategoriesForDepartment = (department) => {
  const departmentCategories = {
    'Public Works': ['Roads', 'Waterleakage'],
    'Sanitation': ['Sanitation'],
    'Electrical': ['Streetlight'],
    'Horticulture': ['Parks']
  };
  
  return departmentCategories[department] || [];
};

module.exports = {
  getIssues,
  getIssueById,
  getIssuesByLocation
};