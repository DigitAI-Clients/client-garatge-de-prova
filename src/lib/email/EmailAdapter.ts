export interface SendEmailDTO {
  to: string;
  subject: string;
  html: string;
}

export interface EmailAdapter {
  send(data: SendEmailDTO): Promise<void>;
}