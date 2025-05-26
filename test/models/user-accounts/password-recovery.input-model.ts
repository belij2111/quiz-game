import { CreateUserInputTestDto } from '../bloggers-platform/input-test-dto/create-user.input-test-dto';
import { PasswordRecoveryInputTestDto } from './input-test-dto/password-recovery.input-test-dto';

export const createPasswordRecoveryInputModel = (
  userModel: CreateUserInputTestDto,
): PasswordRecoveryInputTestDto => {
  const passwordRecoveryModel = new PasswordRecoveryInputTestDto();
  passwordRecoveryModel.email = userModel.email;
  return passwordRecoveryModel;
};

export const createInvalidPasswordRecoveryInputModel =
  (): PasswordRecoveryInputTestDto => {
    const invalidPasswordRecoveryModel = new PasswordRecoveryInputTestDto();
    invalidPasswordRecoveryModel.email = 'invalid password recovery email';
    return invalidPasswordRecoveryModel;
  };
