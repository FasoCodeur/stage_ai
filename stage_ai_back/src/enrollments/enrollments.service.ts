import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from '../database/entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
  ) {}

  findAll(): Promise<EnrollmentEntity[]> {
    return this.enrollmentRepo.find();
  }

  findByUserId(userId: string): Promise<EnrollmentEntity[]> {
    return this.enrollmentRepo.findBy({ userId });
  }

  findByCourseId(courseId: string): Promise<EnrollmentEntity[]> {
    return this.enrollmentRepo.findBy({ courseId });
  }

  async findOne(userId: string, courseId: string): Promise<EnrollmentEntity> {
    const enrollment = await this.enrollmentRepo.findOneBy({ userId, courseId });
    if (!enrollment) throw new NotFoundException('Inscription non trouvée');
    return enrollment;
  }

  async create(dto: CreateEnrollmentDto): Promise<EnrollmentEntity> {
    const exists = await this.enrollmentRepo.findOneBy({ userId: dto.userId, courseId: dto.courseId });
    if (exists) throw new ConflictException('L\'utilisateur est déjà inscrit à cette formation');
    const enrollment = this.enrollmentRepo.create({
      ...dto,
      progress: dto.progress ?? 0,
      completedLessons: dto.completedLessons ?? [],
      enrolledAt: new Date().toISOString().split('T')[0],
    });
    return this.enrollmentRepo.save(enrollment);
  }

  async updateProgress(userId: string, courseId: string, progress: number, completedLessons: string[]): Promise<EnrollmentEntity> {
    const enrollment = await this.findOne(userId, courseId);
    enrollment.progress = progress;
    if (completedLessons) enrollment.completedLessons = completedLessons;
    return this.enrollmentRepo.save(enrollment);
  }

  async remove(userId: string, courseId: string): Promise<void> {
    const enrollment = await this.findOne(userId, courseId);
    await this.enrollmentRepo.remove(enrollment);
  }
}