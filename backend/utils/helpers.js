const Notification = require('../models/Notification');
const Issue = require('../models/Issue');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const axios = require('axios');
const ML_IP = process.env.ML_IP 

const getAdvancedPriority = async (location, problemType) => {
  try {

    if(ML_IP === "") { 
      console.warn('ML_IP is not set. Skipping advanced priority calculation.');
      return null;
    }

    const pythonApiUrl = `http://${ML_IP}:8000/prioritize-problems`; // <-- Use your actual API URL

    const payload = [{
      lat: location.coordinates[1],
      lng: location.coordinates[0],
      problem: problemType,
    }];

    const response = await axios.post(pythonApiUrl, payload);

    // The API returns a list, so we take the first result
    if (response.data && response.data.success && response.data.prioritized_problems.length > 0) {
      console.log('Successfully received advanced priority data from API.');
      return response.data.prioritized_problems[0];
    }

    console.warn('Advanced prioritization API returned no problems.');
    return null;
  } catch (error) {
    console.error('Failed to get advanced priority from Python API:', error.message);
    return null; // Return null to allow fallback to basic priority logic
  }
};

// Calculate SLA due date based on priority
const calculateSlaDueDate = (priority) => {
  const now = new Date();
  const slaDays = {
    1: 1, // Critical - 1 day
    2: 3, // High - 3 days
    3: 7, // Medium - 7 days
    4: 14, // Low - 14 days
    5: 30  // Very low - 30 days
  };
  
  const dueDate = new Date(now);
  dueDate.setDate(now.getDate() + slaDays[priority]);
  
  return dueDate;
};

// Determine priority based on various factors
const determinePriority = (category, upvotes = 0, advancedPriorityData = null) => {
  let priority;

  if (advancedPriorityData && typeof advancedPriorityData.priority_score === 'number') {
    // --- NEW: Use the advanced priority score (0-100) to set priority (1-5) ---
    const score = advancedPriorityData.priority_score;
    if (score >= 90) priority = 1;      // Critical
    else if (score >= 80) priority = 2; // High
    else if (score >= 60) priority = 3; // Medium
    else if (score >= 40) priority = 4; // Low
    else priority = 5;                  // Very Low
    console.log(`Priority set to ${priority} based on advanced score of ${score}.`);

  } else {
    // --- FALLBACK: Use the original category-based logic ---
    console.log('Falling back to basic priority logic.');
    const categoryPriority = {
      'Waterleakage': 2, 'Roads': 2,
      'Streetlight': 3, 'Sanitation': 3,
      'Parks': 4
    };
    priority = categoryPriority[category] || 5;
  }

  // --- Optional: Still allow upvotes to boost the priority ---
  if (upvotes > 10 && priority > 1) priority--;
  if (upvotes > 50 && priority > 1) priority--;

  return Math.max(1, priority); // Ensure priority is never less than 1
};

// Send notification 
const sendNotification = async (userId, channel, title, message, relatedIssueId = null) => {
  // In a real implementation, this would integrate with push notification services,
  // SMS gateways, or email services
  
  try {
    const notification = new Notification({
      userId,
      channel,
      title,
      message,
      relatedIssueId,
      isRead: false
    });
    
    await notification.save();
    
    // Here you would add actual delivery logic based on channel
    console.log(`Notification sent via ${channel}: ${title} - ${message}`);
    
    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

/**
 * Triggers an IVR notification call to the citizen who reported a specific issue.
 * @param {string} issueId The ID of the issue to notify the user about.
 * @returns {string} The Twilio Execution SID of the triggered flow.
 * @throws {Error} If the issue/user is not found or the API call fails.
 */
async function triggerIvrNotification(issueId) {
    console.log(`Attempting to trigger IVR notification for issue: ${issueId}`);

    // 1. Find the issue and the associated user's details
    const issue = await Issue.findById(issueId).populate('reporterId');

    // 2. Validate that we have all the necessary information
    if (!issue) {
        throw new Error(`Issue not found for ID: ${issueId}`);
    }
    if (!issue.reporterId || !issue.reporterId.phone) {
        throw new Error(`Reporter details or phone number missing for issue ID: ${issueId}`);
    }

    const citizenPhoneNumber = issue.reporterId.phone;
    const citizenName = issue.reporterId.fullName;
    const yourTwilioNumber = process.env.TWILIO_PHONE_NUMBER;
    const studioFlowSid = process.env.TWILIO_STUDIO_FLOW_SID;

    try {
        const execution = await client.studio.v2.flows(studioFlowSid)
            .executions
            .create({
                to: '+91'+citizenPhoneNumber,
                from: yourTwilioNumber,
                parameters: {
                    issueId: issue._id.toString(),
                    issueStatus: issue.status,
                    citizenName: citizenName,
                }
            });

        console.log(`Successfully triggered Studio Flow. Execution SID: ${execution.sid}`);
        
        return execution.sid;

    } catch (error) {
        console.error(`Failed to trigger Twilio Studio Flow for issue ${issueId}:`, error);
        throw new Error('Twilio API call failed.');
    }
}

module.exports = {
  calculateSlaDueDate,
  determinePriority,
  sendNotification,
  triggerIvrNotification,
  getAdvancedPriority
};