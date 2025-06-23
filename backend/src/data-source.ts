import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Course } from './entity/Course';
import { Application } from './entity/Application';
import { LecturerCourse } from './entity/LecturerCourse';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // Set to false in production
  logging: false,
  entities: [User, Course, Application, LecturerCourse],
  migrations: [],
  subscribers: [],
}); 