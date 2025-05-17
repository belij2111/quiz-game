import { CreateBlogInputModel } from '../../../src/features/bloggers-platform/blogs/api/models/input/create-blog.input-model';

export const createValidBlogModel = (
  count: number = 1,
): CreateBlogInputModel => {
  const blogModel = new CreateBlogInputModel();
  blogModel.name = `Blog${count}`;
  blogModel.description = `new blog ${count}`;
  blogModel.websiteUrl = `https://www.example${count}.com`;
  return blogModel;
};

export const createInValidBlogModel = (
  count: number = 1,
): CreateBlogInputModel => {
  const invalidBlogModel = new CreateBlogInputModel();
  invalidBlogModel.name = `Blog${count}`;
  invalidBlogModel.description = `new blog ${count}`;
  invalidBlogModel.websiteUrl = `invalid url${count}`;
  return invalidBlogModel;
};
