import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Application } from './Application';
import { LecturerCourse } from './LecturerCourse';
import { User } from './User';

@ObjectType()
@Entity()
export class Course {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  code!: string;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  semester!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Application, application => application.course)
  applications!: Application[];

  @OneToMany(() => LecturerCourse, lecturerCourse => lecturerCourse.course)
  lecturer_courses?: LecturerCourse[];

  @Field(() => User, { nullable: true })
  get lecturer(): User | undefined {
    return this.lecturer_courses?.[0]?.lecturer;
  }
} 