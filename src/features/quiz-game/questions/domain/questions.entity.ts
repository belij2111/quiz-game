import { BaseWithUuidIdEntity } from '../../../../core/entities/base-with-uuid-id.entity';
import { Column, Entity } from 'typeorm';
import { CreateQuestionDomainDto } from './damain-dto/create-question.domain-dto';

@Entity()
export class Question extends BaseWithUuidIdEntity {
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
