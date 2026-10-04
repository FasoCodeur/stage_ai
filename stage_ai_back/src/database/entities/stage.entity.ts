import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stages')
export class StageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offreId: string; // FK -> offres.id

  @Column({ type: 'uuid' })
  etudiantId: string; // FK -> users.id

  @Column({ type: 'uuid' })
  entrepriseId: string; // FK -> entreprises.id

  @Column({ nullable: true })
  mentorId?: string; // FK -> users.id (role professeur)

  @Column({ default: 'actif' })
  statut: string; // actif | termine | abandonne

  @Column({ type: 'date' })
  dateDebut: string;

  @Column({ type: 'date' })
  dateFin: string;

  @Column({ default: 0 })
  progression: number; // 0-100

  @Column({ default: 0 })
  scorePerformance: number; // 0-100

  @Column({ type: 'jsonb', nullable: true })
  domainData?: any;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}