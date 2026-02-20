import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { Job, Worker } from 'bullmq';
import { EmailService } from '../app/modules/email/email.service';
import { bullmqConnectionOptions } from '../config/redis.connection';
import { jobs } from '../app/common/rules/jobs';
import { SendEmailDTO } from 'src/app/modules/email/dtos/send-email.dto';

export async function processEmailJob(
  emailService: EmailService,
  job: Job<SendEmailDTO, any, string>,
): Promise<void> {
  switch (job.name) {
    case jobs.send_email.name:
      await emailService.send(job.data);
      break;

    default:
      throw new Error(`Unknown job name: ${job.name}`);
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  const emailService = app.get(EmailService);

  new Worker('email-queue', (job) => processEmailJob(emailService, job), {
    connection: bullmqConnectionOptions,
  });
}

bootstrap();
