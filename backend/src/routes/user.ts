import { Router } from 'express';
import { RequestHandler } from 'express';
import { auth } from '../middleware/auth';
import { updateProfile } from '../controllers/userController';

const router = Router();

// All user-related routes require authentication
router.use(auth as RequestHandler);

// Update user profile
router.put('/profile', updateProfile as RequestHandler);

export default router; 