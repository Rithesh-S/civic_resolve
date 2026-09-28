// This file assumes your existing verification functions are in a separate utility
// I've placed placeholder imports here. Adjust the path as needed.
const { verifyImage, blurAndOverwriteImage, checkRelevance } = require('./imageVerification'); // ADJUST PATH
const { downloadWhatsappMedia } = require('./whatsappService');
const fs = require('fs');

function mapIssueToCategory(issue) {
    if (!issue) return 'Parks'; // Default category
    const lowerIssue = issue.toLowerCase();
    if (lowerIssue.includes('damaged roads') || lowerIssue.includes('potholes')) return 'Roads';
    if (lowerIssue.includes('garbage') || lowerIssue.includes('sanitation') || lowerIssue.includes('waste')) return 'Sanitation';
    if (lowerIssue.includes('light') || lowerIssue.includes('lamp') || lowerIssue.includes('streetlight')) return 'Streetlight';
    if (lowerIssue.includes('water') || lowerIssue.includes('leak')) return 'Waterleakage';
    return 'Parks';
}

async function analyzeCivicImage(mediaId) {
    let tempImagePath = null;
    try {
        const { tempImagePath: downloadedPath, mediaUrl } = await downloadWhatsappMedia(mediaId);
        tempImagePath = downloadedPath;

        const initialVerification = await verifyImage(tempImagePath, mediaUrl);
        const analysisResult = await blurAndOverwriteImage(tempImagePath); // This contains infrastructure_issues

        const infraIssues = analysisResult.infrastructure_issues || {};
        const identifiedIssues = Object.keys(infraIssues).filter(key => infraIssues[key]);

        const mainIssue = identifiedIssues.length > 0 ? identifiedIssues[0] : 'Uncategorized Civic Issue';
        
        const category = mapIssueToCategory(mainIssue);
        const title = `${mainIssue.charAt(0).toUpperCase() + mainIssue.slice(1)}`;
        const description = `An issue related to "${mainIssue}" was reported via WhatsApp. AI analysis details are attached.`;

        const relevance = checkRelevance(category, description, infraIssues);

        if(!relevance.isRelevant) {
            if (tempImagePath && fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);    
            return { success: false, errorMessage: 'Image content is not relevant.', verification: { confidenceScore: 0 } };
        }

        let finalScore = initialVerification.confidenceScore;

        if(relevance.checks.categoryMatch) finalScore += 0.2;
        if(relevance.checks.descriptionMatch) finalScore += 0.1;
        if(relevance.checks.categoryMismatch) finalScore -= 0.2;
        if(relevance.checks.aiDetectedNothing) finalScore -= 0.05;

        const verificationData = {
            confidenceScore: Math.max(0, Math.min(1, finalScore)),
            checks: {
                exif: initialVerification.exifResult,
                aiGenerated: initialVerification.aiResult,
                apiAnalysis: analysisResult,
                relevance: relevance,
            },
        };

        return {
            success: true,
            title,
            description,
            category,
            mediaUrl,
            verification: verificationData,
        };
    } catch (error) {
        console.error("Error during image analysis:", error);
        if (tempImagePath && fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
        return { success: false, errorMessage: error.message, verification: { confidenceScore: 0 } };
    }
}

module.exports = { analyzeCivicImage };
