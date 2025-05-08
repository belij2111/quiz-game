import { PostCreateModel } from '../../../src/features/bloggers-platform/posts/api/models/input/create-post.input.model';

export const createValidPostModel = (
  blogId: number,
  count: number = 1,
): PostCreateModel => {
  const postModel = new PostCreateModel();
  postModel.title = `Post${count}`;
  postModel.shortDescription = `new post${count}`;
  postModel.content = `new content of post${count}`;
  postModel.blogId = blogId;
  return postModel;
};

export const createInValidPostModel = (
  blogId: number,
  count: number = 1,
): PostCreateModel => {
  const invalidPostModel = new PostCreateModel();
  invalidPostModel.title = `33333333333333333333333333333333333333333333333333Post${count}`;
  invalidPostModel.shortDescription = `new post${count}`;
  invalidPostModel.content = `new content of post${count}`;
  invalidPostModel.blogId = blogId;
  return invalidPostModel;
};
