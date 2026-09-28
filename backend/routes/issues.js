const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getIssues,
  getIssueById,
  getIssuesByLocation
} = require('../controllers/issueController');

router.use(auth);

router.get('/', getIssues);
router.get('/location', getIssuesByLocation);
router.get('/:issueId', getIssueById);

module.exports = router;