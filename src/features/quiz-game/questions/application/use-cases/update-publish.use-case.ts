import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { UpdatePublishInputDto } from '../../api/input-dto/update-publish.input-dto';

export class UpdatePublishCommand {
  constructor(
    public id: string,
    public updatePublishInputDto: UpdatePublishInputDto,
  ) {}
}

@CommandHandler(UpdatePublishCommand)
export class UpdatePublishUseCase
  implements ICommandHandler<UpdatePublishCommand, boolean | null>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: UpdatePublishCommand): Promise<boolean | null> {
    const foundQuestion = await this.questionsRepository.findByIdOrNotFoundFail(
      command.id,
    );
    foundQuestion.update({
      published: command.updatePublishInputDto.published,
    });
    return await this.questionsRepository.update(
      foundQuestion.id,
      foundQuestion,
    );
  }
}
