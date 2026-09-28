const Issue = require('../models/Issue');
const User = require('../models/User');
const Expense = require('../models/Expense');
const ExtensionRequest = require('../models/ExtensionRequest');
const Inventory = require('../models/Inventory');
const { sendNotification, triggerIvrNotification } = require('../utils/helpers');

const getAssignedIssues = async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { assignedOfficerId: req.user._id };
    if (status) {
      filter.status = status;
    }
    
    const issues = await Issue.find(filter)
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporterId', 'fullName phone');
    
    const total = await Issue.countDocuments(filter);
    
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
    res.status(500).json({ error: 'Failed to fetch assigned issues' });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, notes } = req.body;
    
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    // Check if the officer is assigned to this issue
    if (issue.assignedOfficerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this issue' });
    }
    
    // Validate status transition
    const validTransitions = {
      'acknowledged': ['in_progress'],
      'in_progress': ['resolved'],
      'resolved': ['closed']
    };
    
    if (!validTransitions[issue.status] || !validTransitions[issue.status].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }
    
    // Update status
    issue.status = status;
    
    // Add to status history
    issue.statusHistory.push({
      status,
      updatedBy: req.user._id,
      timestamp: new Date(),
      notes
    });
    
    // Set timestamps for specific status changes
    if (status === 'in_progress') {
      issue.acknowledgedAt = new Date();
    } else if (status === 'resolved') {
      triggerIvrNotification(issue._id);
      issue.resolvedAt = new Date();
    }
    
    await issue.save();
    
    // Send notification to reporter
    await sendNotification(
      issue.reporterId,
      'push',
      'Issue Status Updated',
      `Your issue "${issue.title}" status has been updated to ${status}`,
      issue._id
    );
    
    res.json({ message: 'Issue status updated successfully', status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update issue status' });
  }
};

const uploadProof = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { role } = req.body;
    
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    // Check if the officer is assigned to this issue
    if (issue.assignedOfficerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this issue' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Proof file is required' });
    }
    
    const proofUrl = `/uploads/proofs/${req.file.filename}`;
    
    issue.media.push({
      url: proofUrl,
      type: 'image',
      role: role || 'after'
    });
    
    await issue.save();
    
    res.json({ message: 'Proof uploaded successfully', media: proofUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload proof' });
  }
};

const requestResources = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { items } = req.body;
    
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    // Check if the officer is assigned to this issue
    if (issue.assignedOfficerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to request resources for this issue' });
    }
    
    // Prepare expense items with costs
    const expenseItems = await Promise.all(
      items.map(async (item) => {
        const inventoryItem = await Inventory.findById(item.inventoryId);
        if (!inventoryItem) {
          throw new Error(`Inventory item ${item.inventoryId} not found`);
        }
        
        if (inventoryItem.availableCount < item.quantity) {
          throw new Error(`Insufficient quantity for ${inventoryItem.name}`);
        }
        
        return {
          inventoryId: item.inventoryId,
          name: inventoryItem.name,
          quantity: item.quantity,
          unitCost: inventoryItem.unitCost,
          totalCost: item.quantity * inventoryItem.unitCost
        };
      })
    );
    
    // Create expense request
    const expense = new Expense({
      issueId,
      ulbId: req.user.officerProfile.ulbId,
      officerId: req.user._id,
      items: expenseItems,
      status: 'requested'
    });
    
    await expense.save();
    
    // Send notification to supervisor
    if (req.user.officerProfile.supervisorId) {
      await sendNotification(
        req.user.officerProfile.supervisorId,
        'push',
        'Resource Request',
        `${req.user.fullName} has requested resources for issue: ${issue.title}`,
        issue._id
      );
    }
    
    res.status(201).json({ message: 'Resource request submitted successfully', expense });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to request resources' });
  }
};

const requestExtension = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { requestedUntil, reason } = req.body;
    
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    // Check if the officer is assigned to this issue
    if (issue.assignedOfficerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to request extension for this issue' });
    }
    
    // Create extension request
    const extensionRequest = new ExtensionRequest({
      issueId,
      ulbId: req.user.officerProfile.ulbId,
      officerId: req.user._id,
      requestedUntil: new Date(requestedUntil),
      reason,
      status: 'pending'
    });
    
    await extensionRequest.save();
    
    // Send notification to supervisor
    if (req.user.officerProfile.supervisorId) {
      await sendNotification(
        req.user.officerProfile.supervisorId,
        'push',
        'Extension Request',
        `${req.user.fullName} has requested an extension for issue: ${issue.title}`,
        issue._id
      );
    }
    
    res.status(201).json({ message: 'Extension request submitted successfully', extensionRequest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request extension' });
  }
};

const getOfficerData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 2. Fetch all related data in parallel
    const [
      userProfile,
      assignedIssues,
      extensionRequests,
      expenses
    ] = await Promise.all([
      User.findById(userId).lean(),
      Issue.find({ assignedOfficerId: userId }).lean(),
      ExtensionRequest.find({ officerId: userId }).lean(),
      Expense.find({ officerId: userId }).lean()
    ]);

    // 3. Check if the user exists
    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 4. Consolidate all the user-specific data into a single object
    const userData = {
      userProfile,
      assignedIssues,
      extensionRequests,
      expenses
    };

    // 5. Send the consolidated data as a JSON response
    res.status(200).json({
      success: true,
      message: `All data for user ${userId} fetched successfully.`,
      data: userData,
    });

  } catch (error) {
    console.error(`Error fetching data:`, error);
    res.status(500).json({
      success: false,
      message: 'An error occurred on the server while fetching user data.'
    });
  }
};

module.exports = {
  getAssignedIssues,
  updateIssueStatus,
  uploadProof,
  requestResources,
  requestExtension,
  getOfficerData
};