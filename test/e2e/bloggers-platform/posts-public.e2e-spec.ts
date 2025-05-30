import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../helpers/init-settings';
import { BlogsAdminTestManager } from '../../tests-managers/blogs.admin-test-manager';
import { deleteAllData } from '../../helpers/delete-all-data';
import { PostsTestManager } from '../../tests-managers/posts.test-manager';
import { createValidBlogModel } from '../../models/bloggers-platform/blog.input-model';
import { createValidPostModel } from '../../models/bloggers-platform/post.input-model';
import {
  createInValidCommentModel,
  createValidCommentModel,
} from '../../models/bloggers-platform/comment.input-model';
import { UsersTestManager } from '../../tests-managers/users.test-manager';
import { AuthTestManager } from '../../tests-managers/auth.test-manager';
import { CoreTestManager } from '../../tests-managers/core.test-manager';
import { CommentsTestManager } from '../../tests-managers/comments.test-manager';
import { delay } from '../../helpers/delay';
import {
  createInvalidLikeStatusModel,
  createLikeStatusModel,
} from '../../models/bloggers-platform/create-like-status.model';
import { getMockNumberId } from '../../helpers/get-mock-uuid-id';
import { CreateBlogInputTestDto } from '../../models/bloggers-platform/input-test-dto/create-blog.input-test-dto';
import { PostViewTestDto } from '../../models/bloggers-platform/view-test-dto/post.view-test-dto';
import { BlogViewTestDto } from '../../models/bloggers-platform/view-test-dto/blog.view-test-dto';
import { CreateCommentInputTestDto } from '../../models/bloggers-platform/input-test-dto/create-comment.input-test-dto';
import { LikeStatusTestEnum } from '../../models/bloggers-platform/enums/like-status.test-enum';
import { LoginSuccessViewTestDto } from '../../models/user-accounts/view-test-dto/login-success.view-test-dto';
import { CreatePostInputTestDto } from '../../models/bloggers-platform/input-test-dto/create-post.input-test-dto';
import { LikeInputTestDTO } from '../../models/bloggers-platform/input-test-dto/like.input-test-dto';
import { CommentViewTestDto } from '../../models/bloggers-platform/view-test-dto/comment.view-test-dto';

