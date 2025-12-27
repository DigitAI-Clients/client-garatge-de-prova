'use client';

import { Star, Quote } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { siteConfig } from '@/lib/site-config'; 

// 1. Definim la interfície estricta
interface Review {
  author: string;
  role: string;
  text: string;
  rating?: number;
  avatar?: string; // Opcional
}

interface TestimonialsContent {
  badge?: string;
  title: string;
  subtitle: string;
  reviews: Review[];
}

// 2. CORRECCIÓ ERROR TYPESCRIPT
// Afegim 'avatar: undefined' o un string buit perquè coincideixi amb la interfície Review
const getFallbackReviews = (): Review[] => [
    {
        author: "Maria V.",
        role: "Clienta habitual",
        text: `El millor servei de ${siteConfig.name}. La qualitat és excel·lent i el tracte immillorable.`,
        rating: 5,
        avatar: undefined // ✅ FIX: Ara TypeScript ja no es queixa
    },
    {
        author: "Jordi P.",
        role: "Empresari",
        text: "Professionalitat des del primer moment. Han superat les meves expectatives.",
        rating: 5,
        avatar: undefined // ✅ FIX
    },
    {
        author: "Anna S.",
        role: "Visitant",
        text: "Una experiència fantàstica. Repetiré segur!",
        rating: 4,
        avatar: undefined // ✅ FIX
    }
];

export function TestimonialsSection({ data }: { data: TestimonialsContent }) {
  
  // 3. Selecció de dades (IA o Fallback)
  const reviews = data?.reviews?.length > 0 ? data.reviews : getFallbackReviews();
  const title = data?.title || "Què diuen de nosaltres";
  const subtitle = data?.subtitle || `Els clients de ${siteConfig.name} tenen la paraula.`;
  const badge = data?.badge || "Testimonis";

  // --- Animacions ---
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const cardVars: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section className="relative py-24 overflow-hidden bg-background">
      {/* Fons decoratiu */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                    {badge}
                </span>
                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-foreground">
                    {title}
                </h2>
                <p className="text-xl text-muted-foreground">{subtitle}</p>
            </motion.div>
        </div>
        
        {/* Grid de Targetes */}
        <motion.div 
            variants={containerVars}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
            {reviews.map((review, i) => (
                <motion.div 
                    key={i} 
                    variants={cardVars}
                    whileHover={{ y: -10 }}
                    className="group relative p-8 h-full flex flex-col justify-between bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl"
                >
                    <Quote className="absolute top-8 right-8 w-10 h-10 text-primary/5 group-hover:text-primary/10 transition-colors" />

                    <div>
                        {/* Estrelles Dinàmiques */}
                        <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, starI) => (
                                <Star 
                                    key={starI} 
                                    className={`w-4 h-4 ${starI < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} 
                                />
                            ))}
                        </div>
                        <p className="mb-8 text-lg font-medium text-foreground/90 italic">"{review.text}"</p>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-6 border-t border-border/40">
                        {/* AVATAR */}
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-md ring-2 ring-background shrink-0">
                            {review.avatar && review.avatar.startsWith('http') ? (
                                <Image
                                    src={review.avatar} 
                                    alt={review.author} 
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg">
                                    {review.author[0]}
                                </div>
                            )}
                        </div>
                        
                        {/* INFO AUTOR */}
                        <div>
                            <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                                {review.author}
                            </h4>
                            <p className="text-sm text-muted-foreground">{review.role}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}