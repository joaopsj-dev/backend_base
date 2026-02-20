import { Module } from '@nestjs/common';
import { EMAIL_PROVIDER } from './email.constants';
import { MailtrapProvider } from './providers/mailtrap-provider';
import { EmailService } from './email.service';

@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER,
      useClass: MailtrapProvider,
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
