import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reunions')
export class ReunionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  stageId: string; // FK -> stages.id

  @Column()
  titre: string;

  @Column({ default: 'stage' })
  type: string; // stage | cohorte

  @Column({ nullable: true })
  lien?: string; // lien visioconférence (Daily.co / Jitsi / Zoom)

  @Column({ type: 'timestamptz' })
  dateReunion: Date;

  @Column({ nullable: true })
  dureeMinutes?: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}