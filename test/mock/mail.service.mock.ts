import { MailService } from '../../src/features/notifications/mail.service';

export class MailServiceMock extends MailService {
  sentEmails: { email: string; code: string; templateType: string }[] = [];
  sendEmail(
    email: string,
    code: string,
    templateType: 'registration' | 'passwordRecovery',
  ) {
    this.sentEmails.push({ email, code, templateType });
    let htmlContent: any;
    if (templateType === 'registration') {
      htmlContent =
        'Calling the mock sendEmail / MailServiceMock method for the registration';
      console.log(htmlContent);
    }
    if (templateType === 'passwordRecovery') {
      htmlContent =
        'Calling the mock sendEmail / MailServiceMock method for the passwordRecovery';
      console.log(htmlContent);
    }
    return;
  }
}
