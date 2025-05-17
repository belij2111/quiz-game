export class Paginator<T> {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: T,
  ) {}
}

export class SortQueryFieldsType {
  pageNumber?: number;
  pageSize?: string;
  sortBy?: string;
  sortDirection?: string;
}

export class SortQueryFilterType {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public sortBy: string,
    public sortDirection: 1 | -1,
  ) {}
}

export class SearchNameTermFieldsType {
  searchNameTerm?: string;
}

export class SearchNameTermFilterType {
  constructor(public searchNameTerm: string) {}
}

export class SearchLoginTermFieldsType {
  searchLoginTerm?: string;
}

export class SearchLoginTermFilterType {
  constructor(public searchLoginTerm: string) {}
}

export class SearchEmailTermFieldsType {
  searchEmailTerm?: string;
}

export class SearchEmailTermFilterType {
  constructor(public searchEmailTerm: string) {}
}

export const sortQueryFieldsUtil = (
  query: SortQueryFieldsType,
): SortQueryFilterType => {
  const pageNumber = !isNaN(Number(query.pageNumber))
    ? Number(query.pageNumber)
    : 1;
  const pageSize = !isNaN(Number(query.pageSize)) ? Number(query.pageSize) : 10;
  const sortBy = query.sortBy ? query.sortBy : 'createdAt';
  const sortDirection: 1 | -1 = query.sortDirection === 'asc' ? 1 : -1;

  return new SortQueryFilterType(pageNumber, pageSize, sortBy, sortDirection);
};

export const searchNameTermUtil = (
  query: SearchNameTermFieldsType,
): SearchNameTermFilterType => {
  const searchNameTerm =
    typeof query.searchNameTerm === 'string' ? query.searchNameTerm : '';

  return new SearchNameTermFilterType(searchNameTerm);
};

export const searchLoginTermUtil = (
  query: SearchLoginTermFieldsType,
): SearchLoginTermFilterType => {
  const searchLoginTerm =
    typeof query.searchLoginTerm === 'string' ? query.searchLoginTerm : '';

  return new SearchLoginTermFilterType(searchLoginTerm);
};

export const searchEmailTermUtil = (
  query: SearchEmailTermFieldsType,
): SearchEmailTermFilterType => {
  const searchEmailTerm =
    typeof query.searchEmailTerm === 'string' ? query.searchEmailTerm : '';

  return new SearchEmailTermFilterType(searchEmailTerm);
};
