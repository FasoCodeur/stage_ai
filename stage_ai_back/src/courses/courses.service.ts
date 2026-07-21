import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CourseEntity } from '../database/entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
  ) {}

  async findAll(filter?: CourseFilterDto): Promise<CourseEntity[]> {
    const where: any = {};
    if (filter) {
      if (filter.category) where.category = filter.category;
      if (filter.level) where.level = filter.level;
      if (filter.professorId) where.professorId = filter.professorId;
      if (filter.published !== undefined) where.published = filter.published === 'true';
    }
    return this.courseRepo.find({ where });
  }

  async findById(id: string): Promise<CourseEntity> {
    const course = await this.courseRepo.findOneBy({ id });
    if (!course) throw new NotFoundException('Formation non trouvée');
    return course;
  }

  async findByStudentId(studentId: string): Promise<CourseEntity[]> {
    const all = await this.courseRepo.find();
    return all.filter(c => c.students?.includes(studentId));
  }

  async findByProfessorId(professorId: string): Promise<CourseEntity[]> {
    return this.courseRepo.findBy({ professorId });
  }

  isCourseNew(course: CourseEntity): boolean {
    const created = new Date(course.createdAt);
    const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 14;
  }

  async create(dto: CreateCourseDto): Promise<CourseEntity> {
    const course = this.courseRepo.create({
      ...dto as any,
      published: dto.published ?? false,
      students: [],
      createdAt: new Date().toISOString().split('T')[0],
    });
    const saved = await this.courseRepo.save(course);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseEntity> {
    const course = await this.findById(id);
    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findById(id);
    await this.courseRepo.remove(course);
  }
}