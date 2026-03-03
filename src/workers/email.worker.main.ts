import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { Worker } from 'bullmq';
import { EmailService } from '../app/modules/email/email.service';
import { bullmqConnectionOptions } from '../config/redis.connection';
import { processEmailJob } from './email.worker';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  const emailService = app.get(EmailService);

  new Worker('email-queue', (job) => processEmailJob(emailService, job), {
    connection: bullmqConnectionOptions,
  });
}

bootstrap();
