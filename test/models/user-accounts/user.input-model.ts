import { CreateUserInputTestDto } from '../bloggers-platform/input-test-dto/create-user.input-test-dto';

export const createValidUserModel = (
  count: number = 1,
): CreateUserInputTestDto => {
  const userModel = new CreateUserInputTestDto();
  userModel.login = `User_${count}`;
  userModel.password = `qwerty_${count}`;
  userModel.email = `user_${count}@gmail.com`;
  return userModel;
};

export const createInValidUserModel = (
  count: number = 1,
): CreateUserInputTestDto => {
  const invalidUserModel = new CreateUserInputTestDto();
  invalidUserModel.login = `User_${count}`;
  invalidUserModel.password = `qwerty_${count}`;
  invalidUserModel.email = `invalid email${count}`;
  return invalidUserModel;
};

export const createSeveralUsersModels = (
  count: number = 1,
): CreateUserInputTestDto[] => {
  const users: CreateUserInputTestDto[] = [];
  for (let i = 1; i <= count; i++) {
    const userModel = new CreateUserInputTestDto();
    userModel.login = `User_${i}`;
    userModel.password = `qwerty_${i}`;
    userModel.email = `user_${i}@gmail.com`;
    users.push(userModel);
  }
  return users;
};
