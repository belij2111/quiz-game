import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegistrationConfirmationEvent } from '../../user-accounts/auth/application/events/user-registration-confirmation.event';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailTemplateService } from '../email-template.service';

@EventsHandler(UserRegistrationConfirmationEvent)
export class SendEmailWithRecoveryCodeEventHandler
  implements IEventHandler<UserRegistrationConfirmationEvent>
{
  constructor(
    private readonly mailerService: MailerService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async handle(event: UserRegistrationConfirmationEvent) {
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
