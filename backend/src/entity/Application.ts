import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { User } from './User';
import { Course } from './Course';

@ObjectType()
@Entity()
export class Application {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.applications)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Field(() => Course)
  @ManyToOne(() => Course, course => course.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Field()
  @Column({ type: 'enum', enum: ['tutor', 'lab_assistant'] })
  role_applied!: 'tutor' | 'lab_assistant';

  @Field()
  @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected', 'approved'], default: 'pending' })
  status!: 'pending' | 'accepted' | 'rejected' | 'approved';

  @Field()
  @CreateDateColumn()
  applied_at!: Date;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ nullable: true })
  ranking?: number;

  @Field()
  @Column({ type: 'enum', enum: ['full_time', 'part_time'] })
  availability!: 'full_time' | 'part_time';

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  relevant_skills?: string[];
} 