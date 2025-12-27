import { EmailAdapter } from './EmailAdapter';
import { ResendAdapter } from './adapters/ResendAdapter';

// Models
export interface EmailItem {
  quantity: number;
  name: string;
  price: number;
}

// Inicialitzem l'adapter (podriem injectar-lo, però per ara ho fem directe)
const emailAdapter: EmailAdapter = new ResendAdapter();

export const EmailService = {
  
  // 1. Confirmació de Comanda
  async sendOrderConfirmation(toEmail: string, orderId: string, total: number, items: EmailItem[]) {
    // Lògica de presentació (HTML)
    const itemsList = items.map(i =>
      `<li><strong>${i.quantity}x</strong> ${i.name} - ${i.price.toFixed(2)}€</li>`
    ).join('');

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #000;">Gràcies per la teva compra! 🎉</h1>
        <p>Hem rebut el teu pagament correctament. Aquí tens el resum:</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
          <h3 style="margin-top: 0;">Comanda #${orderId.slice(0, 8)}</h3>
          <ul style="padding-left: 20px;">${itemsList}</ul>
          <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;" />
          <p style="font-size: 18px; text-align: right;"><strong>Total: ${total.toFixed(2)} €</strong></p>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #888;">
          Enviarem els teus productes el més aviat possible.
        </p>
      </div>
    `;

    // Deleguem l'enviament a l'adapter
    await emailAdapter.send({
      to: toEmail,
      subject: `Comanda Confirmada #${orderId.slice(0, 8)}`,
      html: htmlContent
    });
  },

  // 2. Benvinguda al Registre
  async sendWelcomeEmail(toEmail: string, name: string) {
    const appName = process.env.EMAIL_FROM_NAME || 'la nostra plataforma';
    
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Hola ${name}! 👋</h1>
        <p>Gràcies per crear el teu compte.</p>
        <p>Ara pots accedir a la teva àrea privada.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accedir al meu compte</a>
      </div>
    `;

    await emailAdapter.send({
      to: toEmail,
      subject: `Benvingut/da a ${appName}!`,
      html: htmlContent
    });
  }
};