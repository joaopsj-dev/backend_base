import { Job } from 'bullmq';
import { EmailService } from '../app/modules/email/email.service';
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
