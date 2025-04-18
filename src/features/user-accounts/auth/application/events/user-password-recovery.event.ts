export class UserPasswordRecoveryEvent {
  constructor(
    public email: string,
    public code: string,
  ) {}
}
