import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn()
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
}