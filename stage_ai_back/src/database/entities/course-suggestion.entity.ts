import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('course_suggestions')
export class CourseSuggestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'varchar' })
  level: string; // Débutant | Intermédiaire | Avancé

  @Column({ type: 'simple-array', default: '' })
  competences: string[];

  @Column({ type: 'text' })
  justification: string;

  @Column({ type: 'varchar', nullable: true })
  objectifMetier?: string | null;

  /** Parcours d'où provient la suggestion */
  @Column({ type: 'varchar', nullable: true })
  sourcePathId?: string | null;

  /** Étudiant à l'origine de la suggestion */
  @Column({ type: 'varchar', nullable: true })
  demandeurId?: string | null;

  @Column({ type: 'varchar', default: 'en_attente' })
  statut: string; // en_attente | acceptee | refusee

  @Column({ type: 'text', nullable: true })
  motifRefus?: string | null;

  @Column({ type: 'varchar', nullable: true })
  reviewedBy?: string | null;

  /** Cours créé à partir de cette suggestion */
  @Column({ type: 'varchar', nullable: true })
  courseId?: string | null;

  @Column({ type: 'varchar' })
  createdAt: string;
}
