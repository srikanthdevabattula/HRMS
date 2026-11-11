import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();

/**
 * Authentication Routes
 * POST /api/auth/login - Login for Admin (and Employee placeholder)
 */
router.post('/login', login);

export default router;
