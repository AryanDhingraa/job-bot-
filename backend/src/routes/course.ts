import { Router } from 'express';
import { RequestHandler } from 'express';
import { auth } from '../middleware/auth';
import { getAllCourses } from '../controllers/courseController';

const router = Router();

// All routes require authentication (if desired, or make public)
router.use(auth as RequestHandler);

// Get all courses
router.get('/', getAllCourses as RequestHandler);

export default router; 