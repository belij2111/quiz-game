import { Injectable } from '@nestjs/common';
import { LikeInputModel } from '../../likes/api/models/input/like.input.model';
import { PostsSqlRepository } from '../infrastructure/posts.sql.repository';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';
import { LikesForPostSqlRepository } from '../../likes/infrastructure/likes-for-post.sql.repository';
import { LikeForPost } from '../../likes/domain/like-for-post.sql.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly likesForPostSqlRepository: LikesForPostSqlRepository,
    private readonly uuidProvider: UuidProvider,
  ) {}

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
