export interface SmtpConfig {
  provider: 'relai' | 'gmail' | 'outlook';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  gmailAppPassword?: string;
  outlookPassword?: string;
}