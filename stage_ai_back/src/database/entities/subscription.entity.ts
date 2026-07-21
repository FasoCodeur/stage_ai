import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryColumn()
  userId: string;

  @Column({ default: 'mensuel' })
  plan: string;

  @Column({ default: 'active' })
  status: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;
}