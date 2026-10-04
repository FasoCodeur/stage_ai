import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('livrables')
export class LivrableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  missionId: string; // FK -> missions.id

  @Column()
  titre: string;

  @Column({ default: 'a_rendre' })
  statut: string; // a_rendre | rendu | valide | rejete

  @Column({ nullable: true })
  fichierUrl?: string;

  @Column({ type: 'text', nullable: true })
  commentaire?: string;

  @Column({ type: 'timestamptz', nullable: true })
  dateRendu?: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}