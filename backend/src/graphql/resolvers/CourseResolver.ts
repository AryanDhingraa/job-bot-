import { Resolver, Query, Mutation, Arg, Int, Authorized } from 'type-graphql';
import { AppDataSource } from '../../data-source';
import { Course } from '../../entity/Course';
import { User } from '../../entity/User';
import { LecturerCourse } from '../../entity/LecturerCourse';

@Resolver(Course)
export class CourseResolver {
  private courseRepository = AppDataSource.getRepository(Course);
  private userRepository = AppDataSource.getRepository(User);
  private lecturerCourseRepository = AppDataSource.getRepository(LecturerCourse);

  @Authorized('admin')
  @Query(() => [Course])
  async courses(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  @Authorized('admin')
  @Mutation(() => Course)
  async createCourse(
    @Arg('code') code: string,
    @Arg('name') name: string,
    @Arg('semester') semester: string,
    @Arg('description', { nullable: true }) description?: string,
  ): Promise<Course> {
    const existingCourse = await this.courseRepository.findOne({ where: { code } });
    if (existingCourse) {
      throw new Error('Course with this code already exists!');
    }
    const course = this.courseRepository.create({ code, name, semester, description });
    await this.courseRepository.save(course);
    return course;
  }

  @Authorized('admin')
  @Mutation(() => Course)
  async updateCourse(
    @Arg('id', () => Int) id: number,
    @Arg('code', { nullable: true }) code?: string,
    @Arg('name', { nullable: true }) name?: string,
    @Arg('semester', { nullable: true }) semester?: string,
    @Arg('description', { nullable: true }) description?: string,
  ): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new Error('Course not found!');
    }
    if (code !== undefined) course.code = code;
    if (name !== undefined) course.name = name;
    if (semester !== undefined) course.semester = semester;
    if (description !== undefined) course.description = description;
    await this.courseRepository.save(course);
    return course;
  }

  @Authorized('admin')
  @Mutation(() => Boolean)
  async deleteCourse(@Arg('id', () => Int) id: number): Promise<boolean> {
    const result = await this.courseRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }

  @Authorized('admin')
  @Mutation(() => Course)
  async assignLecturerToCourse(
    @Arg('courseId', () => Int) courseId: number,
    @Arg('lecturerId', () => Int) lecturerId: number,
  ): Promise<Course> {
    // Find the course
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) throw new Error('Course not found!');

    // Find the lecturer
    const lecturer = await this.userRepository.findOne({ where: { id: lecturerId, role: 'lecturer' } });
    if (!lecturer) throw new Error('Lecturer not found or user is not a lecturer!');

    // Check if assignment already exists
    const existingAssignment = await this.lecturerCourseRepository.findOne({
      where: { course: { id: courseId }, lecturer: { id: lecturerId } }
    });
    if (existingAssignment) throw new Error('This lecturer is already assigned to this course!');

    // Create new assignment
    const lecturerCourse = this.lecturerCourseRepository.create({ course, lecturer });
    await this.lecturerCourseRepository.save(lecturerCourse);

    // Return the updated course
    return this.courseRepository.findOne({ 
      where: { id: courseId },
      relations: ['lecturer_courses', 'lecturer_courses.lecturer']
    }) as Promise<Course>;
  }
} 