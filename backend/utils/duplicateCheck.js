const Issue = require('../models/Issue');

const SIMILARITY_THRESHOLD = 0.6;
const DISTANCE_THRESHOLD = 500;

const checkDuplicate = async (newIssue) => {
  const { reporterId, location, category, title, description } = newIssue;

  const userRecent = await Issue.findOne({
    reporterId,
    category,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: location.coordinates },
        $maxDistance: DISTANCE_THRESHOLD
      }
    },
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }).sort({ createdAt: -1 });

  if (userRecent) {
    return {
      isDuplicate: true,
      duplicateOf: userRecent._id,
      reason: "Same user reported similar issue recently"
    };
  }

  const nearby = await Issue.find({
    category,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: location.coordinates },
        $maxDistance: DISTANCE_THRESHOLD
      }
    },
    createdAt: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
  }).limit(10);

  for (const issue of nearby) {
    const titleScore = calculateSimilarity(title, issue.title);
    const descriptionScore = calculateSimilarity(description, issue.description);
    const score = Math.max(0, Math.min(1, (titleScore * 0.8 + descriptionScore * 0.2)/2 + 0.5));
    if (score > SIMILARITY_THRESHOLD) {
      return {
        isDuplicate: true,
        duplicateOf: issue._id,
        reason: "Similar issue reported nearby recently",
        similarityScore: score,
        matchedTitle: issue.title
      };
    }
  }

  return { isDuplicate: false };
};


// Calculate similarity between two strings (0 to 1)
const calculateSimilarity = (str1, str2) => {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
};

module.exports = {
  checkDuplicate
};