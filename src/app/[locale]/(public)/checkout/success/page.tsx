//src\app\[locale]\(public)\checkout\success\page.tsx
'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId'); // Opcional, si el passem

  // 🧹 Neteja automàtica del carret en carregar la pàgina
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-slate-100"
      >
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Pagament Acceptat!</h1>
        <p className="text-slate-500 mb-8">
            Gràcies per la teva compra. Hem enviat un correu electrònic amb els detalls de la comanda.
        </p>

        {orderId && (
            <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-200">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Referència</span>
                <p className="font-mono text-slate-700 font-bold mt-1">#{orderId.slice(0, 8)}</p>
            </div>
        )}

        <div className="space-y-3">
            <Link href="/shop">
                <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2">
                    <ShoppingBag size={18} /> Continuar Comprant
                </button>
            </Link>
            
            <Link href="/my-account">
                <button className="w-full bg-white text-slate-600 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                    Veure les meves comandes <ArrowRight size={18} />
                </button>
            </Link>
        </div>
      </motion.div>
    </div>
  );
}