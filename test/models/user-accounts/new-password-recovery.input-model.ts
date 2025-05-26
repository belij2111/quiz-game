import { NewPasswordRecoveryInputTestDto } from './input-test-dto/new-password-recovery.input-test-dto';

export const createNewPasswordRecoveryInputModel = (
  recoveryCode: string,
): NewPasswordRecoveryInputTestDto => {
  const newPasswordRecoveryModel = new NewPasswordRecoveryInputTestDto();
  newPasswordRecoveryModel.newPassword = 'qwerty-new';
  newPasswordRecoveryModel.recoveryCode = recoveryCode;
  return newPasswordRecoveryModel;
};

export const createInvalidNewPasswordRecoveryInputModel =
  (): NewPasswordRecoveryInputTestDto => {
    const invalidNewPasswordRecoveryModel =
      new NewPasswordRecoveryInputTestDto();
    invalidNewPasswordRecoveryModel.newPassword = 'new';
    invalidNewPasswordRecoveryModel.recoveryCode = 'invalid recoveryCode';
    return invalidNewPasswordRecoveryModel;
  };
