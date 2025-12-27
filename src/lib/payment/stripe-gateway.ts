import Stripe from 'stripe';
import { IPaymentGateway, PaymentResult } from '@/repositories/interfaces/IPaymentGateway';
import { Order, CartItem } from '@/types/models';

export class StripeGateway implements IPaymentGateway {
    // 1. Declarem stripe com a opcional i no el creem al constructor
    private stripe: Stripe | null = null;

    constructor() {
        // El constructor ara és segur i buit. No explota al build.
    }

    // 2. Mètode privat per obtenir el client només quan es necessita
    private getStripeClient(): Stripe {
        if (!this.stripe) {
            const secretKey = process.env.STRIPE_SECRET_KEY;
            
            if (!secretKey) {
                // Només llencem l'error si REALMENT estem intentant usar Stripe
                throw new Error("❌ STRIPE_SECRET_KEY no configurada. No es pot processar el pagament.");
            }

            this.stripe = new Stripe(secretKey, {
                apiVersion: undefined,
                typescript: true,
            });
        }
        return this.stripe;
    }

    async createCheckoutSession(order: Order, items: CartItem[]): Promise<PaymentResult> {
        const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const stripe = this.getStripeClient(); // 👈 Obtenim el client aquí

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), 
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${domain}/checkout/success?session_id={CHECKOUT_SESSION_ID}&orderId=${order.id}`,
            cancel_url: `${domain}/shop`,
            customer_email: order.customer_email,
            client_reference_id: order.id,
            metadata: {
                orderId: order.id,
                orgId: order.organization_id
            }
        });

        if (!session.url) throw new Error("No s'ha pogut generar la URL de Stripe");

        return {
            success: true,
            redirectUrl: session.url,
            transactionId: session.id
        };
    }

    async verifyWebhook(signature: string, body: string | Buffer): Promise<Stripe.Event> {
        const stripe = this.getStripeClient(); // 👈 Obtenim el client aquí
        const secret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET missing");

        return stripe.webhooks.constructEvent(body, signature, secret);
    }
}