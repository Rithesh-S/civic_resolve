const Inventory = require('../models/Inventory');
const Expense = require('../models/Expense');

const getInventory = async (req, res) => {
  try {
    const { category, inStock, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (category) filter.category = category;
    if (inStock === 'true') filter.availableCount = { $gt: 0 };
    
    const inventory = await Inventory.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Inventory.countDocuments(filter);
    
    res.json({
      inventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

const getInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await Inventory.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json({ item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const { name, description, category, availableCount, unit, unitCost, storageLocation } = req.body;

    const item = new Inventory({
      ulbId: req.user.ulbId || 'defaultUlbId', // In production, get from user context
      name,
      description,
      category,
      availableCount: availableCount || 0,
      unit,
      unitCost,
      metadata: {
        storageLocation,
        lastUpdated: new Date()
      }
    });
    
    if (req.file) {
      item.image = `/uploads/images/${req.file.filename}`;
    }
    
    await item.save();
        
    res.status(201).json({ message: 'Inventory item created successfully', item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description, availableCount, unitCost, storageLocation } = req.body;
    
    const item = await Inventory.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    if (name) item.name = name;
    if (description) item.description = description;
    if (availableCount !== undefined) item.availableCount = availableCount;
    if (unitCost) item.unitCost = unitCost;
    
    item.metadata.lastUpdated = new Date();
    if (storageLocation) item.metadata.storageLocation = storageLocation;
    
    if (req.file) {
      item.image = `/uploads/images/${req.file.filename}`;
    }
    
    await item.save();
    
    res.json({ message: 'Inventory item updated successfully', item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await Inventory.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    // Check if item is used in any expense requests
    const usedInExpenses = await Expense.countDocuments({
      'items.inventoryId': itemId,
      status: { $in: ['requested', 'approved'] }
    });
    
    if (usedInExpenses > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete inventory item that is used in pending or approved expenses' 
      });
    }
    
    await Inventory.findByIdAndDelete(itemId);
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};

module.exports = {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};