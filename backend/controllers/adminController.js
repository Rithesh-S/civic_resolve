const Issue = require('../models/Issue');
const User = require('../models/User');
const Expense = require('../models/Expense');
const ExtensionRequest = require('../models/ExtensionRequest');
const Inventory = require('../models/Inventory');
const { assignOfficerToIssue } = require('../utils/officerAssignment');
const { sendNotification } = require('../utils/helpers');

const getAllIssues = async (req, res) => {
  try {
    const { issueId } = req.params;

    // ✅ If issueId is provided → return single issue
    if (issueId) {
      // if (!mongoose.Types.ObjectId.isValid(issueId)) {
      //   return res.status(400).json({ error: 'Invalid issueId' });
      // }

      const issue = await Issue.findById(issueId)
        .populate('assignedOfficerId', 'fullName officerProfile.roleTitle');

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      return res.json({ issue });
    }

    // ✅ Otherwise → return paginated list
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedOfficerId', 'fullName officerProfile.roleTitle');

    const total = await Issue.countDocuments(query);

    res.json({
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

const getFlaggedIssues = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const issues = await Issue.find({
      'status': 'flagged'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporterId', 'fullName email phone');
    
    const total = await Issue.countDocuments({ 'verification.status': 'flagged' });
    
    res.json({
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flagged issues' });
  }
};


const getAllOfficers = async (req, res) => {
  try {
    const { department, status, wardId, ulbId } = req.query;

    // Build dynamic query
    let query = { role: 'officer' };
    if (department) query['officerProfile.department'] = department;
    if (status) query['officerProfile.status'] = status;
    if (wardId) query['officerProfile.wardId'] = wardId;
    if (ulbId) query['officerProfile.ulbId'] = ulbId;

    const officers = await User.find(query)

    res.json({ officers });
  } catch (error) {
    console.error('Failed to fetch officers:', error);
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
};

const reviewFlaggedIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    if (issue.status !== 'flagged') {
      return res.status(400).json({ error: 'Issue is not flagged for review' });
    }
    
    if (action === 'approve') {
      issue.status = 'verified';
      
      // Add to status history
      issue.statusHistory.push({
        status: 'verified',
        updatedBy: req.user._id,
        timestamp: new Date(),
      });
      
      // Assign officer
      try {
        const officer = await assignOfficerToIssue(issue);
        issue.assignedOfficerId = officer._id;
        issue.status = 'acknowledged';
        
        issue.statusHistory.push({
          status: 'acknowledged',
          updatedBy: 'system',
          timestamp: new Date(),
        });
        
        // Send notification to officer
        await sendNotification(
          officer._id,
          'push',
          'New Issue Assigned',
          `You have been assigned a new issue: ${issue.title}`,
          issue._id
        );
      } catch (error) {
        console.error('Failed to assign officer:', error);
        // Continue even if assignment fails
      }
    } else if (action === 'reject') {
      issue.status = 'rejected';
      
      // Add to status history
      issue.statusHistory.push({
        status: 'rejected',
        updatedBy: req.user._id,
        timestamp: new Date(),
      });
      
      // Send notification to reporter
      await sendNotification(
        issue.reporterId,
        'push',
        'Issue Rejected',
        `Your issue "${issue.title}" has been rejected after review`,
        issue._id
      );
    }
    
    await issue.save();
    
    res.json({ 
      message: `Issue ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      status: issue.status
    });
  } catch (error) {
    console.log('Failed to review flagged issue:', error);
    res.status(500).json({ error: 'Failed to review issue' });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get pending expense requests
    const expenseRequests = await Expense.find({ status: 'requested' })
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('officerId', 'fullName')
      .populate('issueId', 'title');
    
    // Get pending extension requests
    const extensionRequests = await ExtensionRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('officerId', 'fullName')
      .populate('issueId', 'title');
    
    const totalExpenses = await Expense.countDocuments({ status: 'requested' });
    const totalExtensions = await ExtensionRequest.countDocuments({ status: 'pending' });
    
    res.json({
      expenseRequests,
      extensionRequests,
      pagination: {
        page,
        limit,
        totalExpenses,
        totalExtensions,
        pages: Math.ceil(Math.max(totalExpenses, totalExtensions) / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};

const approveExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    
    const expense = await Expense.findById(expenseId).populate('items.inventoryId');
    if (!expense) {
      return res.status(404).json({ error: 'Expense request not found' });
    }
    
    if (expense.status !== 'requested') {
      return res.status(400).json({ error: 'Expense request is not pending approval' });
    }
    
    // Check inventory availability and update
    for (const item of expense.items) {
      const inventory = await Inventory.findById(item.inventoryId);
      if (inventory.availableCount < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient quantity for ${inventory.name}. Available: ${inventory.availableCount}, Requested: ${item.quantity}` 
        });
      }
      
      // Reduce inventory count
      inventory.availableCount -= item.quantity;
      inventory.metadata.lastUpdated = new Date();
      await inventory.save();
    }
    
    // Update expense status
    expense.status = 'approved';
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
    
    await expense.save();
    
    // Send notification to officer
    await sendNotification(
      expense.officerId,
      'push',
      'Expense Approved',
      `Your expense request for issue has been approved`,
      expense.issueId
    );
    
    res.json({ message: 'Expense approved successfully', expense });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve expense' });
  }
};

const rejectExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense request not found' });
    }
    
    if (expense.status !== 'requested') {
      return res.status(400).json({ error: 'Expense request is not pending approval' });
    }
    
    // Update expense status
    expense.status = 'rejected';
    
    await expense.save();
    
    // Send notification to officer
    await sendNotification(
      expense.officerId,
      'push',
      'Expense Rejected',
      `Your expense request has been rejected.`,
      expense.issueId
    );
    
    res.json({ message: 'Expense rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject expense' });
  }
};

