import { Queue } from 'bullmq';
import { bullmqConnectionOptions } from '../../../config/redis.connection';
import { SendEmailDTO } from './dtos/send-email.dto';

export const emailQueue = new Queue<SendEmailDTO>('email-queue', {
  connection: bullmqConnectionOptions,
});
