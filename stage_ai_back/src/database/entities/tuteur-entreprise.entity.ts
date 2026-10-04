import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tuteur_entreprise')
export class TuteurEntrepriseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  entrepriseId: string; // FK -> entreprises.id

  @Column({ type: 'uuid' })
  tuteurId: string; // FK -> users.id (role tuteur)

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}