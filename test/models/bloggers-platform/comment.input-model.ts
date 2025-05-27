import { CreateCommentInputTestDto } from './input-test-dto/create-comment.input-test-dto';

export const createValidCommentModel = (
  count: number = 1,
): CreateCommentInputTestDto => {
  const commentModel = new CreateCommentInputTestDto();
  commentModel.content = `new comment${count} for post`;
  return commentModel;
};

export const createInValidCommentModel = (
  count: number = 1,
): CreateCommentInputTestDto => {
  const invalidCommentModel = new CreateCommentInputTestDto();
  invalidCommentModel.content = `invalid comment${count}`;
  return invalidCommentModel;
};
