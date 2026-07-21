import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('stage_requests')
export class StageRequestEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  companyName: string;

  @Column()
  companyLogo: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  duration: string;

  @Column()
  domain: string;

  @Column({ default: 'en_attente' })
  status: string;

  @Column({ nullable: true })
  studentId?: string;

  @Column()
  submittedAt: string;
}