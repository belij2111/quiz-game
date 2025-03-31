import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommentCreateModel } from '../api/models/input/create-comment.input.model';
import { Comment } from '../domain/comment.sql.entity';
import { LikeInputModel } from '../../likes/api/models/input/like.input.model';
import { UsersSqlRepository } from '../../../user-accounts/users/infrastructure/users.sql.repository';
import { PostsSqlRepository } from '../../posts/infrastructure/posts.sql.repository';
import { CommentsSqlRepository } from '../infrastructure/comments.sql.repository';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';
import { LikesForCommentSqlRepository } from '../../likes/infrastructure/likes-for-comment.sql.repository';
import { LikeForComment } from '../../likes/domain/like-for-comment.sql.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly likesForCommentSqlRepository: LikesForCommentSqlRepository,
    private readonly uuidProvider: UuidProvider,
  ) {}

  async create(
    userId: string,
    postId: string,
    commentCreateModel: CommentCreateModel,
  ): Promise<string> {
    const fondUser =
      await this.usersSqlRepository.findByIdOrNotFoundFail(userId);
    const fondPost =
      await this.postsSqlRepository.findByIdOrNotFoundFail(postId);
    const createCommentDto: Comment = {
      id: this.uuidProvider.generate(),
      content: commentCreateModel.content,
      createdAt: new Date(),
      postId: fondPost.id,
      userId: fondUser.id,
    };
    return await this.commentsSqlRepository.create(createCommentDto);
  }

  async update(
    userId: string,
    commentId: string,
    commentCreateModel: CommentCreateModel,
  ): Promise<boolean | null> {
    const foundComment =
      await this.commentsSqlRepository.findByIdOrNotFoundFail(commentId);
    if (foundComment.userId !== userId) {
      throw new ForbiddenException([
        { field: 'user', message: 'The comment is not your own' },
      ]);
    }
    const updateCommentDto: CommentCreateModel = {
      content: commentCreateModel.content,
    };
    return await this.commentsSqlRepository.update(
      foundComment,
      updateCommentDto,
    );
  }

  async delete(userId: string, commentId: string) {
    const foundComment =
      await this.commentsSqlRepository.findByIdOrNotFoundFail(commentId);
    if (foundComment.userId !== userId) {
      throw new ForbiddenException([
        { field: 'user', message: 'The comment is not your own' },
      ]);
    }
    return await this.commentsSqlRepository.delete(foundComment.id);
  }

  async updateLikeStatus(
    currentUserId: string,
    commentId: string,
    likeInputModel: LikeInputModel,
  ) {
    await this.commentsSqlRepository.findByIdOrNotFoundFail(commentId);
    const foundLike = await this.likesForCommentSqlRepository.find(
      currentUserId,
      commentId,
    );
    if (foundLike) {
      await this.likesForCommentSqlRepository.update(foundLike, likeInputModel);
      return;
    }
    const likeDto: LikeForComment = {
      id: this.uuidProvider.generate(),
      createdAt: new Date(),
      status: likeInputModel.likeStatus,
      userId: currentUserId,
      commentId: commentId,
    };
    await this.likesForCommentSqlRepository.create(likeDto);
  }
}
