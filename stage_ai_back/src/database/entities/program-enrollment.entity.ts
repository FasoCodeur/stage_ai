import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('program_enrollments')
export class ProgramEnrollmentEntity {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  programId: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ default: 0 })
  currentLevelIndex: number; // index du niveau actuel (0 = premier niveau)

  @Column({ type: 'simple-array', default: '' })
  completedLevels: string[]; // IDs des niveaux validés

  @Column({ type: 'simple-array', default: '' })
  completedCourses: string[]; // IDs des cours complétés

  @Column({ default: 'active' })
  status: string; // 'active' | 'completed' | 'expired'

  @Column()
  enrolledAt: string;

  @Column({ type: 'text', nullable: true })
  mentorNotes?: string;
}