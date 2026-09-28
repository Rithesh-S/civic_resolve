const Issue = require('../models/Issue'); // Your Mongoose model
const { determinePriority, calculateSlaDueDate } = require('./helpers'); // ADJUST PATH
const { checkDuplicate } = require('./duplicateCheck'); // ADJUST PATH
const { assignOfficerToIssue } = require('./officerAssignment'); // ADJUST PATH

async function createAndProcessIssue(issueData) {
    // 1. Check for duplicates
    const duplicateCheck = await checkDuplicate(issueData);
    if (duplicateCheck.isDuplicate) {
        console.log(`Duplicate issue detected. Original ID: ${duplicateCheck.duplicateOf}`);
    }
    
    // 2. Determine status based on confidence score (already checked for < 0.4 in controller)
    const score = issueData.verification.confidenceScore;
    issueData.status = (score > 0.75) ? 'verified' : 'flagged';

    // 3. Set priority and SLA using advanced data
    // The `priorityDetails` field is now passed in from the controller
    issueData.priority = determinePriority(issueData.category, 0, issueData.priorityDetails);
    issueData.slaDueDate = calculateSlaDueDate(issueData.priority);

    // 4. Create and save the issue
    const issue = new Issue(issueData);
    issue.statusHistory.push({ status: issue.status, updatedBy: 'system' });
    await issue.save();
    console.log(`New issue created via ${issueData.channel}: ${issue._id}`);

    // 5. Trigger auto-assignment for verified issues
    if (issue.status === 'verified') {
        try {
            await assignOfficerToIssue(issue);
        } catch (err) {
            console.error('Officer assignment failed for WhatsApp issue:', err.message);
        }
    }

    return issue;
}

module.exports = { createAndProcessIssue };
