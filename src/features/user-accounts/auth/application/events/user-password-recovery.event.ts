export class UserPasswordRecoveryEvent {
  constructor(
    public email: string,
    public recoveryCode: string,
  ) {}
}