describe('e2e-Posts', () => {
  let app: INestApplication;
  let blogsAdminTestManager: BlogsAdminTestManager;
  let postsTestManager: PostsTestManager;
  let usersTestManager: UsersTestManager;
  let authTestManager: AuthTestManager;
  let coreTestManager: CoreTestManager;
  let commentsTestManager: CommentsTestManager;
  let createdBlog: BlogViewTestDto;
  let createdPost: PostViewTestDto;
  let loginResult: LoginSuccessViewTestDto | undefined;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    const coreConfig = result.coreConfig;
    blogsAdminTestManager = new BlogsAdminTestManager(app, coreConfig);
    postsTestManager = new PostsTestManager(app, coreConfig);
    usersTestManager = new UsersTestManager(app, coreConfig);
    authTestManager = new AuthTestManager(app, coreConfig);
    coreTestManager = new CoreTestManager();
    coreTestManager.setUsersTestManager(usersTestManager);
    coreTestManager.setAuthTestManager(authTestManager);
    commentsTestManager = new CommentsTestManager(app);
  });
  beforeEach(async () => {
    await deleteAllData(app);
    const validBlogModel: CreateBlogInputTestDto = createValidBlogModel();
    createdBlog = await blogsAdminTestManager.createBlog(validBlogModel);
  });
  afterEach(async () => {
    await deleteAllData(app);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('PUT/:postId/like-status', () => {
    beforeEach(async () => {
      const validPostModel: CreatePostInputTestDto = createValidPostModel();
      createdPost = await blogsAdminTestManager.createPostByBlogId(
        createdBlog.id,
        validPostModel,
      );
      await delay(3000);
      loginResult = await coreTestManager.loginUser();
    });
    it(`should update the like status for the post : STATUS 204`, async () => {
      const updateLikeStatusModel: LikeInputTestDTO = createLikeStatusModel(
        LikeStatusTestEnum.Like,
      );
      await postsTestManager.updateLikeStatus(
        loginResult!.accessToken,
        createdPost.id,
        updateLikeStatusModel,
        HttpStatus.NO_CONTENT,
      );
    });
    it(`shouldn't update the like status with incorrect input data : STATUS 400`, async () => {
      const invalidUpdateLikeStatusModel = createInvalidLikeStatusModel();
      await postsTestManager.updateLikeStatus(
        loginResult!.accessToken,
        createdPost.id,
        invalidUpdateLikeStatusModel,
        HttpStatus.BAD_REQUEST,
      );
    });
    it(`shouldn't update the like status if accessTokens expired : STATUS 401`, async () => {
      const updateLikeStatusModel: LikeInputTestDTO = createLikeStatusModel(
        LikeStatusTestEnum.Dislike,
      );
      await delay(10000);
      await postsTestManager.updateLikeStatus(
        loginResult!.accessToken,
        createdPost.id,
        updateLikeStatusModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't update the like status if the postId does not exist : STATUS 404`, async () => {
      const updateLikeStatusModel: LikeInputTestDTO = createLikeStatusModel(
        LikeStatusTestEnum.Dislike,
      );
      const nonExistentId = getMockNumberId();
      await postsTestManager.updateLikeStatus(
        loginResult!.accessToken,
        nonExistentId,
        updateLikeStatusModel,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('GET/posts/:postId/comments', () => {
    beforeEach(async () => {
      const validPostModel: CreatePostInputTestDto = createValidPostModel();
      createdPost = await blogsAdminTestManager.createPostByBlogId(
        createdBlog.id,
        validPostModel,
      );
    });
    it(`should return all comments for the specified post : STATUS 200`, async () => {
      const loginResult: LoginSuccessViewTestDto | undefined =
        await coreTestManager.loginUser();
      const createdComments: CommentViewTestDto[] =
        await commentsTestManager.createComments(
          loginResult!.accessToken,
          createdPost.id,
          5,
        );
      const createdResponse = await commentsTestManager.getCommentsWithPaging(
        createdPost.id,
        HttpStatus.OK,
      );
      await coreTestManager.expectCorrectPagination<CommentViewTestDto>(
        createdComments,
        createdResponse.body,
      );
      // console.log('createdResponse.body :', createdResponse.body);
    });
    it(`shouldn't return all comments if the postId does not exist : STATUS 404`, async () => {
      const loginResult: LoginSuccessViewTestDto | undefined =
        await coreTestManager.loginUser();
      await commentsTestManager.createComments(
        loginResult!.accessToken,
        createdPost.id,
        5,
      );
      const nonExistentId = getMockNumberId();
      await commentsTestManager.getCommentsWithPaging(
        nonExistentId,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('POST/posts/:postId/comments', () => {
    beforeEach(async () => {
      const validPostModel: CreatePostInputTestDto = createValidPostModel();
      createdPost = await blogsAdminTestManager.createPostByBlogId(
        createdBlog.id,
        validPostModel,
      );
    });
    it(`should create comment for specified post : STATUS 201`, async () => {
      const validCommentModel: CreateCommentInputTestDto =
        createValidCommentModel();
      const loginResult: LoginSuccessViewTestDto | undefined =
        await coreTestManager.loginUser();
      const createdResponse = await commentsTestManager.createComment(
        loginResult!.accessToken,
        createdPost.id,
        validCommentModel,
        HttpStatus.CREATED,
      );
      // console.log('createdResponse :', createdResponse);
      commentsTestManager.expectCorrectModel(
        validCommentModel,
        createdResponse,
      );
    });
    it(`shouldn't create comment if accessTokens expired : STATUS 401`, async () => {
      const validCommentModel: CreateCommentInputTestDto =
        createValidCommentModel();
      const loginResult: LoginSuccessViewTestDto | undefined =
        await coreTestManager.loginUser();
      await delay(10000);
      await commentsTestManager.createComment(
        loginResult!.accessToken,
        createdPost.id,
        validCommentModel,
        HttpStatus.UNAUTHORIZED,
      );
    });
    it(`shouldn't create comment if the postId does not exist : STATUS 404`, async () => {
      const validCommentModel: CreateCommentInputTestDto =
        createValidCommentModel();
      const loginResult: LoginSuccessViewTestDto | undefined =
        await coreTestManager.loginUser();
      const nonExistentId = getMockNumberId();
      await commentsTestManager.createComment(
        loginResult!.accessToken,
        nonExistentId,
        validCommentModel,
        HttpStatus.NOT_FOUND,
      );
    });
    it(`shouldn't create comment with incorrect input data : STATUS 400`, async () => {
      const invalidCommentModel: CreateCommentInputTestDto =
        createInValidCommentModel();
      const loginResult: LoginSuccessViewTestDto | undefined =
        await coreTestManager.loginUser();
      await commentsTestManager.createComment(
        loginResult!.accessToken,
        createdPost.id,
        invalidCommentModel,
        HttpStatus.BAD_REQUEST,
      );
    });
  });

  describe('GET/posts', () => {
    it(`should return posts with paging : STATUS 200`, async () => {
      const createdPosts: PostViewTestDto[] =
        await blogsAdminTestManager.createPosts(createdBlog.id, 5);

      const createdResponse = await postsTestManager.getPostsWithPaging(
        HttpStatus.OK,
      );
      await coreTestManager.expectCorrectPagination<PostViewTestDto>(
        createdPosts,
        createdResponse.body,
      );
      // console.log('createdResponse.body :', createdResponse.body);
    });
  });

  describe('GET/posts/:id', () => {
    it(`should return post by ID : STATUS 200`, async () => {
      const validPostModel: CreatePostInputTestDto = createValidPostModel();
      const createdPost: PostViewTestDto =
        await blogsAdminTestManager.createPostByBlogId(
          createdBlog.id,
          validPostModel,
        );
      await postsTestManager.getPostById(createdPost.id, HttpStatus.OK);
    });
    it(`shouldn't return post by ID if it does not exist : STATUS 404`, async () => {
      const nonExistentId = getMockNumberId();
      await postsTestManager.getPostById(nonExistentId, HttpStatus.NOT_FOUND);
    });
  });
});
