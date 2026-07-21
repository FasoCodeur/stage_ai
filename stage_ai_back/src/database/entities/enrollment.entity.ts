import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('enrollments')
export class EnrollmentEntity {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  courseId: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ type: 'simple-array', default: '' })
  completedLessons: string[];

  @Column()
  enrolledAt: string;
}