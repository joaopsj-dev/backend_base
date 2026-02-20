import { SendEmailDTO } from '../dtos/send-email.dto';

export interface EmailProvider {
  send(data: SendEmailDTO): Promise<void>;
}
