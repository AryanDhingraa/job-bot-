import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Application } from './Application';
import { LecturerCourse } from './LecturerCourse';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Field()
  @Column({ type: 'enum', enum: ['candidate', 'lecturer', 'admin'] })
  role!: 'candidate' | 'lecturer' | 'admin';

  @Field()
  @CreateDateColumn()
  date_joined!: Date;

  @Column({ nullable: true })
  avatar_url?: string;

  @Field()
  @Column({ default: false })
  is_blocked!: boolean;

  @Field()
  @Column({ default: true })
  isAvailableForHiring!: boolean;

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