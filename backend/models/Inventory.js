const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  ulbId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['Roads', 'Sanitation', 'Streetlight', 'Waterleakage', 'Parks'],
    required: true
  },
  image: String,
  availableCount: {
    type: Number,
    default: 0
  },
  unit: String,
  unitCost: Number,
  metadata: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    storageLocation: String
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);