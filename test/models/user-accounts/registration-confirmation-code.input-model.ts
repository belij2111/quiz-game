import { RegistrationConfirmationCodeInputModel } from '../../../src/features/user-accounts/auth/api/models/input/registration-confirmation-code.input-model';

export const createRegistrationConfirmationCodeInputModel = (
  confirmationCode: string,
): RegistrationConfirmationCodeInputModel => {
  const confirmationCodeModel = new RegistrationConfirmationCodeInputModel();
  confirmationCodeModel.code = confirmationCode;
  return confirmationCodeModel;
};

export const createInvalidRegistrationConfirmationCodeInputModel =
  (): RegistrationConfirmationCodeInputModel => {
    const confirmationCodeModel = new RegistrationConfirmationCodeInputModel();
    confirmationCodeModel.code = '12121212-1212-1212-1212-121212121212';
    return confirmationCodeModel;
  };
