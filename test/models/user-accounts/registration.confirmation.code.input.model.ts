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
    confirmationCodeModel.code = 'invalid confirmation code';
    return confirmationCodeModel;
  };
