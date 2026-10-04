import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('learning_path_steps')
export class LearningPathStepEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  pathId: string;

  @Column({ type: 'int' })
  ordre: number;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  objectif?: string | null;

  @Column({ type: 'int', default: 1 })
  semaineDebut: number;

  @Column({ type: 'int', default: 0 })
  dureeHeures: number;

  @Column({ type: 'varchar', default: 'a_faire' })
  statut: string; // a_faire | en_cours | termine

  /** Cours existant sur la plateforme (si l'étape est couverte) */
  @Column({ type: 'varchar', nullable: true })
  courseId?: string | null;

  /** Suggestion de cours à créer par l'admin (si le cours n'existe pas) */
  @Column({ type: 'varchar', nullable: true })
  suggestionId?: string | null;

  @Column({ type: 'simple-array', default: '' })
  competences: string[];

  @Column({ type: 'varchar' })
  createdAt: string;
}
