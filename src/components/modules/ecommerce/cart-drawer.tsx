'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Minus, Plus, CreditCard, ShoppingBag } from 'lucide-react';
import { checkoutAction } from '@/features/ecommerce/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

export function CartDrawer() {
    // 🔴 ERROR: 'total' no existeix.
    // ✅ CORRECCIÓ: Canviem 'total' per 'totalPrice' (i li diem 'total' localment si vols)
    const {
        items,
        isOpen,
        toggleCart,
        removeItem,
        updateQuantity,
        totalPrice: total, // 👈 ALIES CLAU
        clearCart
    } = useCartStore();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        setIsCheckingOut(true);

        const orderData = {
            customer_email: "client@exemple.com", // TODO: Connectar amb Auth o Input
            customer_details: {},
            items: items,
            payment_method: 'stripe' as const
        };

        const res = await checkoutAction(orderData);
        setIsCheckingOut(false);

        if (res.success && res.redirectUrl) {
            clearCart();
            toggleCart();
            router.push(res.redirectUrl);
        } else {
            toast.error("Error: " + res.error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col border-l border-border"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-card">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" /> La teva cistella ({items.length})
                            </h2>
                            <button onClick={toggleCart} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                    <ShoppingBag size={48} className="opacity-20" />
                                    <p>El carret està buit 😢</p>
                                    <button onClick={toggleCart} className="text-primary font-bold hover:underline">
                                        Continuar comprant
                                    </button>
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item.id} className="flex gap-4 group">
                                        {/* Imatge corregida 👇 */}
                                        <div className="relative w-20 h-20 bg-secondary/20 rounded-xl overflow-hidden shrink-0 border border-border">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                                                    <ShoppingBag size={20} className="opacity-20" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-sm line-clamp-1 pr-2">{item.name}</h4>
                                                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors" aria-label="Eliminar producte">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-primary font-bold text-sm mt-1">{item.price.toFixed(2)} €</p>
                                            </div>

                                            {/* Contro de quantitat */}
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center border border-input rounded-lg bg-background">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        className="p-1.5 hover:bg-secondary/50 rounded-l-lg transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>

                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>

                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stock}
                                                        className="p-1.5 hover:bg-secondary/50 rounded-r-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                {item.quantity >= item.stock && (
                                                    <span className="text-[10px] text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                                                        Max stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-border bg-muted/20">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-extrabold text-2xl">{total().toFixed(2)} €</span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isCheckingOut ? (
                                        <>Processant...</>
                                    ) : (
                                        <>
                                            <CreditCard size={20} /> Tramitar Comanda
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Pagament segur via Stripe. Enviament i taxes calculats al següent pas.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}