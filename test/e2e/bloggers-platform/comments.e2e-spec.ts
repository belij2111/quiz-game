import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../../helpers/init-settings';
import { BlogsTestManager } from '../../tests-managers/blogs-test.manager';
import { deleteAllData } from '../../helpers/delete-all-data';
import { PostsTestManager } from '../../tests-managers/posts-test.manager';
import { BlogCreateModel } from '../../../src/features/bloggers-platform/blogs/api/models/input/create-blog.input.model';
import { createValidBlogModel } from '../../models/bloggers-platform/blog.input.model';
import { createValidPostModel } from '../../models/bloggers-platform/post.input.model';
import { CommentsTestManager } from '../../tests-managers/comments-test.manager';
import { createValidCommentModel } from '../../models/bloggers-platform/comment.input.model';
import { CommentCreateModel } from '../../../src/features/bloggers-platform/comments/api/models/input/create-comment.input.model';
import { UsersTestManager } from '../../tests-managers/users-test.manager';
import { AuthTestManager } from '../../tests-managers/auth-test.manager';
import { CoreTestManager } from '../../tests-managers/core-test.manager';
import { BlogViewModel } from '../../../src/features/bloggers-platform/blogs/api/models/view/blog.view.model';
import { PostViewModel } from '../../../src/features/bloggers-platform/posts/api/models/view/post.view.model';
import { CommentViewModel } from '../../../src/features/bloggers-platform/comments/api/models/view/comment.view.model';

describe('e2e-Comments', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;
  let usersTestManager: UsersTestManager;
  let authTestManager: AuthTestManager;
  let coreTestManager: CoreTestManager;
  let commentsTestManager: CommentsTestManager;
  let createdBlog: BlogViewModel;
  let createdPost: PostViewModel;
  let createdComment: CommentViewModel;

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
    const validPostModel = createValidPostModel(createdBlog.id);
    createdPost = await postsTestManager.createPost(validPostModel);
    const loginResult = await coreTestManager.loginUser();
    const validCommentModel: CommentCreateModel = createValidCommentModel();
    createdComment = await commentsTestManager.createComment(
      loginResult!.accessToken,
      createdPost.id,
      validCommentModel,
    );
  });
  afterEach(async () => {
    await deleteAllData(app);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('GET/comments/:id', () => {
    it(`should return comment by ID : STATUS 200`, async () => {
      await commentsTestManager.getCommentById(
        createdComment.id,
        HttpStatus.OK,
      );
    });
    it(`shouldn't return comment by ID if it does not exist : STATUS 404`, async () => {
      const nonExistentId = '121212121212121212121212';
      await commentsTestManager.getCommentById(
        nonExistentId,
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
