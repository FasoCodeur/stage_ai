import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('taches')
export class TacheEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  missionId: string; // FK -> missions.id

  @Column()
  titre: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'a_faire' })
  statut: string; // a_faire | en_cours | termine

  @Column({ default: 0 })
  ordre: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}