import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('missions')
export class MissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  stageId: string; // FK -> stages.id

  @Column()
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  objectif?: string;

  @Column({ default: 'a_faire' })
  statut: string; // a_faire | en_cours | termine

  @Column({ type: 'date', nullable: true })
  deadline?: string;

  @Column({ type: 'jsonb', nullable: true })
  domainData?: any; // données spécifiques au domaine (code, tableur, etc.)

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}