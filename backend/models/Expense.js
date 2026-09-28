const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  name: String,
  quantity: Number,
  unitCost: Number,
  totalCost: Number
});

const expenseSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  ulbId: mongoose.Schema.Types.ObjectId,
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [itemSchema],
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'billed'],
    default: 'requested'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: mongoose.Schema.Types.ObjectId,
  approvedAt: Date
});

module.exports = mongoose.model('Expense', expenseSchema);