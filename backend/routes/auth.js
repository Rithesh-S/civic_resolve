const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { userValidation } = require('../middleware/validation');
const {
  register,
  login,
  logout,
  getProfile
} = require('../controllers/authController');

router.post('/register', validate(userValidation.register), register);
router.post('/login', validate(userValidation.login), login);
router.post('/logout', logout);
router.get('/profile', auth, getProfile);

module.exports = router;