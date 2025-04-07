import { Injectable } from '@nestjs/common';
import { PostCreateModel } from '../api/models/input/create-post.input.model';
import { LikeInputModel } from '../../likes/api/models/input/like.input.model';
import { PostsSqlRepository } from '../infrastructure/posts.sql.repository';
import { BlogsSqlRepository } from '../../blogs/infrastructure/blogs.sql.repository';
import { Post } from '../domain/post.sql.entity';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';
import { PostParamsModel } from '../api/models/input/post-params.model';
import { LikesForPostSqlRepository } from '../../likes/infrastructure/likes-for-post.sql.repository';
import { LikeForPost } from '../../likes/domain/like-for-post.sql.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly likesForPostSqlRepository: LikesForPostSqlRepository,
    private readonly uuidProvider: UuidProvider,
  ) {}

  async create(postCreateModel: PostCreateModel): Promise<string> {
    const foundBlog = await this.blogsSqlRepository.findByIdOrNotFoundFail(
      postCreateModel.blogId,
    );
    const newPostDto: Post = {
      id: this.uuidProvider.generate(),
      title: postCreateModel.title,
      shortDescription: postCreateModel.shortDescription,
      content: postCreateModel.content,
      blogId: foundBlog.id,
      createdAt: new Date(),
    };
    return await this.postsSqlRepository.create(newPostDto);
  }

  async delete(params: PostParamsModel): Promise<boolean> {
    await this.blogsSqlRepository.findByIdOrNotFoundFail(params.blogId);
    const foundPost = await this.postsSqlRepository.findByIdOrNotFoundFail(
      params.postId,
    );
    return this.postsSqlRepository.delete(foundPost.id);
  }

  async update(
    params: PostParamsModel,
    postUpdateModel: PostCreateModel,
  ): Promise<boolean | null> {
    const foundPost = await this.postsSqlRepository.findByIdOrNotFoundFail(
      params.postId,
    );
    const updatedPostDto: PostCreateModel = {
      title: postUpdateModel.title,
      shortDescription: postUpdateModel.shortDescription,
      content: postUpdateModel.content,
      blogId: params.blogId,
    };
    return await this.postsSqlRepository.update(foundPost.id, updatedPostDto);
  }

  async createPostByBlogId(
    blogId: string,
    postCreateModel: PostCreateModel,
  ): Promise<string> {
    const foundBlog =
      await this.blogsSqlRepository.findByIdOrNotFoundFail(blogId);
    const newPostDto: Post = {
      id: this.uuidProvider.generate(),
      title: postCreateModel.title,
      shortDescription: postCreateModel.shortDescription,
      content: postCreateModel.content,
      blogId: foundBlog.id,
      createdAt: new Date(),
    };
    return await this.postsSqlRepository.create(newPostDto);
  }

  async updateLikeStatus(
    currentUserId: string,
    postId: string,
    likeInputModel: LikeInputModel,
  ) {
    await this.postsSqlRepository.findByIdOrNotFoundFail(postId);
    const foundLike = await this.likesForPostSqlRepository.find(
      currentUserId,
      postId,
    );
    if (foundLike) {
      await this.likesForPostSqlRepository.update(foundLike, likeInputModel);
      return;
    }
    const likeDto: LikeForPost = {
      id: this.uuidProvider.generate(),
      createdAt: new Date(),
      status: likeInputModel.likeStatus,
      userId: currentUserId,
      postId: postId,
    };
    await this.likesForPostSqlRepository.create(likeDto);
  }
}
