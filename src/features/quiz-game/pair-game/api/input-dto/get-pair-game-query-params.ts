import { BaseSortablePaginationParams } from '../../../../../core/models/base-query-params.input-model';
import { IsEnum } from 'class-validator';

export enum PairGameSortBy {
  Status = 'status',
  CreatedAt = 'createdAt',
}

export class GetPairGameQueryParams extends BaseSortablePaginationParams<PairGameSortBy> {
  @IsEnum(PairGameSortBy)
  sortBy: PairGameSortBy = PairGameSortBy.CreatedAt;
}
