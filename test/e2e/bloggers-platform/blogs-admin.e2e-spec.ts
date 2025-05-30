import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../helpers/init-settings';
import {
  createInValidBlogModel,
  createValidBlogModel,
} from '../../models/bloggers-platform/blog.input-model';
import { BlogsAdminTestManager } from '../../tests-managers/blogs.admin-test-manager';
import { deleteAllData } from '../../helpers/delete-all-data';
import {
  createInValidPostModel,
  createValidPostModel,
} from '../../models/bloggers-platform/post.input-model';
import { PostsTestManager } from '../../tests-managers/posts.test-manager';
import { getMockNumberId } from '../../helpers/get-mock-uuid-id';
import { CreateBlogInputTestDto } from '../../models/bloggers-platform/input-test-dto/create-blog.input-test-dto';
import { UpdateBlogInputTestDto } from '../../models/bloggers-platform/input-test-dto/update-blog.input-test-dto';
import { BlogViewTestDto } from '../../models/bloggers-platform/view-test-dto/blog.view-test-dto';
import { PostViewTestDto } from '../../models/bloggers-platform/view-test-dto/post.view-test-dto';
import { CreatePostInputTestDto } from '../../models/bloggers-platform/input-test-dto/create-post.input-test-dto';
import { UpdatePostInputTestDto } from '../../models/bloggers-platform/input-test-dto/update-post.input-test-dto';

