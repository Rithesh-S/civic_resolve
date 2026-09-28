const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { inventoryValidation } = require('../middleware/validation');
const { uploadImage, handleMulterError } = require('../middleware/upload');
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} = require('../controllers/inventoryController');

router.use(auth);

router.get('/', getInventory);
router.get('/:itemId', getInventoryItem);

// Admin-only routes for inventory management
router.post('/', 
  requireRole(['admin']), 
  uploadImage.single('image'),
  handleMulterError,
  validate(inventoryValidation.create),
  createInventoryItem
);

router.put('/:itemId', 
  requireRole(['admin']), 
  uploadImage.single('image'),
  handleMulterError,
  validate(inventoryValidation.update),
  updateInventoryItem
);

router.delete('/:itemId', requireRole(['admin']), deleteInventoryItem);

module.exports = router;