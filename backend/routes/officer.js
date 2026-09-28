const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { extensionValidation, expenseValidation } = require('../middleware/validation');
const { uploadProof, handleMulterError } = require('../middleware/upload');
const {
  getAssignedIssues,
  updateIssueStatus,
  uploadProof: uploadProofController,
  requestResources,
  requestExtension
} = require('../controllers/officerController');
const { getOfficerExpenses } = require('../controllers/expenseController');

// Apply auth middleware to all routes
router.use(auth);
router.use(requireRole(['officer']));

router.get('/issues', getAssignedIssues);
router.patch('/issues/:issueId/status', updateIssueStatus);
router.post('/issues/:issueId/proof', 
  uploadProof.single('proof'),
  handleMulterError,
  uploadProofController
);
router.post('/issues/:issueId/expenses', validate(expenseValidation.create), requestResources);
router.post('/issues/:issueId/extensions', validate(extensionValidation.create), requestExtension);
router.get('/expenses', getOfficerExpenses);

module.exports = router;