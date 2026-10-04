import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('candidatures')
export class CandidatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offreId: string; // FK -> offres.id

  @Column({ type: 'uuid' })
  etudiantId: string; // FK -> users.id

  @Column({ default: 'en_attente' })
  statut: string; // en_attente | validee | refusee

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}