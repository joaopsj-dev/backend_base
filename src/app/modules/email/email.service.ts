import { Inject, Injectable } from '@nestjs/common';
import { EmailProvider } from './contracts/email-provider.interface';
import { SendEmailDTO } from './dtos/send-email.dto';
import { EMAIL_PROVIDER } from './email.constants';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_PROVIDER)
    private provider: EmailProvider,
  ) {}

  async send(data: SendEmailDTO): Promise<void> {
    await this.provider.send(data);
  }
}
