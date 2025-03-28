import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { CryptoService } from '../../crypto/crypto.service';
import { User } from '../domain/user.sql.entity';
import { UuidProvider } from '../../../../core/helpers/uuid.provider';
import { UserAccountConfig } from '../../config/user-account.config';
import { UsersSqlRepository } from '../infrastructure/users.sql.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: CryptoService,
    private readonly uuidProvider: UuidProvider,
    private readonly userAccountConfig: UserAccountConfig,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}

  async create(userCreateModel: UserCreateModel): Promise<number> {
    const existingUserByLogin =
      await this.usersSqlRepository.findByLoginOrEmail(userCreateModel.login);
    if (existingUserByLogin) {
      throw new BadRequestException([
        { field: 'login', message: 'Login is not unique' },
      ]);
    }
    const existingUserByEmail =
      await this.usersSqlRepository.findByLoginOrEmail(userCreateModel.email);
    if (existingUserByEmail) {
      throw new BadRequestException([
        { field: 'email', message: 'Email is not unique' },
      ]);
    }
    const passHash = await this.bcryptService.generateHash(
      userCreateModel.password,
    );
    const expirationTime = this.userAccountConfig.CONFIRMATION_CODE_EXPIRATION;
    const newUser: User = {
      id: this.uuidProvider.generate(),
      login: userCreateModel.login,
      password: passHash,
      email: userCreateModel.email,
      createdAt: new Date(),
      confirmationCode: this.uuidProvider.generate(),
      expirationDate: new Date(new Date().getTime() + expirationTime),
      isConfirmed: true,
    };
    return this.usersSqlRepository.create(newUser);
  }

  async delete(id: string): Promise<boolean> {
    return this.usersSqlRepository.delete(id);
  }
}
