import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';
import { ILike, Repository } from 'typeorm';
import { UserViewModel } from '../api/models/view/user.view.model';
import { GetUsersQueryParams } from '../api/models/input/create-user.input.model';
import { PaginatedViewModel } from '../../../../core/models/base.paginated.view.model';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersQueryRepository: Repository<User>,
  ) {}

  async getById(id: string): Promise<UserViewModel | null> {
    const foundUser = await this.usersQueryRepository.findOneBy({ id: id });
    if (!foundUser) return null;
    return UserViewModel.mapToView(foundUser);
  }

  async getAll(
    inputQuery: GetUsersQueryParams,
  ): Promise<PaginatedViewModel<UserViewModel[]>> {
    const { searchLoginTerm = '', searchEmailTerm = '' } = inputQuery;
    const [fondUsers, totalCount] =
      await this.usersQueryRepository.findAndCount({
        where: {
          ...(searchLoginTerm && { login: ILike(`%${searchLoginTerm}%`) }),
          ...(searchEmailTerm && { email: ILike(`%${searchEmailTerm}%`) }),
        },
        order: {
          [inputQuery.sortBy]: inputQuery.sortDirection,
        },
        skip: inputQuery.calculateSkip(),
        take: inputQuery.pageSize,
      });
    const items = fondUsers.map(UserViewModel.mapToView);
    return PaginatedViewModel.mapToView({
      pageNumber: inputQuery.pageNumber,
      pageSize: inputQuery.pageSize,
      totalCount,
      items,
    });
  }
}