describe('e2e-Blogs-admin', () => {
  let app: INestApplication;
  let blogsAdminTestManager: BlogsAdminTestManager;
  let postsTestManager: PostsTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    blogsAdminTestManager = new BlogsAdminTestManager(app, coreConfig);
    postsTestManager = new PostsTestManager(app, coreConfig);
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
      const createdResponse = await blogsAdminTestManager.getBlogsWithPaging(
        HttpStatus.OK,
      );
      blogsAdminTestManager.expectCorrectPagination(
        createdBlogs,
        createdResponse.body,
      );
      // console.log('createdResponse.body :', createdResponse.body);
    });
    it(`shouldn't  return blogs with paging if the request is unauthorized : STATUS 401`, async () => {
      await blogsAdminTestManager.createBlogs(2);
      await blogsAdminTestManager.getBlogsIsNotAuthorized(
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('POST/blogs', () => {
    it(`should create new blog : STATUS 201`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      // console.log('validBlogModel :', validBlogModel);
      const createdResponse: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      // console.log('createdResponse :', createdResponse);
      blogsAdminTestManager.expectCorrectModel(validBlogModel, createdResponse);
    });
    it(`shouldn't create new blog with incorrect input data : STATUS 400`, async () => {
      const invalidBlogModel: CreateBlogInputTestDto =
        createInValidBlogModel(777);
      // console.log('invalidBlogModel :', invalidBlogModel);
      await blogsAdminTestManager.createBlog(
        invalidBlogModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't create new blog if the request is unauthorized : STATUS 401`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      // console.log('validBlogModel :', validBlogModel);
      await blogsAdminTestManager.createBlogIsNotAuthorized(
        validBlogModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('PUT/blogs/:id', () => {
    it(`should update blog by ID : STATUS 204`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel(1);
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      // console.log(createdBlog.id);
      const updatedBlogModel: UpdateBlogInputTestDto =
        createValidBlogModel(555);
      // console.log('updatedBlogModel :', updatedBlogModel);
      await blogsAdminTestManager.updateBlog(
        createdBlog.id,
        updatedBlogModel,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't update blog by ID with incorrect input data : STATUS 400`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel(1);
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      const invalidUpdatedBlogModel: UpdateBlogInputTestDto =
        createInValidBlogModel(0);
      await blogsAdminTestManager.updateBlog(
        createdBlog.id,
        invalidUpdatedBlogModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't update blog by ID if the request is unauthorized: STATUS 401`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel(1);
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      const updatedBlogModel: UpdateBlogInputTestDto =
        createValidBlogModel(555);
      await blogsAdminTestManager.updateBlogIsNotAuthorized(
        createdBlog.id,
        updatedBlogModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't update blog by ID if it does not exist : STATUS 404`, async () => {
      const updatedBlogModel: UpdateBlogInputTestDto =
        createValidBlogModel(555);
      const nonExistentId = getMockNumberId();
      await blogsAdminTestManager.updateBlog(
        nonExistentId,
        updatedBlogModel,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('DELETE/blogs/:id', () => {
    it(`should delete blog by ID : STATUS 204`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel(1);
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      await blogsAdminTestManager.deleteById(
        createdBlog.id,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't delete blog by ID if the request is unauthorized : STATUS 401`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel(1);
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      await blogsAdminTestManager.deleteByIdIsNotAuthorized(
        createdBlog.id,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't delete blog by ID if it does not exist : STATUS 404`, async () => {
      const nonExistentId = getMockNumberId();
      await blogsAdminTestManager.deleteById(
        nonExistentId,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('POST/blogs/:blogId/posts', () => {
    it(`should create a post for the specified blog : STATUS 201`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      const validPostModel: CreatePostInputTestDto = createValidPostModel();
      // console.log('createdBlog.id :', createdBlog.id);
      const createdResponse: PostViewTestDto =
        await blogsAdminTestManager.createPostByBlogId(
          createdBlog.id,
          validPostModel,
          HttpStatus.CREATED,
        );
      // console.log(createdResponse);
      postsTestManager.expectCorrectModel(validPostModel, createdResponse);
    });
    it(`shouldn't create a post with incorrect input data : STATUS 400`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      const inValidPostModel: CreatePostInputTestDto = createInValidPostModel(
        createdBlog.id,
      );
      await blogsAdminTestManager.createPostByBlogId(
        createdBlog.id,
        inValidPostModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't create a post if the request is unauthorized : STATUS 401`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      const validPostModel: CreatePostInputTestDto = createValidPostModel(
        createdBlog.id,
      );
      await blogsAdminTestManager.createPostByBlogIdIsNotAuthorized(
        createdBlog.id,
        validPostModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't create a post if the blogId does not exist : STATUS 404`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      const validPostModel: CreatePostInputTestDto = createValidPostModel(
        createdBlog.id,
      );
      const nonExistentId = getMockNumberId();
      await blogsAdminTestManager.createPostByBlogId(
        nonExistentId,
        validPostModel,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('GET/blogs/:blogId/posts', () => {
    it(`should return all posts for the specified blog : STATUS 200`, async () => {
      const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
      const createdBlog: BlogViewTestDto =
        await blogsAdminTestManager.createBlog(validBlogModel);
      const createdPosts: PostViewTestDto[] =
        await blogsAdminTestManager.createPosts(createdBlog.id, 5);
      const createdResponse = await blogsAdminTestManager.getPostsByBlogId(
        createdBlog.id,
        HttpStatus.OK,
      );
      postsTestManager.expectCorrectPagination(
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
      await blogsAdminTestManager.getPostsByBlogId(
        nonExistentId,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('PUT/sa/blogs/:blogId/posts/:postId', () => {
    let validBlogModel: CreateBlogInputTestDto;
    let createdBlog: BlogViewTestDto;
    let validPostModel: CreatePostInputTestDto;
    let createdPost: PostViewTestDto;
    beforeEach(async () => {
      validBlogModel = createValidBlogModel();
      createdBlog = await blogsAdminTestManager.createBlog(validBlogModel);
      validPostModel = createValidPostModel();
      createdPost = await blogsAdminTestManager.createPostByBlogId(
        createdBlog.id,
        validPostModel,
      );
    });
    it(`should update post by ID for specified blog : STATUS 204`, async () => {
      const updatedPostModel: UpdatePostInputTestDto =
        createValidPostModel(555);
      await blogsAdminTestManager.updatePost(
        createdPost.id,
        createdBlog.id,
        updatedPostModel,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't update post by ID with incorrect input data : STATUS 400`, async () => {
      const invalidUpdatedPostModel: UpdatePostInputTestDto =
        createInValidPostModel(0);
      await blogsAdminTestManager.updatePost(
        createdPost.id,
        createdBlog.id,
        invalidUpdatedPostModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't update post by ID if the request is unauthorized: STATUS 401`, async () => {
      const updatedPostModel: UpdatePostInputTestDto =
        createValidPostModel(555);
      await blogsAdminTestManager.updatePostIsNotAuthorized(
        createdPost.id,
        createdBlog.id,
        updatedPostModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't update post by ID if it does not exist : STATUS 404`, async () => {
      const updatedPostModel: UpdatePostInputTestDto =
        createValidPostModel(555);
      const nonExistentId = getMockNumberId();
      await blogsAdminTestManager.updatePost(
        nonExistentId,
        Number(createdBlog.id),
        updatedPostModel,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe(`DELETE/sa/blogs/:blogId/posts/:id`, () => {
    let validBlogModel: CreateBlogInputTestDto;
    let createdBlog: BlogViewTestDto;
    let validPostModel: CreatePostInputTestDto;
    let createdPost: PostViewTestDto;
    beforeEach(async () => {
      validBlogModel = createValidBlogModel();
      createdBlog = await blogsAdminTestManager.createBlog(validBlogModel);
      validPostModel = createValidPostModel();
      createdPost = await blogsAdminTestManager.createPostByBlogId(
        createdBlog.id,
        validPostModel,
      );
    });
    it(`should delete post by ID : STATUS 204`, async () => {
      await blogsAdminTestManager.deletePostById(
        createdPost.id,
        createdBlog.id,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't delete post by ID if the request is unauthorized : STATUS 401`, async () => {
      await blogsAdminTestManager.deletePostByIdIsNotAuthorized(
        createdPost.id,
        createdBlog.id,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't update post by ID if it does not exist : STATUS 404`, async () => {
      const nonExistentId = getMockNumberId();
      await blogsAdminTestManager.deletePostById(
        nonExistentId,
        createdBlog.id,
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
