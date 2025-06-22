import { UpdatePublishInputDto } from '../../../src/features/quiz-game/questions/api/input-dto/update-publish.input-dto';

export const createPublishDto = (): UpdatePublishInputDto => {
  const publishDto = new UpdatePublishInputDto();
  publishDto.published = true;
  return publishDto;
};

export const createInvalidPublishDto = (): UpdatePublishInputDto => {
  const invalidPublishDto = new UpdatePublishInputDto();
  invalidPublishDto.published = 'incorrect data' as any;
  return invalidPublishDto;
};
