import { Resend } from 'resend';
import { EmailAdapter, SendEmailDTO } from '../EmailAdapter';

export class ResendAdapter implements EmailAdapter {
  private client: Resend | null = null;

  private getClient(): Resend | null {
    // 🛡️ LAZY LOADING: Només instanciem si tenim la clau i quan es demana
    if (!this.client) {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        console.warn("⚠️ RESEND_API_KEY no trobada. Els emails no sortiran.");
        return null;
      }
      
      this.client = new Resend(apiKey);
    }
    return this.client;
  }

  private getFromEmail(): string {
    const email = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';
    const name = process.env.EMAIL_FROM_NAME || 'DigitAI Bot';
    return `${name} <${email}>`;
  }

  async send({ to, subject, html }: SendEmailDTO): Promise<void> {
    const resend = this.getClient();
    
    // Si no tenim client (falta API Key), fallem silenciosament o fem log,
    // però NO trenquem l'app.
    if (!resend) return;

    try {
      await resend.emails.send({
        from: this.getFromEmail(),
        to,
        subject,
        html,
      });
      console.log(`📧 Email enviat a ${to}`);
    } catch (error) {
      console.error("❌ Error enviant email via Resend:", error);
      // Opcional: Llançar error si vols que el procés falli
    }
  }
}