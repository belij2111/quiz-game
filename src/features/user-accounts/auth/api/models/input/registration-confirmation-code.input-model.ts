import { TrimIsString } from '../../../../../../core/decorators/validation/trim-is-string';

export class RegistrationConfirmationCodeInputModel {
  @TrimIsString()
  code: string;
}
