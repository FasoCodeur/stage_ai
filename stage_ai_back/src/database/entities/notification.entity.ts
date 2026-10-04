import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  destinataireId: string; // FK -> users.id ou entreprises.id

  @Column()
  type: string; // email | in_app

  @Column()
  titre: string;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ type: 'uuid', nullable: true })
  stageId?: string; // FK -> stages.id (contexte)

  @Column({ default: false })
  lu: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}