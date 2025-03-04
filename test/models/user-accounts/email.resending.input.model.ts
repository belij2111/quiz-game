import { UserCreateModel } from '../../../src/features/user-accounts/users/api/models/input/create-user.input.model';
import { RegistrationEmailResendingModel } from '../../../src/features/user-accounts/auth/api/models/input/registration-email-resending.model';

export const createEmailResendingInputModel = (
  userModel: UserCreateModel,
): RegistrationEmailResendingModel => {
  const emailResendingModel = new RegistrationEmailResendingModel();
  emailResendingModel.email = userModel.email;
  return emailResendingModel;
};

export const createInvalidEmailResendingInputModel =
  (): RegistrationEmailResendingModel => {
    const emailResendingModel = new RegistrationEmailResendingModel();
    emailResendingModel.email = 'invalidEmail@email.com';
    return emailResendingModel;
  };
