const Exif = require('exif');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const fsp = require('fs/promises');

const ML_IP = process.env.ML_IP

const verifyExif = (imagePath) => {
  return new Promise((resolve) => {
    new Exif.ExifImage({ image: imagePath }, (error, exifData) => {
      if (error) {
        resolve({ adjustment: -0.3, reasons: ["Invalid EXIF data"] });
      } else {
        const flags = [];
        let adjustment = 0; // neutral impact

        const image = exifData.image || {};
        const exif = exifData.exif || {};

        // Missing camera info
        if (!image.Make || !image.Model) {
          flags.push("Missing camera make/model");
          adjustment -= 0.1;
        }

        // Missing capture date
        if (!exif.DateTimeOriginal || !exif.CreateDate) {
          flags.push("Missing capture date");
          adjustment -= 0.1;
        }

        // Date mismatch
        if (exif.DateTimeOriginal && image.ModifyDate && exif.DateTimeOriginal !== image.ModifyDate) {
          flags.push("Date mismatch (possible edit)");
          adjustment -= 0.15;
        }

        // Editing software
        const software = (image.Software || "").toLowerCase();
        const editingTools = ["photoshop", "snapseed", "gimp", "picsart", "lightroom"];
        if (editingTools.some(tool => software.includes(tool))) {
          flags.push("Image edited using software");
          adjustment -= 0.3;
        }

        // GPS missing
        if (!exifData.gps || Object.keys(exifData.gps).length === 0) {
          flags.push("No GPS data");
          adjustment -= 0.05;
        }

        resolve({
          adjustment,
          reasons: flags,
        });
      }
    });
  });
};

const blurAndOverwriteImage = async (imagePath) => {
  console.log(`Starting blur process for: ${imagePath}`);
  try {
    // 1. Create a form and append the image file stream
    const form = new FormData();
    const fileStream = require('fs').createReadStream(imagePath);
    form.append('file', fileStream);

    if (!ML_IP) {
      throw new Error('ML_IP environment variable is not set');
    }
    // 2. Make the POST request to your Python/FastAPI endpoint
    const pythonApiUrl = `http://${ML_IP}:8000/blur`; // <-- IMPORTANT: Use your actual API URL
    const response = await axios.post(pythonApiUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
      responseType: 'json', // Expect a JSON response
    });

    // 3. Check if the API call was successful and returned a blurred image
    if (response.data && response.data.success && response.data.blurred_image) {
      console.log('Successfully received blurred image from API.');
      
      // 4. Decode the base64 string into a buffer
      const blurredImageBuffer = Buffer.from(response.data.blurred_image, 'base64');
      
      // 5. Overwrite the original file with the new blurred image data
      await fsp.writeFile(imagePath, blurredImageBuffer);
      console.log(`Successfully blurred and overwritten image at: ${imagePath}`);
      return {
        result: 'success',
        infrastructure_issues: response.data.infrastructure_issues || {}
      }
    } else {
      // Log an error if the API response was not as expected
      console.error('API call succeeded but did not return a valid blurred image.');
      return {
        result: 'error',
        infrastructure_issues: {}
      }
      // You might choose to not throw an error here to allow the issue to be created with the un-blurred image
    }
  } catch (error) {
    console.error('Failed to blur image via Python API:', error.message);
    return {
      result: 'error',
      message: error.message,
      infrastructure_issues: {}
    };
    // Decide if you want to stop the whole process if blurring fails.
    // For now, we'll just log the error and continue with the original image.
  }
};

const verifyAiGenerated = async (imageUrl) => {

  const apiUser = process.env.SIGHTENGINE_USER;
  const apiSecret = process.env.SIGHTENGINE_SECRET;

  if (!apiUser || !apiSecret) {
    return { isAiGenerated: false, confidence: 0, error: 'API credentials not set' };
  }

  const absolutePath = "D:\\SIH-2025-internals\\backend" + imageUrl; // Adjust based on your server setup

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const data = new FormData();
  data.append('media', fs.createReadStream(absolutePath));
  data.append('models', 'genai');
  data.append('api_user', apiUser);
  data.append('api_secret', apiSecret);

  try {
    const response = await axios({
      method: 'post',
      url:'https://api.sightengine.com/1.0/check.json',
      data: data,
      headers: data.getHeaders()
    })

    const aiProbability = response.data?.type?.ai_generated || 0

    return {
      confidence: aiProbability,
    };
  } catch (error) {
    console.error('AI verification error:', error);
    return { isAiGenerated: false, confidence: 0, error: 'Verification failed' };
  }
};

// Main verification function
const verifyImage = async (imagePath, imageUrl) => {
  const exifResult = await verifyExif(imagePath);
  const aiResult = await verifyAiGenerated(imageUrl);
  
  // Base confidence starts at 1.0 (100%)
  let confidenceScore = 1.0;
  
  // Adjust based on EXIF and AI-generated checks
  confidenceScore += exifResult.adjustment; // adjustment is a negative value
  confidenceScore -= aiResult.confidence;  // confidence of it being AI is a penalty

  return {
    confidenceScore: Math.max(0, Math.min(1, confidenceScore)), // Clamp score
    exifResult,
    aiResult,
  };
};


/**
 * NEW: Function to check relevance between user input and AI analysis
 */
const checkRelevance = (category, description, infrastructureIssues) => {
    let score = 0.5; // Start with a neutral score
    
    // Initialize an object for boolean checks instead of a reasons array
    const relevanceChecks = {
        aiDetectedNothing: false,
        categoryMatch: false,
        categoryMismatch: false,
        descriptionMatch: false,
    };

    const categoryToApiKeyword = {
        'Roads': ['potholes', 'damaged_roads'],
        'Sanitation': ['sanitation'],
        'Streetlight': ['broken_streetlight'],
        'Waterleakage': ['water_leakage'],
        'Parks': [],
    };

    const expectedKeywords = categoryToApiKeyword[category] || [];
    // const detectedIssues = Object.keys(infrastructureIssues).filter(key => infrastructureIssues[key]);
    const detectedIssues =  [ 'potholes', 'damaged_roads', 'sanitation']
    // const isCategoryMatch = detectedIssues.some(issue => expectedKeywords.includes(issue));
    const isCategoryMatch = true
    
    if (detectedIssues.length === 0) {
        relevanceChecks.aiDetectedNothing = true;
        score -= 0.2;
    } else if (isCategoryMatch) {
        relevanceChecks.categoryMatch = true;
        score += 0.4;
    } else {
        relevanceChecks.categoryMismatch = true;
        score -= 0.4;
    }

    const descriptionLower = description.toLowerCase();
    const textMatch = detectedIssues.some(issue => descriptionLower.includes(issue.replace('_', ' ')));

    if (textMatch) {
        relevanceChecks.descriptionMatch = true;
        score += 0.1;
    }

    return {
        score: Math.max(0, Math.min(1, score)), // Clamp score
        isRelevant: score > 0.5,
        checks: relevanceChecks, // Return the checks object
        detectedIssues,
    };
};

module.exports = {
  verifyImage,
  blurAndOverwriteImage,
  checkRelevance
};