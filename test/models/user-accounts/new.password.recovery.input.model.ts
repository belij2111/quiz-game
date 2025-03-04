import { NewPasswordRecoveryInputModel } from '../../../src/features/user-accounts/auth/api/models/input/new-password-recovery-input.model';

export const createNewPasswordRecoveryInputModel = (
  recoveryCode: string,
): NewPasswordRecoveryInputModel => {
  const newPasswordRecoveryModel = new NewPasswordRecoveryInputModel();
  newPasswordRecoveryModel.newPassword = 'qwerty-new';
  newPasswordRecoveryModel.recoveryCode = recoveryCode;
  return newPasswordRecoveryModel;
};

export const createInvalidNewPasswordRecoveryInputModel =
  (): NewPasswordRecoveryInputModel => {
    const invalidNewPasswordRecoveryModel = new NewPasswordRecoveryInputModel();
    invalidNewPasswordRecoveryModel.newPassword = 'new';
    invalidNewPasswordRecoveryModel.recoveryCode = 'invalid recoveryCode';
    return invalidNewPasswordRecoveryModel;
  };
