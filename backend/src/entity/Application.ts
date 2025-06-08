import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ type: 'enum', enum: ['tutor', 'lab_assistant'] })
  role_applied!: 'tutor' | 'lab_assistant';

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status!: 'pending' | 'accepted' | 'rejected';

  @CreateDateColumn()
  applied_at!: Date;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ nullable: true })
  ranking?: number;

  @Column({ type: 'enum', enum: ['full_time', 'part_time'] })
  availability!: 'full_time' | 'part_time';

  @Column({ type: 'simple-array', nullable: true })
  relevant_skills?: string[];
} 