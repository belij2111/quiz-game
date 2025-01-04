import { UserDocument } from '../../../domain/user.entity';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: UserDocument): UserViewModel {
    const model = new UserViewModel();
    model.id = user.id.toString();
    model.login = user.login;
    model.email = user.email;
    model.createdAt = user.createdAt;
    return model;
  }
}
