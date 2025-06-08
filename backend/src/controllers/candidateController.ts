import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Application } from '../entity/Application';
import { Course } from '../entity/Course';
import { User } from '../entity/User';

const applicationRepository = AppDataSource.getRepository(Application);
const courseRepository = AppDataSource.getRepository(Course);
const userRepository = AppDataSource.getRepository(User);

export const getAvailableCourses = async (req: Request, res: Response) => {
  try {
    const courses = await courseRepository.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

export const applyForCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { courseId, role } = req.body;

    // Check if user has already applied for this role in this course
    const existingApplication = await applicationRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
        role_applied: role
      }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied for this role in this course' 
      });
    }

    // Create new application
    const application = applicationRepository.create({
      user: { id: userId },
      course: { id: courseId },
      role_applied: role,
      status: 'pending'
    });

    await applicationRepository.save(application);

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
};

export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const applications = await applicationRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
      order: { applied_at: 'DESC' }
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
}; 