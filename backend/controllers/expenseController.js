const Expense = require('../models/Expense'); // Adjust path to your model

// --- Controller: To get expenses for the logged-in officer ---

const getOfficerExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by the logged-in officer's ID from the auth middleware
    const filter = { officerId: req.user._id };

    // Find all expenses matching the filter
    const expenses = await Expense.find(filter)
      .sort({ requestedAt: -1 }) // Sort by newest first
      .populate('issueId', 'title') // Populate issue title for context in the UI
      .skip(skip)
      .limit(limit);

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch expense requests' });
  }
};

module.exports = {
  getOfficerExpenses
};