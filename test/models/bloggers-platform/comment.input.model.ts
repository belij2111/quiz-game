import { CommentCreateModel } from '../../../src/features/bloggers-platform/comments/api/models/input/create-comment.input.model';

export const createValidCommentModel = (
  count: number = 1,
): CommentCreateModel => {
  const commentModel = new CommentCreateModel();
  commentModel.content = `new comment${count} for post`;
  return commentModel;
};

export const createInValidCommentModel = (
  count: number = 1,
): CommentCreateModel => {
  const invalidCommentModel = new CommentCreateModel();
  invalidCommentModel.content = `invalid comment${count}`;
  return invalidCommentModel;
};
