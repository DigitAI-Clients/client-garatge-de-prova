import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { StripeGateway } from '@/lib/payment/stripe-gateway';
import { createAdminClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email/email-service';
import Stripe from 'stripe';

const gateway = new StripeGateway();

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature');

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe Signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await gateway.verifyWebhook(signature, body);
  } catch (err: unknown) {
    let errorMessage = "Webhook verification failed";
    if (err instanceof Error) errorMessage = err.message;
    console.error(`⚠️ Webhook Error: ${errorMessage}`);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  // LOGICA DE NEGOCI
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

    if (orderId && paymentIntentId) {
      console.log(`💰 Pagament rebut per comanda: ${orderId}`);

      const supabaseAdmin = createAdminClient();

      // 1. Marcar comanda com PAGADA
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          payment_id: paymentIntentId
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ Error actualitzant comanda:', updateError);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
      }

      // 2. 👇 NOVA LÒGICA: RESTAR ESTOC
      // Primer recuperem els items de la comanda
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (items) {
        for (const item of items) {
          // Cridem a una funció RPC (Stored Procedure) per restar de forma atòmica
          // O, per ara (MVP), fem una resta directa (menys segur en concurrència però funciona)
          if (item.product_id) {
            await supabaseAdmin.rpc('decrement_stock', {
              p_product_id: item.product_id,
              p_quantity: item.quantity
            });
          }
        }
        console.log("📦 Estoc actualitzat correctament.");
      }
      // 1. Recuperem detalls de la comanda
      const { data: orderDetails } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (session.customer_details?.email && orderDetails) {

        // 👇 DEFINIM EL TIPUS ESPERAT DE LA BASE DE DADES
        interface DbOrderItem {
          quantity: number;
          product_name: string;
          unit_price: number;
        }

        // 👇 FEM EL CASTING SEGUR (unknown -> Tipus Correcte)
        // Li diem a TS: "Confia que això és un array de DbOrderItem"
        const rawItems = orderDetails.order_items as unknown as DbOrderItem[];

        const emailItems = rawItems.map((item) => ({
          quantity: item.quantity,
          name: item.product_name,
          price: item.unit_price
        }));

        await EmailService.sendOrderConfirmation(
          session.customer_details.email,
          orderId,
          session.amount_total ? session.amount_total / 100 : 0,
          emailItems
        );
        console.log("📧 Email de confirmació enviat.");
      }
    }
  }

  return NextResponse.json({ received: true });
}