import { Injectable } from '@nestjs/common';
import { LikeInputModel } from '../../likes/api/models/input/like.input.model';
import { CommentsSqlRepository } from '../infrastructure/comments.sql.repository';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';
import { LikesForCommentSqlRepository } from '../../likes/infrastructure/likes-for-comment.sql.repository';
import { LikeForComment } from '../../likes/domain/like-for-comment.sql.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly likesForCommentSqlRepository: LikesForCommentSqlRepository,
    private readonly uuidProvider: UuidProvider,
  ) {}

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
