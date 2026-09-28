const User = require('../models/User');

const activeSessions = {};

const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, preferredLanguage, officerProfile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or phone' });
    }

    let finalOfficerProfile = null;
    // If the role is 'officer', format the location data
    if (role === 'officer' && officerProfile) {
      const coords = officerProfile.location.split(',').map(Number);
      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
          return res.status(400).json({ error: 'Invalid location format. Use "longitude,latitude".' });
      }
      
      finalOfficerProfile = {
        ...officerProfile,
        location: {
          type: 'Point',
          coordinates: [coords[0], coords[1]] // [longitude, latitude]
        }
      };
    }

    const user = new User({
      fullName,
      email,
      phone,
      passwordHash: password, 
      role,
      preferredLanguage,
      officerProfile: finalOfficerProfile
    });

    await user.save();

    const sessionId = Math.random().toString(36).substring(2);
    activeSessions[sessionId] = user._id.toString(); // Your session logic

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      sessionId
    });
  } catch (error) {
    console.error(error); // Log the actual error for debugging
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    // Note: 'location' is now destructured from the body
    const { phone, password, location } = req.body;
    
    // Find user
    const user = await User.findOne({ phone });

    if (!user || user.passwordHash !== password) { // In production, verify hashed password
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If the user is an officer AND a new location is provided, update it
    if (user.role === 'officer' && location) {
      const coords = location.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        user.officerProfile.location = {
          type: 'Point',
          coordinates: [coords[0], coords[1]] // [longitude, latitude]
        };
        await user.save(); // Save the updated user document
      }
    }
    
    // Create session
    const sessionId = Math.random().toString(36).substring(2);
    activeSessions[sessionId] = user._id.toString(); // Your session logic
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        // Optionally return the latest location
        location: user.role === 'officer' ? user.officerProfile.location : undefined,
        department: user.role === 'officer' ? user.officerProfile.department : undefined,
        officerCode: user.role === 'officer' ? user.officerProfile.officerCode : undefined
      },
      sessionId
    });
  } catch (error) {
    console.error(error); // Log the actual error for debugging
    res.status(500).json({ error: 'Login failed' });
  }
};

const logout = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (sessionId && activeSessions[sessionId]) {
      delete activeSessions[sessionId];
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        preferredLanguage: req.user.preferredLanguage,
        officerProfile: req.user.officerProfile
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile
};