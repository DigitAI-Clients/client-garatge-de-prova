import { Order } from '@/types/models';

export interface PaymentResult {
  success: boolean;
  redirectUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface IPaymentGateway {
  // `items` hauria de tenir un tipus propi, però `CartItem[]` és acceptable aquí
  createCheckoutSession(order: Order, items: unknown[]): Promise<PaymentResult>;
  
  // 🛠️ FIX: 'body' és string o Buffer. Retornem 'unknown' per no acoblar-nos a Stripe a la interfície genèrica.
  verifyWebhook(signature: string, body: string | Buffer): Promise<unknown>;
}