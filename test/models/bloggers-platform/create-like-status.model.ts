import { LikeStatusTestEnum } from './enums/like-status.test-enum';
import { LikeInputTestDTO } from './input-test-dto/like.input-test-dto';

export const createLikeStatusModel = (
  likeStatus: LikeStatusTestEnum,
): LikeInputTestDTO => {
  const likeModel = new LikeInputTestDTO();
  likeModel.likeStatus = likeStatus;
  return likeModel;
};
