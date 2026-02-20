import { JobsOptions } from 'bullmq';

export type JobsName = 'send_email';
export type Jobs = Record<JobsName, { name: string; options: JobsOptions }>;

export const jobs: Jobs = {
  send_email: {
    name: 'send-email',
    options: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  },
};
