import { CreateUserInputModel } from '../../src/features/user-accounts/users/api/models/input/create-user.input-model';
import { createValidUserModel } from '../models/user-accounts/user.input-model';
import { UsersTestManager } from './users.test-manager';
import { AuthTestManager } from './auth.test-manager';
import { PaginationViewTestDto } from '../models/base/pagination.view-test-dto';

export class CoreTestManager {
  private usersTestManager?: UsersTestManager;
  private authTestManager?: AuthTestManager;
  constructor() {}

  setUsersTestManager(usersTestManager: UsersTestManager) {
    this.usersTestManager = usersTestManager;
  }

  setAuthTestManager(usersTestManager: AuthTestManager) {
    this.authTestManager = usersTestManager;
  }

  async loginUser(count: number = 1) {
    if (!this.authTestManager || !this.usersTestManager) {
      throw new Error(
        'UsersTestManager and AuthTestManager must be set before calling loginUser',
      );
    }
    const validUserModel: CreateUserInputModel = createValidUserModel(count);
    await this.usersTestManager.createUser(validUserModel);
    return await this.authTestManager.loginUser(validUserModel);
  }

  async loginSeveralUsers(count: number = 1) {
    if (!this.authTestManager || !this.usersTestManager) {
      throw new Error(
        'UsersTestManager and AuthTestManager must be set before calling loginUser',
      );
    }
    const validUserModel: CreateUserInputModel = createValidUserModel(count);
    await this.usersTestManager.createUser(validUserModel);
    const loginResults = await this.authTestManager.loginWithRateLimit(
      validUserModel,
      count,
    );
    return loginResults
      .filter((el): el is { accessToken: string; refreshToken: string } => {
        return (
          (el as { accessToken: string; refreshToken: string }).refreshToken !==
          undefined
        );
      })
      .map((el) => el.refreshToken);
  }

  async expectCorrectPagination<T>(
    createModels: T[],
    responseModels: PaginationViewTestDto<T[]>,
  ): Promise<void> {
    expect(responseModels.items.length).toBe(createModels.length);
    expect(responseModels.totalCount).toBe(createModels.length);
    expect(responseModels.items).toEqual(createModels);
    expect(responseModels.pagesCount).toBe(1);
    expect(responseModels.page).toBe(1);
    expect(responseModels.pageSize).toBe(10);
  }
}
