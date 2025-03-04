import { UserCreateModel } from '../../../src/features/user-accounts/users/api/models/input/create-user.input.model';
import { RegistrationEmailResendingModel } from '../../../src/features/user-accounts/auth/api/models/input/registration-email-resending.model';
import { PasswordRecoveryInputModel } from '../../../src/features/user-accounts/auth/api/models/input/password-recovery-input.model';

export const createPasswordRecoveryInputModel = (
  userModel: UserCreateModel,
): PasswordRecoveryInputModel => {
  const passwordRecoveryModel = new PasswordRecoveryInputModel();
  passwordRecoveryModel.email = userModel.email;
  return passwordRecoveryModel;
};

export const createInvalidPasswordRecoveryInputModel =
  (): PasswordRecoveryInputModel => {
    const invalidPasswordRecoveryModel = new RegistrationEmailResendingModel();
    invalidPasswordRecoveryModel.email = 'invalid password recovery email';
    return invalidPasswordRecoveryModel;
  };
