import { CreateUserInputModel } from '../../../src/features/user-accounts/users/api/models/input/create-user.input-model';
import { RegistrationEmailResendingInputModel } from '../../../src/features/user-accounts/auth/api/models/input/registration-email-resending.input-model';
import { PasswordRecoveryInputModel } from '../../../src/features/user-accounts/auth/api/models/input/password-recovery.input-model';

export const createPasswordRecoveryInputModel = (
  userModel: CreateUserInputModel,
): PasswordRecoveryInputModel => {
  const passwordRecoveryModel = new PasswordRecoveryInputModel();
  passwordRecoveryModel.email = userModel.email;
  return passwordRecoveryModel;
};

export const createInvalidPasswordRecoveryInputModel =
  (): PasswordRecoveryInputModel => {
    const invalidPasswordRecoveryModel =
      new RegistrationEmailResendingInputModel();
    invalidPasswordRecoveryModel.email = 'invalid password recovery email';
    return invalidPasswordRecoveryModel;
  };
