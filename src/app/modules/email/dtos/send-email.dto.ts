type SendEmailBase = {
  to: string;
  subject: string;
};

export type SendEmailDTO =
  | (SendEmailBase & { html: string; text?: string })
  | (SendEmailBase & { text: string; html?: string });
