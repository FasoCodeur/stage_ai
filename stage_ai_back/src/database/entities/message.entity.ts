import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  stageId: string; // FK -> stages.id

  @Column({ type: 'uuid' })
  expediteurId: string; // FK -> users.id ou entreprises.id

  @Column({ type: 'text' })
  contenu: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}