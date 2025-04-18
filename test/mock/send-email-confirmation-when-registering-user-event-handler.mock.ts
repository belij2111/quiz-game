import { SendEmailConfirmationWhenRegisteringUserEventHandler } from '../../src/features/notifications/event-handlers/send-email-confirmation-when-registering-user.event-handler';

export class SendEmailConfirmationWhenRegisteringUserEventHandlerMock extends SendEmailConfirmationWhenRegisteringUserEventHandler {
  sentEmails: { email: string; code: string }[] = [];

  async handle(event: { email: string; code: string }) {
    this.sentEmails.push({ email: event.email, code: event.code });
    const htmlContent =
      'Calling the mock sendEmail / MailServiceMock method for the registration';
    console.log(htmlContent);
    return;
  }
}
