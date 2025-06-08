import { Router } from 'express';
import { signUp, signIn, getCurrentUser } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);

// Protected routes
router.get('/me', auth, getCurrentUser);

export default router;
