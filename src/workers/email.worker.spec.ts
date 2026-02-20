import { Job } from 'bullmq';
import { processEmailJob } from './email.worker';
import { EmailService } from '../app/modules/email/email.service';
import { jobs } from '../app/common/rules/jobs';

describe('email.worker', () => {
  describe('processEmailJob', () => {
    it('should call emailService.send when job name matches send_email', async () => {
      const mockEmailService = { send: jest.fn().mockResolvedValue(undefined) };
      const job = {
        name: jobs.send_email.name,
        data: { to: 'user@test.com', subject: 'Test', html: '<p>Hi</p>' },
      } as Job;

      await processEmailJob(mockEmailService as unknown as EmailService, job);

      expect(mockEmailService.send).toHaveBeenCalledWith(job.data);
      expect(mockEmailService.send).toHaveBeenCalledTimes(1);
    });

    it('should throw when job name is unknown', async () => {
      const mockEmailService = { send: jest.fn() };
      const job = {
        name: 'other-job',
        data: { to: 'user@test.com', subject: 'Test', html: '<p>Hi</p>' },
      } as Job;

      await expect(
        processEmailJob(mockEmailService as unknown as EmailService, job),
      ).rejects.toThrow('Unknown job name: other-job');

      expect(mockEmailService.send).not.toHaveBeenCalled();
    });
  });
});
