const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function sendTextMessage(to, text) {
    try {
        await axios.post(
            `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                text: { body: text },
            },
            { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } }
        );
        console.log(`Message sent to ${to}`);
    } catch (error) {
        console.error("Error sending WhatsApp message:", error.response?.data || error.message);
        throw new Error("Failed to send WhatsApp reply.");
    }
}

async function downloadWhatsappMedia(mediaId) {
    try {
        // 1. Get media URL from Meta
        const urlResponse = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}`, {
            headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` },
        });
        const mediaUrl = urlResponse.data.url;

        // 2. Download the actual image file
        const imageResponse = await axios.get(mediaUrl, {
            headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` },
            responseType: 'stream',
        });

        // 3. Save it to a temporary local file for your analysis functions
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'images');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const localFilename = `${mediaId}.jpg`;
        const tempImagePath = path.join(uploadsDir, localFilename);
        const writer = fs.createWriteStream(tempImagePath);
        imageResponse.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve({
                tempImagePath, // The local path for analysis
                mediaUrl: `/uploads/images/${localFilename}` // The public URL for your DB
            }));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error("Error downloading WhatsApp media:", error.response?.data || error.message);
        throw new Error("Could not download media from WhatsApp.");
    }
}

module.exports = { sendTextMessage, downloadWhatsappMedia };
