export class UserRegistrationEvent {
  constructor(
    public email: string,
    public code: string,
  ) {}
}
