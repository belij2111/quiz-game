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
import { CommentCreateModel } from '../../../src/features/bloggers-platform/comments/api/models/input/create-comment.input.model';
import {
  createInValidCommentModel,
  createValidCommentModel,
} from '../../models/bloggers-platform/comment.input.model';
import { UsersTestManager } from '../../tests-managers/users-test.manager';
import { AuthTestManager } from '../../tests-managers/auth-test.manager';
import { CoreTestManager } from '../../tests-managers/core-test.manager';
import { CommentsTestManager } from '../../tests-managers/comments-test.manager';
import { PostViewModel } from '../../../src/features/bloggers-platform/posts/api/models/view/post.view.model';
import { delay } from '../../helpers/delay';
import { BlogViewModel } from '../../../src/features/bloggers-platform/blogs/api/models/view/blog.view.model';

describe('e2e-Posts', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;
  let usersTestManager: UsersTestManager;
  let authTestManager: AuthTestManager;
  let coreTestManager: CoreTestManager;
  let commentsTestManager: CommentsTestManager;
  let createdBlog: BlogViewModel;
  let createdPost: PostViewModel;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    blogsTestManager = new BlogsTestManager(app, coreConfig);
    postsTestManager = new PostsTestManager(app, coreConfig);
    usersTestManager = new UsersTestManager(app, coreConfig);
    authTestManager = new AuthTestManager(app, coreConfig);
    coreTestManager = new CoreTestManager(usersTestManager, authTestManager);
    commentsTestManager = new CommentsTestManager(app);
  });
  beforeEach(async () => {
    await deleteAllData(app);
    const validBlogModel: BlogCreateModel = createValidBlogModel();
    createdBlog = await blogsTestManager.createBlog(validBlogModel);
  });
  afterEach(async () => {
    await deleteAllData(app);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('POST/posts', () => {
    it(`should create new post : STATUS 201`, async () => {
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdResponse = await postsTestManager.createPost(
        validPostModel,
        HttpStatus.CREATED,
      );
      // console.log('createdResponse :', createdResponse);
      postsTestManager.expectCorrectModel(validPostModel, createdResponse);
    });
    it(`shouldn't create new post with incorrect input data : STATUS 400`, async () => {
      const inValidPostModel = createInValidPostModel(createdBlog.id);
      // console.log('inValidPostModel :', inValidPostModel);
      await postsTestManager.createPost(
        inValidPostModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't create new post if the request is unauthorized : STATUS 401`, async () => {
      const validPostModel = createValidPostModel(createdBlog.id);
      await postsTestManager.createPostIsNotAuthorized(
        validPostModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('GET/posts', () => {
    it(`should return posts with paging : STATUS 200`, async () => {
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
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(validPostModel);
      await postsTestManager.getPostById(createdPost.id, HttpStatus.OK);
    });
    it(`shouldn't return post by ID if it does not exist : STATUS 404`, async () => {
      const nonExistentId = '121212121212121212121212';
      await postsTestManager.getPostById(nonExistentId, HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT/posts/:id', () => {
    it(`should update post by ID : STATUS 204`, async () => {
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
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(validPostModel);
      const updatedPostModel = createValidPostModel(createdBlog.id, 555);
      await postsTestManager.updatePostIsNotAuthorized(
        createdPost.id,
        updatedPostModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't update post by ID if it does not exist : STATUS 404`, async () => {
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
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(validPostModel);
      await postsTestManager.deleteById(createdPost.id, HttpStatus.NO_CONTENT);
    });
    it(`shouldn't delete post by ID if the request is unauthorized : STATUS 401`, async () => {
      const validPostModel = createValidPostModel(createdBlog.id);
      const createdPost = await postsTestManager.createPost(validPostModel);
      await postsTestManager.deleteByIdIsNotAuthorized(
        createdPost.id,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't update post by ID if it does not exist : STATUS 404`, async () => {
      const nonExistentId = '121212121212121212121212';
      await postsTestManager.deleteById(nonExistentId, HttpStatus.NOT_FOUND);
    });
  });

  describe('POST/posts/:postId/comments', () => {
    beforeEach(async () => {
      const validPostModel = createValidPostModel(createdBlog.id);
      createdPost = await postsTestManager.createPost(validPostModel);
    });
    it(`should create comment for specified post : STATUS 201`, async () => {
      const validCommentModel: CommentCreateModel = createValidCommentModel();
      const loginResult = await coreTestManager.loginUser();
      const createdResponse = await commentsTestManager.createComment(
        loginResult!.accessToken,
        createdPost.id,
        validCommentModel,
        HttpStatus.CREATED,
      );
      //console.log('createdResponse :',createdResponse);
      commentsTestManager.expectCorrectModel(
        validCommentModel,
        createdResponse,
      );
    });
    it(`shouldn't create comment with incorrect input data : STATUS 400`, async () => {
      const invalidCommentModel: CommentCreateModel =
        createInValidCommentModel();
      const loginResult = await coreTestManager.loginUser();
      await commentsTestManager.createComment(
        loginResult!.accessToken,
        createdPost.id,
        invalidCommentModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't create comment with if accessTokens expired : STATUS 401`, async () => {
      const validCommentModel: CommentCreateModel = createValidCommentModel();
      const loginResult = await coreTestManager.loginUser();
      await delay(10000);
      await commentsTestManager.createComment(
        loginResult!.accessToken,
        createdPost.id,
        validCommentModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't create comment if the postId does not exist : STATUS 404`, async () => {
      const validCommentModel: CommentCreateModel = createValidCommentModel();
      const loginResult = await coreTestManager.loginUser();
      const nonExistentId = '121212121212121212121212';
      await commentsTestManager.createComment(
        loginResult!.accessToken,
        nonExistentId,
        validCommentModel,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('GET/posts/:postId/comments', () => {
    beforeEach(async () => {
      const validPostModel = createValidPostModel(createdBlog.id);
      createdPost = await postsTestManager.createPost(validPostModel);
    });
    it(`should return all comments for the specified post : STATUS 200`, async () => {
      const loginResult = await coreTestManager.loginUser();
      const createdComments = await commentsTestManager.createComments(
        loginResult!.accessToken,
        createdPost.id,
        5,
      );
      const createdResponse = await commentsTestManager.getCommentsWithPaging(
        createdPost.id,
        HttpStatus.OK,
      );
      commentsTestManager.expectCorrectPagination(
        createdComments,
        createdResponse.body,
      );
      //console.log('createdResponse.body :', createdResponse.body);
    });
    it(`shouldn't return all comments if the postId does not exist : STATUS 404`, async () => {
      const loginResult = await coreTestManager.loginUser();
      await commentsTestManager.createComments(
        loginResult!.accessToken,
        createdPost.id,
        5,
      );
      const nonExistentId = '121212121212121212121212';
      await commentsTestManager.getCommentsWithPaging(
        nonExistentId,
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