const approveExtension = async (req, res) => {
  try {
    const { extensionId } = req.params;
    
    const extension = await ExtensionRequest.findById(extensionId).populate('issueId');
    if (!extension) {
      return res.status(404).json({ error: 'Extension request not found' });
    }
    
    if (extension.status !== 'pending') {
      return res.status(400).json({ error: 'Extension request is not pending approval' });
    }
    
    // Update extension status
    extension.status = 'approved';
    extension.reviewedBy = req.user._id;
    extension.reviewedAt = new Date();
    
    await extension.save();
    
    // Update issue SLA due date
    const issue = await Issue.findById(extension.issueId);
    issue.slaDueDate = extension.requestedUntil;
    
    // Add to status history
    issue.statusHistory.push({
      status: 'SLA extended',
      updatedBy: req.user._id,
      timestamp: new Date(),
    });
    
    await issue.save();
    
    // Send notification to officer
    await sendNotification(
      extension.officerId,
      'push',
      'Extension Approved',
      `Your extension request for issue has been approved`,
      extension.issueId
    );
    
    res.json({ message: 'Extension approved successfully', extension });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve extension' });
  }
};

const rejectExtension = async (req, res) => {
  try {
    const { extensionId } = req.params;
    
    const extension = await ExtensionRequest.findById(extensionId);
    if (!extension) {
      return res.status(404).json({ error: 'Extension request not found' });
    }
    
    if (extension.status !== 'pending') {
      return res.status(400).json({ error: 'Extension request is not pending approval' });
    }
    
    // Update extension status
    extension.status = 'rejected';
    extension.reviewedBy = req.user._id;
    extension.reviewedAt = new Date();
    
    await extension.save();
    
    // Send notification to officer
    await sendNotification(
      extension.officerId,
      'push',
      'Extension Rejected',
      `Your extension request has been rejected.`,
      extension.issueId
    );
    
    res.json({ message: 'Extension rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject extension' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    // Get counts for different issue statuses
    const statusCounts = await Issue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get counts for different categories
    const categoryCounts = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get resolution rate (resolved issues / total issues)
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: { $in: ['resolved', 'closed'] } });
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;
    
    // Get average resolution time
    const resolvedWithTime = await Issue.aggregate([
      {
        $match: {
          resolvedAt: { $exists: true },
          createdAt: { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ]);
    
    const avgResolutionTime = resolvedWithTime.length > 0 ? resolvedWithTime[0].avgResolutionTime : 0;
    
    res.json({
      statusCounts,
      categoryCounts,
      resolutionRate: Math.round(resolutionRate * 100) / 100,
      avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60 * 60 * 24) * 100) / 100 // Convert to days
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

const getAllData = async (req, res) => {
  try {
    const [users, issues, inventories, extensionRequests, expenses] = await Promise.all([
      User.find({}).lean(),      
      Issue.find({}).lean(),
      Inventory.find({}).lean(),
      ExtensionRequest.find({}).lean(),
      Expense.find({}).lean()
    ]);

    // Consolidate all the fetched data into a single object
    const allData = {
      users,
      issues,
      inventories,
      extensionRequests,
      expenses
    };

    // Send the consolidated data as a JSON response
    res.status(200).json({
      success: true,
      message: 'All application data fetched successfully.',
      data: allData,
    });

  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred on the server while fetching data.'
    });
  }
};

module.exports = {
  getAllIssues,
  getAllOfficers,
  getFlaggedIssues,
  reviewFlaggedIssue,
  getPendingApprovals,
  approveExpense,
  rejectExpense,
  approveExtension,
  rejectExtension,
  getDashboardStats,
  getAllData
}