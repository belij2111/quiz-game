export class User {
  id: string;
  login: string;
  password: string;
  email: string;
  createdAt: Date;
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}
