const whatsappService = require('../utils/whatsappService');
const imageAnalysisService = require('../utils/imageAnalysisService');
const issueService = require('../utils/issueService');
const { getAdvancedPriority } = require('../utils/helpers');
const User = require('../models/User'); // IMPORTANT: Make sure your User model is correctly referenced

/**
 * State manager for tracking user conversations.
 * WARNING: This is an in-memory object. It will be cleared if your server restarts.
 * For production, you MUST replace this with a persistent solution like Redis or a database table.
 */
const userState = {};

/**
 * Handles the initial webhook verification request from Meta.
 */
const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
};

/**
 * Main handler for all incoming WhatsApp messages.
 */
const handleWhatsappMessage = async (req, res) => {
    // Respond immediately to Meta to acknowledge receipt
    res.sendStatus(200);

    try {
        const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        if (!msg) return;

        const userPhoneNumber = msg.from;
        const messageType = msg.type;

        const userPhoneNumberTrim = msg.from.replace(/^(\+91|91)/, '');
        
        // Find the user in your database by their phone number
        const user = await User.findOne({ phone: userPhoneNumberTrim });
        if (!user) {
            await whatsappService.sendTextMessage(userPhoneNumber, "Welcome! To report issues, please first register on our app or website.");
            return;
        }

        if (messageType === 'image') {
            await processImageMessage(user, msg);
        } else if (messageType === 'location' && userState[userPhoneNumber]?.status === 'awaiting_location') {
            await processLocationMessage(user, msg);
        } else {
            await whatsappService.sendTextMessage(userPhoneNumber, "Hello! To report a new issue, please send a clear photo of the problem.");
        }

    } catch (error) {
        console.error("Failed to process WhatsApp message:", error);
        // Optional: Send an error message back to the user
    }
};

/**
 * Handles the first step of the flow: receiving and analyzing an image.
 */
async function processImageMessage(user, msg) {
    const { from: userPhoneNumber, image } = msg;

    try {
        await whatsappService.sendTextMessage(userPhoneNumber, "Thank you! We've received your image and are analyzing it now. This may take a moment...");
        
        const analysisResult = await imageAnalysisService.analyzeCivicImage(image.id);

        if (!analysisResult.success) {
            await whatsappService.sendTextMessage(userPhoneNumber, `Sorry, your image could not be processed. Reason: ${analysisResult.errorMessage}`);
            return;
        }

        if (analysisResult.verification.confidenceScore < 0.4) {
            const reason = `Low confidence score (${(analysisResult.verification.confidenceScore * 100).toFixed(0)}%).`;
            await whatsappService.sendTextMessage(userPhoneNumber, `Sorry, your image could not be verified. Reason: ${reason}`);
            return;
        }

        // Store the validated data and set the user's state to await location
        userState[userPhoneNumber] = {
            status: 'awaiting_location',
            title: analysisResult.title,
            description: analysisResult.description,
            category: analysisResult.category,
            mediaUrl: analysisResult.mediaUrl,
            verification: analysisResult.verification,
            reporterId: user._id,
            ulbId: user.ulbId || 'defaultUlbId',
        };

        const locationRequestMessage = `
✅ Problem identified: *${analysisResult.title}*

The following problem is found in the image. Can you kindly share your location to proceed?
---
समस्या की पहचान हो गई है: *${analysisResult.title}*

फोटो में निम्नलिखित समस्या पाई गई है। कृपया आगे बढ़ने के लिए अपना लोकेशन साझा करें।
        `;
        await whatsappService.sendTextMessage(userPhoneNumber, locationRequestMessage.trim());

    } catch (error) {
        console.error("Error in processImageMessage:", error);
        await whatsappService.sendTextMessage(userPhoneNumber, "An error occurred while analyzing your image. Please try again.");
    }
}

/**
 * Handles the second step: receiving location and creating the issue.
 */
async function processLocationMessage(user, msg) {
    const userPhoneNumber = msg.from;
    const { latitude, longitude } = msg.location;
    console.log(`Received location from ${userPhoneNumber}: (${latitude}, ${longitude})`);

    if (!userState[userPhoneNumber] || userState[userPhoneNumber].status !== 'awaiting_location') {
        await whatsappService.sendTextMessage(userPhoneNumber, "Please send an image of the issue first before sharing your location.");
        return;
    }

    const state = userState[userPhoneNumber];

    try {
        await whatsappService.sendTextMessage(userPhoneNumber, "Location received. Finalizing your report...");

        const issueData = {
            reporterId: state.reporterId,
            ulbId: state.ulbId,
            channel: 'whatsapp',
            title: state.title,
            description: state.description,
            category: state.category,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude], // GeoJSON format: [longitude, latitude]
            },
            media: [{ url: state.mediaUrl, type: 'image', role: 'evidence' }],
            verification: state.verification,
        };

        // Fetch advanced priority data based on location and category
        const advancedPriorityData = await getAdvancedPriority(issueData.location, issueData.category);
        issueData.priorityDetails = advancedPriorityData; // Attach it for the next step

        // Call the single service function to handle creation, duplicates, etc.
        const issue = await issueService.createAndProcessIssue(issueData);
        
        const successMessage = `
Thank you! Your issue has been successfully reported.
Issue ID: *${issue._id}*
Status: *${issue.status}*

---
धन्यवाद! आपकी समस्या सफलतापूर्वक दर्ज कर ली गई है।
समस्या आईडी: *${issue._id}*
स्थिति: *${issue.status}*
        `;
        await whatsappService.sendTextMessage(userPhoneNumber, successMessage.trim());

    } catch (error) {
        console.error("Error in processLocationMessage:", error);
        await whatsappService.sendTextMessage(userPhoneNumber, `Sorry, there was an error creating your issue: ${error.message}. Please try again later.`);
    } finally {
        // IMPORTANT: Clean up the state to allow the user to start a new report
        delete userState[userPhoneNumber];
    }
}

module.exports = {
    verifyWebhook,
    handleWhatsappMessage,
};
