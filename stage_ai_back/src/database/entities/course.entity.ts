import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('courses')
export class CourseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  category: string;

  @Column()
  level: string;

  @Column()
  duration: number;

  @Column()
  price: number;

  @Column()
  professorId: string;

  @Column({ default: false })
  published: boolean;

  @Column()
  thumbnail: string;

  @Column({ type: 'jsonb', default: '[]' })
  modules: any[];

  @Column({ type: 'simple-array', default: '' })
  students: string[];

  @Column()
  createdAt: string;
}