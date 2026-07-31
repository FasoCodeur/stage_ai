import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('levels')
export class LevelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  programId: string;

  @Column()
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column()
  duration: number; // durée en jours

  @Column()
  order: number; // index du niveau (1, 2, 3...)

  @Column({ type: 'jsonb', default: '[]' })
  courses: string[]; // IDs des cours
}