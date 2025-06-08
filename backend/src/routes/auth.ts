import { Router } from 'express';
import { signup, signin, getProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { validateSignup, validateSignin } from '../middleware/validation';
import { RequestHandler } from 'express';

const router = Router();

router.post('/signup', validateSignup as RequestHandler, signup as RequestHandler);
router.post('/signin', validateSignin as RequestHandler, signin as RequestHandler);
router.get('/profile', auth as RequestHandler, getProfile as RequestHandler);

export default router;
