'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '@/types/models';
import { toast } from 'sonner';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  
  // Getters computats
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          // Si ja existeix, sumem 1, però no passem de l'estoc
          if (existingItem.quantity < existingItem.stock) {
            set({
              items: currentItems.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
              isOpen: true,
            });
            toast.success("Quantitat actualitzada al carret");
          } else {
            toast.error("No hi ha més estoc disponible");
          }
        } else {
          // ✅ FIX: MAPEIG CORRECTE (Aquí era l'error)
          // Transformem Product -> CartItem netejant dades innecessàries
          const newItem: CartItem = {
            id: product.id,
            organization_id: product.organization_id, // 👈 AFEGIT
            name: product.name,
            price: product.price,
            stock: product.stock,
            slug: product.slug,
            image: product.images?.[0], // 👈 Agafem només la 1a imatge
            quantity: 1,
          };

          set({ items: [...currentItems, newItem], isOpen: true });
          // toast.success("Producte afegit al carret"); (Opcional, ja ho fas al component)
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
        toast.info("Producte eliminat");
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === productId) {
              // Validació d'estoc en temps real
              const newQuantity = Math.max(1, Math.min(quantity, item.stock));
              return { ...item, quantity: newQuantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      
      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'digitai-cart-storage',
      storage: createJSONStorage(() => localStorage),
      // Opcional: només persistim 'items', no l'estat d'obertura
      partialize: (state) => ({ items: state.items }),
    }
  )
);