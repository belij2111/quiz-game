import { RegistrationConfirmationCodeInputTestDto } from './input-test-dto/registration-confirmation-code.input-test-dto';

export const createRegistrationConfirmationCodeInputModel = (
  confirmationCode: string,
): RegistrationConfirmationCodeInputTestDto => {
  const confirmationCodeModel = new RegistrationConfirmationCodeInputTestDto();
  confirmationCodeModel.code = confirmationCode;
  return confirmationCodeModel;
};

export const createInvalidRegistrationConfirmationCodeInputModel =
  (): RegistrationConfirmationCodeInputTestDto => {
    const confirmationCodeModel =
      new RegistrationConfirmationCodeInputTestDto();
    confirmationCodeModel.code = '12121212-1212-1212-1212-121212121212';
    return confirmationCodeModel;
  };
