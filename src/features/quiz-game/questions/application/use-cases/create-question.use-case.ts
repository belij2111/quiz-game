import { CreateQuestionDomainDto } from '../../domain/damain-dto/create-question.domain-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../domain/questions.entity';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class CreateQuestionCommand {
  constructor(public createQuestionDto: CreateQuestionDomainDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand, string>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: CreateQuestionCommand): Promise<string> {
    const question = Question.create(command.createQuestionDto);
    return await this.questionsRepository.create(question);
  }
}
