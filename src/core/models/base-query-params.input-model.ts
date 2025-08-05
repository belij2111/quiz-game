import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationParams {
  @Type(() => Number)
  @ApiProperty({
    required: false,
    type: 'integer',
    format: 'int32',
    description: 'pageNumber is number of portions that should be returned',
    default: 1,
  })
  pageNumber: number = 1;

  @Type(() => Number)
  @ApiProperty({
    required: false,
    type: 'integer',
    format: 'int32',
    description: 'pageSize is portions size that should be returned',
    default: 10,
  })
  pageSize: number = 10;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

export abstract class BaseSortablePaginationParams<T> extends PaginationParams {
  @ApiProperty({
    required: false,
    type: String,
    default: 'createdAt',
  })
  abstract sortBy: T;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Default value: desc',
    enum: SortDirection,
  })
  sortDirection: SortDirection = SortDirection.Desc;
}
