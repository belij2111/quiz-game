import { UserCreateModel } from '../../../src/features/user-accounts/users/api/models/input/create-user.input-model';
import { RegistrationEmailResendingInputModel } from '../../../src/features/user-accounts/auth/api/models/input/registration-email-resending.input-model';

export const createEmailResendingInputModel = (
  userModel: UserCreateModel,
): RegistrationEmailResendingInputModel => {
  const emailResendingModel = new RegistrationEmailResendingInputModel();
  emailResendingModel.email = userModel.email;
  return emailResendingModel;
};

export const createInvalidEmailResendingInputModel =
  (): RegistrationEmailResendingInputModel => {
    const emailResendingModel = new RegistrationEmailResendingInputModel();
    emailResendingModel.email = 'invalidEmail@email.com';
    return emailResendingModel;
  };
