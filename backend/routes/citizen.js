const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { issueValidation } = require('../middleware/validation');
const { uploadImage, uploadAudio, handleMulterError } = require('../middleware/upload');
const {
  reportIssue,
  getMyIssues,
  upvoteIssue,
  provideFeedback,
  getUpvotedIssues,
  getUserData
} = require('../controllers/citizenController');

// Apply auth middleware to all routes
router.use(auth);
router.use(requireRole(['citizen']));

// Report a new issue with multiple media files
router.post('/issues', 
  (req, res, next) => {
    // Handle multiple uploads - both images and audio
    const upload = uploadImage.fields([
      { name: 'images', maxCount: 5 },
      { name: 'audio', maxCount: 2 }
    ]);
    
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  handleMulterError,
  validate(issueValidation.create),
  reportIssue
);

router.get('/issues', getMyIssues);
router.get('/upvoted-issues', getUpvotedIssues)
router.post('/issues/:issueId/upvote', upvoteIssue);
router.post('/issues/:issueId/feedback', validate(issueValidation.feedback), provideFeedback);
router.get('/data/all', getUserData);

module.exports = router;