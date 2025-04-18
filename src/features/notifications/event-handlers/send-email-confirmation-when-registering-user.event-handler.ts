import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegistrationEvent } from '../../user-accounts/auth/application/events/user-registration.event';
import { EmailTemplateService } from '../email-template.service';
import { MailerService } from '@nestjs-modules/mailer';

@EventsHandler(UserRegistrationEvent)
export class SendEmailConfirmationWhenRegisteringUserEventHandler
  implements IEventHandler<UserRegistrationEvent>
{
  constructor(
    private readonly mailerService: MailerService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}
  async handle(event: UserRegistrationEvent): Promise<void> {
    const htmlContent = this.emailTemplateService.registrationEmail(event.code);
    this.mailerService.sendMail({
      to: event.email,
      subject: 'Your code is here',
      html: htmlContent,
    });
  }
}
