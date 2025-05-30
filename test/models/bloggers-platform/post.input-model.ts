import { CreatePostInputTestDto } from './input-test-dto/create-post.input-test-dto';

export const createValidPostModel = (
  count: number = 1,
): CreatePostInputTestDto => {
  const postModel = new CreatePostInputTestDto();
  postModel.title = `Post${count}`;
  postModel.shortDescription = `new post${count}`;
  postModel.content = `new content of post${count}`;
  return postModel;
};

export const createInValidPostModel = (
  count: number = 1,
): CreatePostInputTestDto => {
  const invalidPostModel = new CreatePostInputTestDto();
  invalidPostModel.title = `33333333333333333333333333333333333333333333333333Post${count}`;
  invalidPostModel.shortDescription = `new post${count}`;
  invalidPostModel.content = `new content of post${count}`;
  return invalidPostModel;
};
