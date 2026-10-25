const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator, updateProfileValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, updateProfileValidator, validate, authController.updateProfile);

module.exports = router;
