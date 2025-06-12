import { ApiProperty } from '@nestjs/swagger';

export abstract class PaginatedViewModel<T> {
  @ApiProperty({ type: 'integer', format: 'int32' })
  pagesCount: number;

  @ApiProperty({ type: 'integer', format: 'int32' })
  page: number;

  @ApiProperty({ type: 'integer', format: 'int32' })
  pageSize: number;

  @ApiProperty({ type: 'integer', format: 'int32' })
  totalCount: number;

  @ApiProperty()
  abstract items: T;

  public static mapToView<T>(data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    items: T;
  }): PaginatedViewModel<T> {
    return {
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      page: data.pageNumber,
      pageSize: data.pageSize,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
