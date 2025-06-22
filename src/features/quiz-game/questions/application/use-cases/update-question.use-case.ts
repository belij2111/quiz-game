import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { UpdateQuestionInputDto } from '../../api/input-dto/update-question.input-dto';

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public updateQuestionInputDto: UpdateQuestionInputDto,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand, boolean | null>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: UpdateQuestionCommand): Promise<boolean | null> {
    const foundQuestion = await this.questionsRepository.findByIdOrNotFoundFail(
      command.id,
    );
    foundQuestion.update({
      body: command.updateQuestionInputDto.body,
      correctAnswers: command.updateQuestionInputDto.correctAnswers,
    });
    return await this.questionsRepository.update(
      foundQuestion.id,
      foundQuestion,
    );
  }
}
