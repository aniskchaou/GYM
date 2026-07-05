import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type MailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  isConfigured(): boolean {
    const user = this.config.get<string>('SMTP_USER') ?? this.config.get<string>('GMAIL_USER');
    const pass = this.config.get<string>('SMTP_PASS') ?? this.config.get<string>('GMAIL_APP_PASSWORD');
    return !!(user && pass);
  }

  private createTransport() {
    const host = this.config.get<string>('SMTP_HOST') ?? 'smtp.gmail.com';
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const secure = this.config.get<string>('SMTP_SECURE') === 'true' || port === 465;
    const user = this.config.get<string>('SMTP_USER') ?? this.config.get<string>('GMAIL_USER');
    const pass = this.config.get<string>('SMTP_PASS') ?? this.config.get<string>('GMAIL_APP_PASSWORD');

    if (!user || !pass) {
      throw new Error('SMTP is not configured. Set SMTP_USER/SMTP_PASS (or GMAIL_USER/GMAIL_APP_PASSWORD).');
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async send(payload: MailPayload) {
    const transporter = this.createTransport();
    const fromName = this.config.get<string>('EMAIL_FROM_NAME') ?? 'GymFlow';
    const fromEmail = this.config.get<string>('EMAIL_FROM') ?? this.config.get<string>('SMTP_USER');

    return transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  }

  async sendBulk(payloads: MailPayload[]) {
    let sent = 0;
    let failed = 0;

    for (const payload of payloads) {
      try {
        await this.send(payload);
        sent++;
      } catch (e) {
        failed++;
        this.logger.warn(`Failed to send email to ${payload.to}: ${(e as Error).message}`);
      }
    }

    return { sent, failed };
  }
}
