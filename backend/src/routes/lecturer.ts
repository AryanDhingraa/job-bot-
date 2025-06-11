import { Router } from 'express';
import { RequestHandler } from 'express';
import { auth } from '../middleware/auth';
import { getMyCourseApplications, updateApplicationStatus, getLecturerDashboardStats } from '../controllers/lecturerController';

const router = Router();

// Middleware to ensure only lecturers can access these routes
const lecturerOnly = (req: any, res: any, next: any) => {
  if (req.user.role !== 'lecturer') {
    return res.status(403).json({ message: 'Access denied. Only lecturers can access this route.' });
  }
  next();
};

// All routes require authentication and lecturer role
router.use(auth as RequestHandler, lecturerOnly as RequestHandler);

// Get all applications for courses taught by the lecturer
router.get('/applications', getMyCourseApplications as RequestHandler);

// Get dashboard statistics
router.get('/stats', getLecturerDashboardStats as RequestHandler);

// Approve an application
router.post('/applications/:id/accepted', (req, res) => {
  req.body.status = 'accepted';
  updateApplicationStatus(req, res);
});

// Reject an application
router.post('/applications/:id/rejected', (req, res) => {
  req.body.status = 'rejected';
  updateApplicationStatus(req, res);
});

export default router; 