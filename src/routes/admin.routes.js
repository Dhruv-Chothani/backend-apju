// server/src/routes/admin.routes.js
import express from 'express';
import adminController from '../controllers/admin.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', adminController.login);

// Protected routes - require authentication
router.get('/profile', auth, adminController.getProfile);
router.put('/profile', auth, adminController.updateProfile);
router.put('/change-password', auth, adminController.changePassword);

export default router;