import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('purchases')
export class PurchaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  courseId: string;

  @Column()
  method: string;

  @Column()
  purchasedAt: string;
}