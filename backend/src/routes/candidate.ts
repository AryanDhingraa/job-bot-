import { Router } from 'express';
import { RequestHandler } from 'express';
import { auth } from '../middleware/auth';
import { 
  getAvailableCourses, 
  applyForCourse, 
  getMyApplications 
} from '../controllers/candidateController';

const router = Router();

// All routes require authentication
router.use(auth as RequestHandler);

// Get available courses
router.get('/courses', getAvailableCourses as RequestHandler);

// Apply for a course
router.post('/apply', applyForCourse as RequestHandler);

// Get my applications
router.get('/applications', getMyApplications as RequestHandler);

export default router; 