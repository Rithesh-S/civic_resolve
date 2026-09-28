const Issue = require('../models/Issue');
const { checkDuplicate } = require('../utils/duplicateCheck');
const { verifyImage, blurAndOverwriteImage, checkRelevance } = require('../utils/imageVerification');
const { determinePriority, calculateSlaDueDate, sendNotification, getAdvancedPriority } = require('../utils/helpers');
const { assignOfficerToIssue } = require('../utils/officerAssignment');
const { sendTextMessage } = require('../utils/whatsappService');
const User = require('../models/User');
const fs = require('fs').promises;

const reportIssue = async (req, res) => {
  const uploadedFiles = []; // Track uploaded file paths for cleanup
  let tempImagePath = null;

  try {
    const { title, description, category, location } = req.body;
    const reporterId = req.user._id;
    const locationParsed = JSON.parse(location);

    let issueData = {
      reporterId,
      ulbId: req.user.ulbId || 'defaultUlbId',
      channel: req.body.channel || 'app',
      title,
      description,
      category,
      location: { type: 'Point', coordinates: locationParsed.coordinates },
      media: [],
      verification: {}, // Initialize verification object
    };

    const user = await User.findById(reporterId).select('phone');

    /** ------------------ 1. INITIAL MEDIA HANDLING ------------------ */
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res.status(400).json({ success: false, error: 'An image is required to report an issue.' });
    }

    const imageFile = req.files.images[0];
    tempImagePath = imageFile.path; 
    uploadedFiles.push(tempImagePath);
    const mediaUrl = `/uploads/images/${imageFile.filename}`;
    issueData.media.push({ url: mediaUrl, type: 'image', role: 'evidence' });

    res.status(201).json({ success: true, message: 'Image received and is under verification. Soon You will be notified!' });

    /** ------------------ 2. IMAGE VERIFICATION & ANALYSIS ------------------ */
    // Step 2a: Local EXIF and AI-generation check
    const initialVerification = await verifyImage(tempImagePath, mediaUrl);
    console.log('Initial verification result:', initialVerification);


    // Step 2b: External analysis for blurring and content classification
    const analysisResult = await blurAndOverwriteImage(tempImagePath);
    console.log('External analysis result:', analysisResult);
    if (analysisResult.result === 'error') {
      console.warn('Blurring API failed, proceeding with unblurred image.');
    }

    // Step 2c: Check relevance of user input vs. AI classification
    const relevance = checkRelevance(category, description, analysisResult.infrastructure_issues);
    console.log('Relevance check result:', relevance);

    if (!relevance.isRelevant) {
      await sendNotification(
        reporterId,
        'push',
        'Spam detected',
        `Your report for "${title}" is considered spam.`,
        null
      );
      // await sendTextMessage('91'+user.phone, 
      //   `🚨 Spam detected: Your report for "${title}" was rejected as spam. Please report only relevant issues.`
      // );
      await cleanupFiles(uploadedFiles);
      return;
    }

    // Step 2d: Combine all verification steps into a final score
    let finalScore = initialVerification.confidenceScore;

    // if(relevance.checks.categoryMatch) finalScore += 0.2;
    // if(relevance.checks.descriptionMatch) finalScore += 0.1;
    if(relevance.checks.categoryMismatch) finalScore -= 0.2;
    if(relevance.checks.aiDetectedNothing) finalScore -= 0.05;

    issueData.verification = {
      confidenceScore: Math.max(0, Math.min(1, finalScore)), // Clamp score between 0 and 1
      checks: {
        exif: initialVerification.exifResult,
        aiGenerated: initialVerification.aiResult,
        apiAnalysis: analysisResult,
        relevance: relevance,
      },
    };

    /** ------------------ 3. DUPLICATE CHECK ------------------ */
    const duplicateCheck = await checkDuplicate(issueData);
    console.log('Duplicate check result:', duplicateCheck);

    if (duplicateCheck.isDuplicate) {
      await cleanupFiles(uploadedFiles);

      const issue = await Issue.findById(duplicateCheck.duplicateOf);
      if (!issue) return res.status(404).json({ error: 'Original issue not found' });

      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user.upvotedIssues.includes(issue._id)) {
        issue.upvote += 1;
        const newPriority = determinePriority(issue.category, issue.upvote);
        if (newPriority !== issue.priority) {
          issue.priority = newPriority;
          issue.slaDueDate = calculateSlaDueDate(newPriority);
        }
        await issue.save();

        user.upvotedIssues.push(issue._id);
        await user.save();
      }

      await sendNotification(
        reporterId,
        'push',
        'Issue is a Duplicate',
        `Your report for "${title}" was a duplicate. We've added your report as an upvote to the existing issue.`,
        issue._id
      );

      // await sendTextMessage('91'+user.phone, 
      //   `⚠️ Duplicate Report: Your report for "${title}" was already filed. We've added your upvote to the existing issue.`
      // );

      return;
    }

    /** ------------------ NEW: ADVANCED PRIORITY CALCULATION ------------------ */
    // Call the Python API to get location-aware priority details
    const advancedPriorityData = await getAdvancedPriority(issueData.location, issueData.category);
    
    // Store the detailed response in your issue document for later reference
    // issueData.priorityDetails = advancedPriorityData;

    /** ------------------ 4. PRIORITY & STATUS ------------------ */

    issueData.priority = determinePriority(category, 0, advancedPriorityData);
    issueData.slaDueDate = calculateSlaDueDate(issueData.priority);
    
    const score = issueData.verification.confidenceScore;
    if (score > 0.75) {
      issueData.status = 'verified';
    } else if (score > 0.4) {
      issueData.status = 'flagged'; // Needs manual review
    } else {
      await cleanupFiles(uploadedFiles);
      await sendNotification(
        reporterId,
        'push',
        'Issue Rejected',
        `Your report for "${title}" was rejected due to a low confidence score (${(score * 100).toFixed(0)}%).`,
        null // No issue ID to link to
      );

      // await sendTextMessage('91'+user.phone, 
      //   `❌ Issue Rejected: Your report for "${title}" was rejected due to low verification score.`
      // );

      return;
    }

    /** ------------------ 5. CREATE ISSUE ------------------ */
    const issue = new Issue(issueData);
    issue.statusHistory.push({ status: issue.status, updatedBy: 'system', timestamp: new Date() });
    await issue.save();

    /** ------------------ 6. AUTO-ASSIGN OFFICER ------------------ */
    if (issue.status === 'verified') {
      try {
        const officer = await assignOfficerToIssue(issue);
        issue.assignedOfficerId = officer._id;
        issue.status = 'acknowledged';
        issue.statusHistory.push({ status: 'acknowledged', updatedBy: 'system', timestamp: new Date() });
        await issue.save();

        await sendNotification(
          officer._id,
          'push',
          'New Issue Assigned',
          `You have been assigned a new issue: ${issue.title}`,
          issue._id
        );
      } catch (err) {
        console.error('Officer assignment failed:', err.message);
        // The issue is still created, but will require manual assignment.
      }
    }

    /** ------------------ 7. FINAL NOTIFICATION TO CITIZEN ------------------ */
    await sendNotification(
      reporterId,
      'push',
      'Issue Successfully Created!',
      `Your issue report for "${issue.title}" has been successfully created with status: ${issue.status}.`,
      issue._id
    );

    // await sendTextMessage('91'+user.phone, 
    //   `✅ Success: Your issue "${issue.title}" has been created with status "${issue.status}".`
    // );

  } catch (err) {
    console.error('Error in reportIssue controller:', err);
    await cleanupFiles(uploadedFiles); // Ensure cleanup on any failure

     if (req.user && req.user._id) {
      await sendNotification(
        req.user._id,
        'push',
        'Processing Failed',
        'An unexpected server error occurred while processing your issue report. Please try again.',
        null
      );
    }
  }
};

