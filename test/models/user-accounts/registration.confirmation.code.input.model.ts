import { RegistrationConfirmationCodeModel } from '../../../src/features/user-accounts/auth/api/models/input/registration-confirmation-code.model';

export const createRegistrationConfirmationCodeInputModel = (
  confirmationCode: string,
): RegistrationConfirmationCodeModel => {
  const confirmationCodeModel = new RegistrationConfirmationCodeModel();
  confirmationCodeModel.code = confirmationCode;
  return confirmationCodeModel;
};

export const createInvalidRegistrationConfirmationCodeInputModel =
  (): RegistrationConfirmationCodeModel => {
    const confirmationCodeModel = new RegistrationConfirmationCodeModel();
    confirmationCodeModel.code = '12121212-1212-1212-1212-121212121212';
    return confirmationCodeModel;
  };
