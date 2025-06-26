import { BaseWithUuidIdEntity } from '../../../../core/entities/base-with-uuid-id.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AnswerStatus } from '../api/enums/answer-status.enum';
import { Player } from './player.entity';
import { CreateAnswerDomainDto } from './damain-dto/create-answer.domain-dto';

@Entity()
export class Answer extends BaseWithUuidIdEntity {
  @Column({ type: 'enum', enum: AnswerStatus })
  answerStatus: AnswerStatus;

  @ManyToOne(() => Player, (p) => p.answer)
  public player: Player;
  @Column({ type: 'uuid' })
  public playerId: string;

  @Column({ type: 'uuid' })
  questionId: string;

  static create(
    dto: CreateAnswerDomainDto,
    playerId: string,
    questionId: string,
  ): Answer {
    const answer = new this();
    answer.answerStatus = dto.answerStatus;
    answer.playerId = playerId;
    answer.questionId = questionId;
    return answer;
  }

  update(data: Partial<Answer>) {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
