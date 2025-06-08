import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity()
export class LecturerCourse {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'lecturer_id' })
  lecturer!: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course!: Course;
} 