/** ------------------ HELPER: Cleanup uploaded files ------------------ */
async function cleanupFiles(files) {
  for (const filePath of files) {
    try {
      await fs.unlink(filePath);
      console.log(`Deleted leftover file: ${filePath}`);
    } catch (err) {
      console.error(`Failed to delete file ${filePath}:`, err.message);
    }
  }
}

const getMyIssues = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Start with a base query to find issues for the logged-in user.
    let query = { reporterId: req.user._id };

    // If fetchAll=true is in the URL, change the query to fetch all documents.
    if (req.query.fetchAll === 'true') {
      query = {}; // An empty query object matches all documents
    }

    // Use the dynamic query object in both database calls
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
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch issues:', error); 
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

const upvoteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.user._id; // assuming you set req.user from auth middleware

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // ✅ Check if user already upvoted this issue
    const user = await User.findById(userId);
    if (user.upvotedIssues.includes(issueId)) {
      return res.status(400).json({ error: 'You already upvoted this issue' });
    }

    // Increment upvote count
    issue.upvote += 1;

    // Adjust priority based on upvotes
    const newPriority = determinePriority(issue.category, issue.upvote, 0);
    if (newPriority !== issue.priority) {
      issue.priority = newPriority;
      issue.slaDueDate = calculateSlaDueDate(newPriority);
    }

    // Save both
    await issue.save();
    user.upvotedIssues.push(issueId);
    await user.save();

    res.json({ 
      message: 'Issue upvoted successfully', 
      upvotes: issue.upvote 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upvote issue' });
  }
};

const getUpvotedIssues = async (req, res) => {
  try {
    const userId = req.user._id; // assuming auth middleware sets req.user
    const user = await User.findById(userId).populate({
      path: 'upvotedIssues',
      model: 'Issue',
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      upvotedIssues: user.upvotedIssues
    });
  } catch (error) {
    console.error('Error fetching upvoted issues:', error);
    res.status(500).json({ error: 'Failed to fetch upvoted issues' });
  }
};

const provideFeedback = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { rating, comment } = req.body;
    
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    // Check if the user is the reporter of this issue
    if (issue.reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to provide feedback for this issue' });
    }
    
    // Check if issue is resolved or closed
    if (!['resolved', 'closed'].includes(issue.status)) {
      return res.status(400).json({ error: 'Feedback can only be provided for resolved issues' });
    }
    
    issue.citizenFeedback = {
      rating,
      comment
    };
    
    await issue.save();
    
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 2. Fetch all related data in parallel
    const [
      userProfile,
      reportedIssues,
    ] = await Promise.all([
      User.findById(userId).lean(),
      Issue.find({ reporterId: userId })
      .populate({
          path: 'assignedOfficerId',
          select: 'fullName role officerProfile.roleTitle officerProfile.department' // Select specific fields
      })
      .lean()
    ]);

    // 3. Check if the user exists
    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 4. Consolidate all the user-specific data into a single object
    const userData = {
      userProfile,
      reportedIssues
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
  reportIssue,
  getMyIssues,
  upvoteIssue,
  provideFeedback,
  getUpvotedIssues,
  getUserData,
};