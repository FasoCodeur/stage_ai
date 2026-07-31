import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('programs')
export class ProgramEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  thumbnail: string;

  @Column()
  duration: number; // en mois

  @Column()
  subscriptionPrice: number; // prix abonnement mensuel en FCFA

  @Column()
  mentorId: string;

  @Column({ default: false })
  published: boolean;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column({ type: 'simple-array', default: '' })
  students: string[];

  @Column()
  createdAt: string;
}