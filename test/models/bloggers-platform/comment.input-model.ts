import { CreateCommentInputModel } from '../../../src/features/bloggers-platform/comments/api/models/input/create-comment.input-model';

export const createValidCommentModel = (
  count: number = 1,
): CreateCommentInputModel => {
  const commentModel = new CreateCommentInputModel();
  commentModel.content = `new comment${count} for post`;
  return commentModel;
};

export const createInValidCommentModel = (
  count: number = 1,
): CreateCommentInputModel => {
  const invalidCommentModel = new CreateCommentInputModel();
  invalidCommentModel.content = `invalid comment${count}`;
  return invalidCommentModel;
};
