import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('entreprises')
export class EntrepriseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ unique: true })
  email: string;

  @Column()
  contact: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  secteur?: string;

  @Column({ nullable: true })
  siteWeb?: string;

  @Column({ nullable: true })
  adresse?: string;

  @Column({ default: true })
  actif: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}