import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from '../../crypto/crypto.service';
import { LoginInputModel } from '../api/models/input/login.input.model';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly bcryptService: CryptoService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async validateUser(loginInput: LoginInputModel): Promise<string | null> {
    const { loginOrEmail, password } = loginInput;
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await this.bcryptService.checkPassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return user.id.toString();
  }
}
