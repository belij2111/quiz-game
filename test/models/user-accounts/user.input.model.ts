import { UserCreateModel } from '../../../src/features/user-accounts/users/api/models/input/create-user.input.model';

export const createValidUserModel = (count: number = 1): UserCreateModel => {
  const userModel = new UserCreateModel();
  userModel.login = `User_${count}`;
  userModel.password = `qwerty_${count}`;
  userModel.email = `user_${count}@gmail.com`; // `belijtestback7777@gmail.com`; //`user_${count}@gmail.com`;
  return userModel;
};

export const createInValidUserModel = (count: number = 1): UserCreateModel => {
  const invalidUserModel = new UserCreateModel();
  invalidUserModel.login = `User_${count}`;
  invalidUserModel.password = `qwerty_${count}`;
  invalidUserModel.email = `invalid email${count}`;
  return invalidUserModel;
};

export const createSeveralUsersModels = (
  count: number = 1,
): UserCreateModel[] => {
  const users: UserCreateModel[] = [];
  for (let i = 1; i <= count; i++) {
    const userModel = new UserCreateModel();
    userModel.login = `User_${i}`;
    userModel.password = `qwerty_${i}`;
    userModel.email = `user_${i}@gmail.com`;
    users.push(userModel);
  }
  return users;
};
