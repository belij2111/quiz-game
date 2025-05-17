import { Post } from '../../../src/features/bloggers-platform/posts/domain/post.entity';

export const createValidPostModel = (blogId: any, count: number = 1): any => {
  const postModel = new Post();
  postModel.title = `Post${count}`;
  postModel.shortDescription = `new post${count}`;
  postModel.content = `new content of post${count}`;
  postModel.blogId = blogId;
  return postModel;
};

export const createInValidPostModel = (blogId: any, count: number = 1): any => {
  const invalidPostModel = new Post();
  invalidPostModel.title = `33333333333333333333333333333333333333333333333333Post${count}`;
  invalidPostModel.shortDescription = `new post${count}`;
  invalidPostModel.content = `new content of post${count}`;
  invalidPostModel.blogId = blogId;
  return invalidPostModel;
};
