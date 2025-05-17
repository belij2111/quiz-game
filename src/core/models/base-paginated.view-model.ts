export abstract class PaginatedViewModel<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
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
