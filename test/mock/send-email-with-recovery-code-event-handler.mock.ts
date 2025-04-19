import { SendEmailWithRecoveryCodeEventHandler } from '../../src/features/notifications/event-handlers/send-email-with-recovery-code.event-handler';

export class SendEmailWithRecoveryCodeEventHandlerMock extends SendEmailWithRecoveryCodeEventHandler {
  sentEmails: { email: string; code: string }[] = [];

  async handle(event: { email: string; code: string }) {
    this.sentEmails.push({ email: event.email, code: event.code });
    const htmlContent =
      'Calling the mock sendEmail / Mock method for the password recovery';
    console.log(htmlContent);
    return;
  }
}
