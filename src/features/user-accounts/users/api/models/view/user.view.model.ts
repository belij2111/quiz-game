import { User } from '../../../domain/user.sql.entity';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: User): UserViewModel {
    const model = new UserViewModel();
    model.id = user.id;
    model.login = user.login;
    model.email = user.email;
    model.createdAt = user.createdAt;
    return model;
  }
}
