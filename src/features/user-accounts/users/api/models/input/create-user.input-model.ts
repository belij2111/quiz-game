import { IsEmail, IsEnum, IsOptional, Length, Matches } from 'class-validator';
import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';
import { BaseSortablePaginationParams } from '../../../../../../core/models/base-query-params.input-model';

export class CreateUserInputModel {
  @TrimIsString()
  @Length(3, 10, {
    message: 'login length should be from 3 to 10 symbols',
  })
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message:
      'login should contain only letters, numbers, underscores, and hyphens',
  })
  login: string;

  @TrimIsString()
  @Length(6, 20, {
    message: 'password length should be from 6 to 20 symbols',
  })
  password: string;

  @TrimIsString()
  @IsEmail()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'email should follow the pattern: example@example.com',
  })
  email: string;
}

export enum UsersSortBy {
  Login = 'login',
  Email = 'email',
  CreatedAt = 'createdAt',
}

export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  @IsEnum(UsersSortBy)
  sortBy = UsersSortBy.CreatedAt;

  @TrimIsString()
  @IsOptional()
  searchLoginTerm: string | null = null;

  @TrimIsString()
  @IsOptional()
  searchEmailTerm: string | null = null;
}
