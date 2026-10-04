import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('offres')
export class OffreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  missions: string;

  @Column()
  domaine: string;

  @Column()
  duree: string;

  @Column({ default: 'en_attente' })
  statut: string; // en_attente | validee | refusee

  @Column({ type: 'uuid' })
  entrepriseId: string; // FK -> entreprises.id

  @Column({ nullable: true })
  mentorId?: string; // FK -> users.id (role professeur)

  @Column({ type: 'jsonb', nullable: true })
  domainData?: any;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}