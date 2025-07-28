import { CreateQuestionInputDto } from '../../../src/features/quiz-game/questions/api/input-dto/create-question.input-dto';

export const QUESTIONS_PULL = [
  {
    body: 'Question: What is 2 + 2?',
    correctAnswers: ['4', 'four'],
  },
  {
    body: 'Question: What is 2 + 2?',
    correctAnswers: ['4', 'four'],
  },
  {
    body: 'Question: What is 2 + 2?',
    correctAnswers: ['4', 'four'],
  },
  {
    body: 'Question: What is 2 + 2?',
    correctAnswers: ['4', 'four'],
  },
  {
    body: 'Question: What is 2 + 2?',
    correctAnswers: ['4', 'four'],
  },
];

export const createValidQuestionDto = (
  count: number = 0,
): CreateQuestionInputDto => {
  const actualCount = Math.min(count, QUESTIONS_PULL.length - 1);
  const questionDto = new CreateQuestionInputDto();
  questionDto.body = QUESTIONS_PULL[actualCount].body;
  questionDto.correctAnswers = QUESTIONS_PULL[actualCount].correctAnswers;
  return questionDto;
};

export const createInValidQuestionDto = (): CreateQuestionInputDto => {
  const invalidQuestionDto = new CreateQuestionInputDto();
  invalidQuestionDto.body = 'incorrect';
  invalidQuestionDto.correctAnswers = ['blue', 'cyan'];
  return invalidQuestionDto;
};
