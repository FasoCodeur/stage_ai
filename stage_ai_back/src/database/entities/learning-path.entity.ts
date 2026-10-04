import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('learning_paths')
export class LearningPathEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar' })
  objectifMetier: string;

  @Column({ type: 'varchar' })
  niveauEvalue: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text' })
  resume: string;

  @Column({ type: 'varchar', default: 'active' })
  statut: string; // active | completed | archive

  @Column({ type: 'varchar', nullable: true })
  modeleIA?: string | null;

  @Column({ type: 'varchar' })
  createdAt: string;
}
