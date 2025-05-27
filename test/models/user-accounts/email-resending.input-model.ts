import { CreateUserInputTestDto } from './input-test-dto/create-user.input-test-dto';
import { RegistrationEmailResendingInputTestDto } from './input-test-dto/registration-email-resending.input-test-dto';

export const createEmailResendingInputModel = (
  userModel: CreateUserInputTestDto,
): RegistrationEmailResendingInputTestDto => {
  const emailResendingModel = new RegistrationEmailResendingInputTestDto();
  emailResendingModel.email = userModel.email;
  return emailResendingModel;
};

export const createInvalidEmailResendingInputModel =
  (): RegistrationEmailResendingInputTestDto => {
    const emailResendingModel = new RegistrationEmailResendingInputTestDto();
    emailResendingModel.email = 'invalidEmail@email.com';
    return emailResendingModel;
  };
