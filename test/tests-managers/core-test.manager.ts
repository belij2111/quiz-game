import { UserCreateModel } from '../../src/features/user-accounts/users/api/models/input/create-user.input.model';
import { createValidUserModel } from '../models/user-accounts/user.input.model';
import { UsersTestManager } from './users-test.manager';
import { AuthTestManager } from './auth-test.manager';

export class CoreTestManager {
  constructor(
    private readonly usersTestManager: UsersTestManager,
    private readonly authTestManager: AuthTestManager,
  ) {}

  async loginUser(count: number = 1) {
    const validUserModel: UserCreateModel = createValidUserModel(count);
    await this.usersTestManager.createUser(validUserModel);
    return await this.authTestManager.loginUser(validUserModel);
  }
}
