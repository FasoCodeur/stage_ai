import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('temps_travail')
export class TempsTravailEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  stageId: string; // FK -> stages.id

  @Column({ type: 'uuid', nullable: true })
  tacheId?: string; // FK -> taches.id

  @Column({ type: 'uuid', nullable: true })
  missionId?: string; // FK -> missions.id

  @Column()
  dureeMinutes: number;

  @Column({ type: 'date' })
  dateTravail: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}