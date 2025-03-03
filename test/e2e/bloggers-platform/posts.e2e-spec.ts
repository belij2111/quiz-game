import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../helpers/init-settings';
import { BlogsTestManager } from '../../tests-managers/blogs-test.manager';
import { deleteAllData } from '../../helpers/delete-all-data';
import { PostsTestManager } from '../../tests-managers/posts-test.manager';
import { BlogCreateModel } from '../../../src/features/bloggers-platform/blogs/api/models/input/create-blog.input.model';
import { createValidBlogModel } from '../../models/bloggers-platform/blog.input.model';
import {
  createInValidPostModel,
  createValidPostModel,
} from '../../models/bloggers-platform/post.input.model';

describe('e2e-Posts', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    blogsTestManager = new BlogsTestManager(app, coreConfig);
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

  describe('POST/posts', () => {
    it(`should create new post : STATUS 201`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdResponse = await postsTestManager.createPost(
        validPostModel,
        HttpStatus.CREATED,
      );
      // console.log('createdResponse :', createdResponse);
      postsTestManager.expectCorrectModel(validPostModel, createdResponse);
    });
    it(`shouldn't create new post with incorrect input data : STATUS 400`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const inValidPostModel = createInValidPostModel(createdBlog.id);
      // console.log('inValidPostModel :', inValidPostModel);
      await postsTestManager.createPost(
        inValidPostModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't create new post if the request is unauthorized : STATUS 401`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const validPostModel = createValidPostModel(createdBlog.id);
      await postsTestManager.createPostIsNotAuthorized(
        validPostModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('GET/posts', () => {
    it(`should return posts with paging : STATUS 200`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const createdPosts = await postsTestManager.createPosts(
        createdBlog.id,
        5,
      );
      const createdResponse = await postsTestManager.getPostsWithPaging(
        HttpStatus.OK,
      );
      postsTestManager.expectCorrectPagination(
        createdPosts,
        createdResponse.body,
      );
      // console.log('createdResponse.body :', createdResponse.body);
    });
  });

  describe('GET/posts/:id', () => {
    it(`should return post by ID : STATUS 200`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(
        validPostModel,
        HttpStatus.CREATED,
      );
      await postsTestManager.getPostById(createdPost.id, HttpStatus.OK);
    });
    it(`shouldn't return blog by ID if the blog does not exist : STATUS 404`, async () => {
      const nonExistentId = '121212121212121212121212';
      await postsTestManager.getPostById(nonExistentId, HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT/posts/:id', () => {
    it(`should update post by ID : STATUS 204`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(validPostModel);
      const updatedPostModel = createValidPostModel(createdBlog.id, 555);
      await postsTestManager.updatePost(
        createdPost.id,
        updatedPostModel,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't update post by ID with incorrect input data : STATUS 400`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(validPostModel);
      const invalidUpdatedPostModel = createInValidPostModel(createdBlog.id, 0);
      await postsTestManager.updatePost(
        createdPost.id,
        invalidUpdatedPostModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't update post by ID if the request is unauthorized: STATUS 401`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(validPostModel);
      const updatedPostModel = createValidPostModel(createdBlog.id, 555);
      await postsTestManager.updatePostIsNotAuthorized(
        createdPost.id,
        updatedPostModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't update post by ID if the post does not exist : STATUS 404`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const updatedPostModel = createValidPostModel(createdBlog.id, 555);
      const nonExistentId = '121212121212121212121212';
      await postsTestManager.updatePost(
        nonExistentId,
        updatedPostModel,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe(`DELETE/posts/:id`, () => {
    it(`should delete post by ID : STATUS 204`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(validPostModel);
      await postsTestManager.deleteById(createdPost.id, HttpStatus.NO_CONTENT);
    });
    it(`shouldn't delete post by ID if the request is unauthorized : STATUS 401`, async () => {
      const validBlogModel: BlogCreateModel = createValidBlogModel();
      const createdBlog = await blogsTestManager.createBlog(validBlogModel);
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(validPostModel);
      await postsTestManager.deleteByIdIsNotAuthorized(
        createdPost.id,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't update post by ID if the post does not exist : STATUS 404`, async () => {
      const nonExistentId = '121212121212121212121212';
      await postsTestManager.deleteById(nonExistentId, HttpStatus.NOT_FOUND);
    });
  });
});
