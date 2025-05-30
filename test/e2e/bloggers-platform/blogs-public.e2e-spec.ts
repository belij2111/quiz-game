import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../helpers/init-settings';
import { createValidBlogModel } from '../../models/bloggers-platform/blog.input-model';
import { BlogsAdminTestManager } from '../../tests-managers/blogs.admin-test-manager';
import { deleteAllData } from '../../helpers/delete-all-data';
import { getMockNumberId } from '../../helpers/get-mock-uuid-id';
import { CreateBlogInputTestDto } from '../../models/bloggers-platform/input-test-dto/create-blog.input-test-dto';
import { BlogsPublicTestManager } from '../../tests-managers/blogs.public-test-manager';
import { BlogViewTestDto } from '../../models/bloggers-platform/view-test-dto/blog.view-test-dto';
import { PostViewTestDto } from '../../models/bloggers-platform/view-test-dto/post.view-test-dto';
import { CoreTestManager } from '../../tests-managers/core.test-manager';

describe('e2e-Blogs-public', () => {
  let app: INestApplication;
  let blogsAdminTestManager: BlogsAdminTestManager;
  let blogsPublicTestManager: BlogsPublicTestManager;
  let coreTestManager: CoreTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    blogsAdminTestManager = new BlogsAdminTestManager(app, coreConfig);
    blogsPublicTestManager = new BlogsPublicTestManager(app);
    coreTestManager = new CoreTestManager();
  });
  beforeEach(async () => {
    await deleteAllData(app);
  });
  afterEach(async () => {
    await deleteAllData(app);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('GET/blogs', () => {
    it(`should return blogs with paging : STATUS 200`, async () => {
      const createdBlogs: BlogViewTestDto[] =
        await blogsAdminTestManager.createBlogs(2);
      const createdResponse = await blogsPublicTestManager.getBlogsWithPaging(
        HttpStatus.OK,
      );
      await coreTestManager.expectCorrectPagination<BlogViewTestDto>(
        createdBlogs,
        createdResponse.body,
      );
      // console.log('createdResponse.body :', createdResponse.body);
    });
  });

  describe('GET/blogs/:blogId/posts', () => {
    it(`should return all posts for the specified blog : STATUS 200`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      const createdPosts: PostViewTestDto[] =
        await blogsAdminTestManager.createPosts(createdBlog.id, 5);
      const createdResponse = await blogsPublicTestManager.getPostsByBlogId(
        createdBlog.id,
        HttpStatus.OK,
      );
      await coreTestManager.expectCorrectPagination<PostViewTestDto>(
        createdPosts,
        createdResponse.body,
      );
      // console.log('createdResponse.body :', createdResponse.body);
    });
    it(`shouldn't return posts if the blogId does not exist : STATUS 404`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      await blogsAdminTestManager.createPosts(createdBlog.id, 5);
      const nonExistentId = getMockNumberId();
      await blogsPublicTestManager.getPostsByBlogId(
        nonExistentId,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('GET/blog/:id', () => {
    it(`should return blog by ID : STATUS 200`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      // console.log('createdBlog :', createdBlog);
      await blogsPublicTestManager.getBlogById(createdBlog.id, HttpStatus.OK);
    });
    it(`shouldn't return blog by ID if it does not exist : STATUS 404`, async () => {
      const nonExistentId = getMockNumberId();
      await blogsPublicTestManager.getBlogById(
        nonExistentId,
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
