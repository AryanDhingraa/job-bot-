import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Application } from './Application';
import { LecturerCourse } from './LecturerCourse';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ type: 'enum', enum: ['candidate', 'lecturer', 'admin'] })
  role!: 'candidate' | 'lecturer' | 'admin';

  @CreateDateColumn()
  date_joined!: Date;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ default: false })
  is_blocked!: boolean;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'simple-array', nullable: true })
  skills?: string[];

  @Column({ nullable: true })
  current_level?: string;

  @Column({ nullable: true })
  gpa?: string;

  @OneToMany(() => Application, application => application.user)
  applications?: Application[];

  @OneToMany(() => LecturerCourse, lecturerCourse => lecturerCourse.lecturer)
  lecturer_courses?: LecturerCourse[];
} 