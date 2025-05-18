import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<string> {
    const result = await this.usersRepository.save(user);
    return result.id;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: { emailConfirmation: true, securityDevice: true },
    });
    if (!user) {
      throw new NotFoundException('User not found or already deleted');
    }
    await this.usersRepository.softRemove(user);
    return true;
  }
  async findByLoginOrEmail(loginOrEmail: string) {
    return await this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email: email },
      relations: { emailConfirmation: true },
    });
  }

  async updateRecoveryCode(user: User): Promise<void> {
    await this.usersRepository.save(user);
  }

  async findByRecoveryCode(recoveryCode: string) {
    return await this.usersRepository.findOneBy({
      recoveryCode: recoveryCode,
    });
  }

  async updatePassword(user: User) {
    await this.usersRepository.save(user);
  }

  async findByConfirmationCode(code: string) {
    return await this.usersRepository.findOne({
      where: { emailConfirmation: { confirmationCode: code } },
      relations: { emailConfirmation: true },
    });
  }

  async updateRegistrationConfirmation(user: User) {
    await this.usersRepository.save(user);
  }

  async updateRegistrationConfirmationCode(user: User) {
    await this.usersRepository.save(user);
  }

  async findByIdOrNotFoundFail(id: string) {
    const foundUser = await this.findById(id);
    if (!foundUser) {
      throw new UnauthorizedException(`User with id ${id} not found`);
    }
    return foundUser;
  }

  private async findById(id: string) {
    return await this.usersRepository.findOne({ where: { id: id } });
  }
}
