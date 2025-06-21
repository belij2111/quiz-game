import { CreateQuestionInputDto } from '../../../src/features/quiz-game/questions/api/input-dto/create-question.input-dto';

export const createValidQuestionDto = (): CreateQuestionInputDto => {
  const questionDto = new CreateQuestionInputDto();
  questionDto.body = `What color mixes with yellow to make green?`;
  questionDto.correctAnswers = ['blue', 'cyan'];
  return questionDto;
};

export const createInValidQuestionDto = (): CreateQuestionInputDto => {
  const invalidQuestionDto = new CreateQuestionInputDto();
  invalidQuestionDto.body = 'incorrect';
  invalidQuestionDto.correctAnswers = ['blue', 'cyan'];
  return invalidQuestionDto;
};
