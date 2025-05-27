import { CreateBlogInputTestDto } from './input-test-dto/create-blog.input-test-dto';

export const createValidBlogModel = (
  count: number = 1,
): CreateBlogInputTestDto => {
  const blogModel = new CreateBlogInputTestDto();
  blogModel.name = `Blog${count}`;
  blogModel.description = `new blog ${count}`;
  blogModel.websiteUrl = `https://www.example${count}.com`;
  return blogModel;
};

export const createInValidBlogModel = (
  count: number = 1,
): CreateBlogInputTestDto => {
  const invalidBlogModel = new CreateBlogInputTestDto();
  invalidBlogModel.name = `Blog${count}`;
  invalidBlogModel.description = `new blog ${count}`;
  invalidBlogModel.websiteUrl = `invalid url${count}`;
  return invalidBlogModel;
};
