import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserPasswordRecoveryEvent } from '../../user-accounts/auth/application/events/user-password-recovery.event';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailTemplateService } from '../email-template.service';

@EventsHandler(UserPasswordRecoveryEvent)
export class SendEmailWithRecoveryCodeEventHandler
  implements IEventHandler<UserPasswordRecoveryEvent>
{
  constructor(
    private readonly mailerService: MailerService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async handle(event: UserPasswordRecoveryEvent) {
    const htmlContent = this.emailTemplateService.passwordRecoveryEmail(
      event.recoveryCode,
    );
    this.mailerService.sendMail({
      to: event.recoveryCode,
      subject: 'Your code is here',
      html: htmlContent,
    });
  }
}
