'use client';

import { Product } from '@/types/models';
import { useCartStore } from '@/lib/store/cart-store';
import { ShoppingCart, Check, PackageX } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function ProductActions({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    toast.success(`${product.name} afegit al carret`);
    
    // Reset del botó després de 2 segons
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stock <= 0) {
      return (
          <button disabled className="w-full py-4 bg-muted text-muted-foreground rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
            <PackageX size={20} />
            Esgotat
          </button>
      );
  }

  return (
    <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={handleAdd}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
            added 
                ? "bg-green-500 text-white shadow-green-500/20" 
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/20"
        }`}
    >
        {added ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                <Check size={20} /> Afegit
            </motion.div>
        ) : (
            <div className="flex items-center gap-2">
                <ShoppingCart size={20} /> Afegir al Carret
            </div>
        )}
    </motion.button>
  );
}