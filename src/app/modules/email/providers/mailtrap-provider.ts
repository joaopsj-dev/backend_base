import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailProvider } from '../contracts/email-provider.interface';
import { SendEmailDTO } from '../dtos/send-email.dto';

@Injectable()
export class MailtrapProvider implements EmailProvider {
  private transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  async send(data: SendEmailDTO): Promise<void> {
    await this.transporter.sendMail({
      from: '<no-reply@app.com>',
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
  }
}
