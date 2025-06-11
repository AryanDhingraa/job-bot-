import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../entity/Course';

const courseRepository = AppDataSource.getRepository(Course);

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await courseRepository.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
}; 