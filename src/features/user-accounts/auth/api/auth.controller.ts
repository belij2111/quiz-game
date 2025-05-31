import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { UserInfoInputModel } from './models/input/user-info.input-model';
import { LoginSuccessViewModel } from './models/view/login-success.view-model';
import { CurrentUserId } from '../../../../core/decorators/param/current-user-id.param-decorator';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreateUserInputModel } from '../../users/api/models/input/create-user.input-model';
import { RegistrationConfirmationCodeInputModel } from './models/input/registration-confirmation-code.input-model';
import { RegistrationEmailResendingInputModel } from './models/input/registration-email-resending.input-model';
import { PasswordRecoveryInputModel } from './models/input/password-recovery.input-model';
import { NewPasswordRecoveryInputModel } from './models/input/new-password-recovery.input-model';
import { RefreshTokenGuard } from '../../guards/refresh-token.guard';
import { CurrentDeviceId } from '../../../../core/decorators/param/current-device-id.param-decorator';
import { Throttle } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';
import { RegisterUserCommand } from '../application/use-cases/register-user.use-case';
import { ConfirmationRegistrationUserCommand } from '../application/use-cases/confirmation-registration-user.use-case';
import { RegistrationEmailResendingCommand } from '../application/use-cases/registration-email-resending.use-case';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.use-case';
import { NewPasswordCommand } from '../application/use-cases/new-password.use-case';
import { LogoutCommand } from '../application/use-cases/logout.use-case';
import { GetInfoAboutCurrentUserQuery } from '../application/queries/get-info-about-current-user.query';

const THROTTLE_LIMIT = 5;
const THROTTLE_TTL_MS = 10000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: THROTTLE_LIMIT, ttl: THROTTLE_TTL_MS } })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: ExpressRequest,
    @Res() res: ExpressResponse,
    @Req() { user }: UserInfoInputModel,
  ) {
    if (!req.ip) {
      throw new NotFoundException('IP address is required');
    }
    if (!req.headers['user-agent']) {
      throw new NotFoundException('User agent is required');
    }
    const ip = req.ip;
    const deviceName = req.headers['user-agent'];
    const result = await this.commandBus.execute(
      new LoginUserCommand(user, ip, deviceName),
    );
    const { accessToken, refreshToken } = result as LoginSuccessViewModel;
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken });
    return;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Res() res: ExpressResponse,
    @Req() { user, deviceId }: UserInfoInputModel,
  ) {
    const result = await this.commandBus.execute(
      new RefreshTokenCommand(user, deviceId),
    );
    const { accessToken, refreshToken } = result as LoginSuccessViewModel;
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken });
    return;
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async get(@CurrentUserId() currentUserId: string) {
    return this.queryBus.execute(
      new GetInfoAboutCurrentUserQuery(currentUserId),
    );
  }

  @Post('registration')
  @Throttle({ default: { limit: THROTTLE_LIMIT, ttl: THROTTLE_TTL_MS } })
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() userCreateModel: CreateUserInputModel) {
    await this.commandBus.execute(new RegisterUserCommand(userCreateModel));
  }

  @Post('registration-confirmation')
  @Throttle({ default: { limit: THROTTLE_LIMIT, ttl: THROTTLE_TTL_MS } })
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body()
    registrationConfirmationCodeModel: RegistrationConfirmationCodeInputModel,
  ) {
    await this.commandBus.execute(
      new ConfirmationRegistrationUserCommand(
        registrationConfirmationCodeModel,
      ),
    );
  }

  @Post('registration-email-resending')
  @Throttle({ default: { limit: THROTTLE_LIMIT, ttl: THROTTLE_TTL_MS } })
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body()
    registrationEmailResendingModel: RegistrationEmailResendingInputModel,
  ) {
    await this.commandBus.execute(
      new RegistrationEmailResendingCommand(registrationEmailResendingModel),
    );
  }

  @Post('password-recovery')
  @Throttle({ default: { limit: THROTTLE_LIMIT, ttl: THROTTLE_TTL_MS } })
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() passwordRecoveryInputModel: PasswordRecoveryInputModel,
  ) {
    await this.commandBus.execute(
      new PasswordRecoveryCommand(passwordRecoveryInputModel),
    );
  }

  @Post('new-password')
  @Throttle({ default: { limit: THROTTLE_LIMIT, ttl: THROTTLE_TTL_MS } })
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() newPasswordRecoveryInputModel: NewPasswordRecoveryInputModel,
  ) {
    await this.commandBus.execute(
      new NewPasswordCommand(newPasswordRecoveryInputModel),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenGuard)
  async logout(
    @Res() res: ExpressResponse,
    @CurrentDeviceId() deviceId: string,
  ) {
    await this.commandBus.execute(new LogoutCommand(deviceId));
    res.clearCookie('refreshToken').json({});
    return;
  }
}
