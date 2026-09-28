// src/services/authService.js
// Mock authentication service - will be replaced with real API calls

// Mock user database
const mockUsers = [
  {
    _id: 'user1',
    fullName: 'Admin User',
    email: 'admin@jharkhand.gov.in',
    phone: '+919876543210',
    password: 'admin123', // In real app, this would be hashed
    role: 'admin',
    preferredLanguage: 'en',
    createdAt: '2023-01-15T00:00:00.000Z',
    updatedAt: '2023-06-20T00:00:00.000Z',
  },
  {
    _id: 'user2',
    fullName: 'Rajesh Kumar',
    email: 'officer@jharkhand.gov.in',
    phone: '+919876543211',
    password: 'officer123', // In real app, this would be hashed
    role: 'officer',
    officerProfile: {
      officerCode: 'OFF-001',
      ulbId: 'ulb1',
      wardId: 'ward1',
      department: 'Public Works',
      roleTitle: 'JE',
      supervisorId: 'user3',
      status: 'active',
    },
    preferredLanguage: 'hi',
    createdAt: '2023-02-10T00:00:00.000Z',
    updatedAt: '2023-06-20T00:00:00.000Z',
  }
];

// Simulate API delay
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 1000));

export const authService = {
  // Login function
  async login(credentials) {
    await simulateApiDelay();
    
    const { email, password } = credentials;
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Remove password from user object before returning
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Logout function
  async logout() {
    await simulateApiDelay();
    return { success: true };
  },

  // Password reset request
  async requestPasswordReset(email) {
    await simulateApiDelay();
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    
    return { success: true, message: 'Password reset instructions sent to email' };
  },

  // Verify token (for protected routes)
  async verifyToken() {
    await simulateApiDelay();
    
    // In a real app, this would verify JWT token
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found');
    }
    
    // Mock token verification - in real app, this would decode and verify JWT
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      throw new Error('Invalid token');
    }
    
    return userData;
  },

  // Update user profile
  async updateProfile(userId, updates) {
    await simulateApiDelay();
    
    const userIndex = mockUsers.findIndex(u => u._id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user data
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates, updatedAt: new Date().toISOString() };
    
    const { password: _, ...updatedUser } = mockUsers[userIndex];
    return updatedUser;
  },

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    await simulateApiDelay();
    
    const user = mockUsers.find(u => u._id === userId);
    if (!user || user.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    
    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
    
    return { success: true, message: 'Password updated successfully' };
  }
};

export default authService;