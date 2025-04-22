import { User } from '../../../../users/domain/user.entity';

export class MeViewModel {
  email: string;
  login: string;
  userId: string;

  static mapToView(user: User): MeViewModel {
    const model = new MeViewModel();
    model.email = user.email;
    model.login = user.login;
    model.userId = user.id;
    return model;
  }
}
