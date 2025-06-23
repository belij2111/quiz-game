import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand, boolean | null>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: DeleteQuestionCommand): Promise<boolean | null> {
    const foundQuestion = await this.questionsRepository.findByIdOrNotFoundFail(
      command.id,
    );
    return await this.questionsRepository.delete(foundQuestion.id);
  }
}
