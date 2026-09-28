const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  getAllIssues,
  getFlaggedIssues,
  reviewFlaggedIssue,
  getPendingApprovals,
  approveExpense,
  rejectExpense,
  approveExtension,
  rejectExtension,
  getDashboardStats,
  getAllOfficers,
  getAllData
} = require('../controllers/adminController');

// Apply auth middleware to all routes
router.use(auth);
router.use(requireRole(['admin']));

router.get('/issues', getAllIssues);
router.get('/officers', getAllOfficers);
router.get('/issues/flagged', getFlaggedIssues);
router.get('/issues/:issueId', getAllIssues); 
router.post('/issues/:issueId/review', reviewFlaggedIssue);
router.get('/approvals/pending', getPendingApprovals);
router.post('/expenses/:expenseId/approve', approveExpense);
router.post('/expenses/:expenseId/reject', rejectExpense);
router.post('/extensions/:extensionId/approve', approveExtension);
router.post('/extensions/:extensionId/reject', rejectExtension);
router.get('/dashboard/stats', getDashboardStats);
router.get('/data/all',getAllData);

module.exports = router;