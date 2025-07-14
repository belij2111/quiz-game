import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateQuestionDomainDto } from './damain-dto/create-question.domain-dto';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  public createdAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  public updatedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  public deletedAt: Date | null;

  @Column({ type: 'varchar', collation: 'C' })
  body: string;

  @Column({ type: 'jsonb' })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean = false;

  static create(dto: CreateQuestionDomainDto) {
    const question = new this();
    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    return question;
  }

  update(data: Partial<Question>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
