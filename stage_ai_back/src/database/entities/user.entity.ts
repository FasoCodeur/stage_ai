import {Entity, PrimaryColumn, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column()
  avatar: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  ville?: string;

  @Column({ nullable: true })
  niveau?: string;

  @Column({ nullable: true })
  entrepriseId?: string;

  @Column({ nullable: true })
  lastLogin?: string;

  @Column({ type: 'varchar', nullable: true })
  resetToken?: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetTokenExpiry?: string | null;

  // ── Parcours personnalisé par l'IA ──
  @Column({ type: 'varchar', nullable: true })
  objectifMetier?: string | null;

  @Column({ type: 'varchar', nullable: true })
  niveauEvalue?: string | null;

  @Column({ type: 'varchar', nullable: true })
  assessmentDoneAt?: string | null;
}
