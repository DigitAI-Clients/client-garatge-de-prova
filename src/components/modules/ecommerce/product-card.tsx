'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, PackageX, Sparkles } from 'lucide-react';
import { Product } from '@/types/models';
import { useCartStore } from '@/lib/store/cart-store';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        toast.success("Afegit al carret!");
    };

    const isOutOfStock = product.stock <= 0;

    // 🖼️ LÒGICA D'IMATGES MÀGIQUES
    // Si no tenim imatge, n'agafem una d'Unsplash basada en el nom del producte o un ID aleatori
    const fallbackImage = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop`;
    
    // Utilitzem la imatge del producte o el fallback
    const displayImage = product.images?.[0] || fallbackImage;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative flex flex-col h-full bg-card border border-border/40 rounded-[1.5rem] overflow-hidden hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300"
        >
            {/* 1. ZONA D'IMATGE (Reduïda a 4:3 per no ser tan alta) */}
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary/10">
                <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                />

                {/* Badges Flotants */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {isOutOfStock ? (
                        <span className="bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                            Esgotat
                        </span>
                    ) : (
                        product.stock < 5 && (
                            <span className="bg-amber-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                                Últimes Uts.
                            </span>
                        )
                    )}
                    {/* Badge "Nou" decoratiu si no té imatge real */}
                    {!product.images?.[0] && !isOutOfStock && (
                        <span className="bg-primary/90 backdrop-blur text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={10} /> Demo
                        </span>
                    )}
                </div>

                {/* OVERLAY D'ACCIONS (Glassmorphism) */}
                {!isOutOfStock && (
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <Link href={`/shop/${product.slug}`}>
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-12 h-12 rounded-full bg-white text-black shadow-xl flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                            >
                                <Eye size={20} />
                            </motion.button>
                        </Link>
                        <motion.button 
                            onClick={handleAddToCart}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 rounded-full bg-white text-black shadow-xl flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        >
                            <ShoppingCart size={20} />
                        </motion.button>
                    </div>
                )}
            </div>

            {/* 2. CONTINGUT (Compacte i Net) */}
            <div className="p-5 flex flex-col grow">
                {/* Categoria petita */}
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Col·lecció {new Date().getFullYear()}
                </div>

                <Link href={`/shop/${product.slug}`} className="group-hover:text-primary transition-colors block mb-2">
                    <h3 className="font-bold text-lg text-card-foreground leading-snug line-clamp-1">
                        {product.name}
                    </h3>
                </Link>
                
                {/* Descripció curta */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {product.description || "Un producte exclusiu dissenyat per oferir la millor qualitat i experiència."}
                </p>

                {/* Footer del producte */}
                <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between">
                    <span className="text-xl font-bold text-foreground">
                        {product.price.toFixed(2)}€
                    </span>
                    
                    {/* Botó "Afegir" només visible en mòbil (en desktop és l'overlay) */}
                    <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="md:hidden text-sm font-bold text-primary"
                    >
                        {isOutOfStock ? "Esgotat" : "Afegir +"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}