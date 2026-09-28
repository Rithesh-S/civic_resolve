const Joi = require('joi');

// User validation schemas
const userValidation = {
  register: Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('citizen', 'officer', 'admin').required(),
    preferredLanguage: Joi.string().default('en'),
    officerProfile: Joi.object({
      officerCode: Joi.string(),
      ulbId: Joi.string(),
      wardId: Joi.string(),
      department: Joi.string().valid('Public Works', 'Sanitation', 'Horticulture', 'Electrical'),
      roleTitle: Joi.string().valid('JE', 'SI', 'AE', 'CSI', 'EE'),
      location: Joi.string().required(),
      supervisorId: Joi.string(),
      status: Joi.string().valid('active', 'inactive', 'on_leave').default('active')
    }).when('role', { is: 'officer', then: Joi.required() })
  }),

  login: Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    location: Joi.string(),
    password: Joi.string().required()
  })
};

// Issue validation schemas
const issueValidation = {
  create: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().max(1000),
    category: Joi.string().valid('Roads', 'Sanitation', 'Streetlight', 'Waterleakage', 'Parks').required(),
    location: Joi.string().required(),
    channel: Joi.string().valid('app', 'whatsapp', 'ivr', 'web').default('app')
  }),

  update: Joi.object({
    status: Joi.string().valid('submitted', 'verified', 'rejected', 'acknowledged', 'in_progress', 'resolved', 'closed'),
    assignedOfficerId: Joi.string(),
    priority: Joi.number().valid(1, 2, 3, 4, 5)
  }),

  feedback: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(500)
  })
};

// Inventory validation schemas
const inventoryValidation = {
  create: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    category: Joi.string().valid('Roads', 'Sanitation', 'Streetlight', 'Waterleakage', 'Parks').required(),
    availableCount: Joi.number().min(0).default(0),
    unit: Joi.string().required(),
    unitCost: Joi.number().min(0).required(),
    storageLocation: Joi.string()
  }),

  update: Joi.object({
    availableCount: Joi.number().min(0),
    unitCost: Joi.number().min(0),
    storageLocation: Joi.string()
  })
};

// Extension request validation
const extensionValidation = {
  create: Joi.object({
    requestedUntil: Joi.date().greater('now').required(),
    reason: Joi.string().min(10).max(500).required()
  })
};

// Expense validation
const expenseValidation = {
  create: Joi.object({
    items: Joi.array().items(Joi.object({
      inventoryId: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    })).min(1).required()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

module.exports = {
  userValidation,
  issueValidation,
  inventoryValidation,
  extensionValidation,
  expenseValidation,
  validate
};