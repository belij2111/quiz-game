import { Module } from '@nestjs/common';
import { CoreConfig } from '../../core/core.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailTemplateService } from './email-template.service';
import { SendEmailConfirmationWhenRegisteringUserEventHandler } from './event-handlers/send-email-confirmation-when-registering-user.event-handler';
import { SendEmailWithRecoveryCodeEventHandler } from './event-handlers/send-email-with-recovery-code.event-handler';

const services = [EmailTemplateService];
const eventHandlers = [
  SendEmailConfirmationWhenRegisteringUserEventHandler,
  SendEmailWithRecoveryCodeEventHandler,
];

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        return {
          transport: {
            service: coreConfig.MAIL_SERVICE,
            auth: {
              user: coreConfig.MAIL_USER,
              pass: coreConfig.MAIL_PASS,
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
        };
      },
      inject: [CoreConfig],
    }),
  ],
  providers: [...services, ...eventHandlers],
  exports: [],
})
export class NotificationsModule {}
