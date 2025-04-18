export class UserRegistrationConfirmationEvent {
  constructor(
    public email: string,
    public recoveryCode: string,
  ) {}
}
