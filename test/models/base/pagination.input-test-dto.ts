class PaginationInputTestDto {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public sortBy: string,
    public sortDirection: string,
  ) {}
}

export const paginationInputParams = new PaginationInputTestDto(
  1,
  10,
  'createdAt',
  'desc',
);
