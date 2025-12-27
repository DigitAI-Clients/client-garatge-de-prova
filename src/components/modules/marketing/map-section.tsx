'use client';

import { MapContent } from '@/types/models';
import { motion, Variants } from 'framer-motion';
import { MapPin, Navigation, ExternalLink} from 'lucide-react';
import { cn } from '@/lib/utils';

// 1. DADES "INVENTADES" (Fallback) per si no arriba configuració
// Així sempre veuràs un mapa bonic de Barcelona en lloc d'un espai buit.
const DEFAULT_LOCATION = {
  title: "Seu Central DigitAI",
  address: "Plaça de Catalunya, 1, 08002 Barcelona",
  // Aquesta és una URL d'embed real de Google Maps (Plaça Catalunya)
  embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.438863673733!2d2.168568476686311!3d41.38639397130283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a2f260e1a991%3A0x1d5b037307044230!2sPl.%20de%20Catalunya%2C%20Barcelona!5e0!3m2!1sca!2ses!4v1716300000000!5m2!1sca!2ses"
};

export function MapSection({ data }: { data: MapContent }) {
  
  // Fusió de dades reals amb les dades per defecte
  const location = {
    title: data.title || DEFAULT_LOCATION.title,
    address: data.address || DEFAULT_LOCATION.address,
    embedUrl: (data.embedUrl && data.embedUrl.length > 5) ? data.embedUrl : DEFAULT_LOCATION.embedUrl
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 60, damping: 20, delay: 0.2 } 
    }
  };

  return (
    <section className="relative w-full h-125 md:h-150 group overflow-hidden bg-muted/10 border-y border-border/50">
      
      {/* 🗺️ MAPA IFRAME */}
      <div className="absolute inset-0 w-full h-full">
         {/* Truc visual: Grayscale al 100% per defecte (més elegant) 
            i a tot color quan fas hover.
         */}
         <iframe 
            src={location.embedUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Localització de l'empresa"
            className="w-full h-full object-cover grayscale transition-all duration-700 ease-in-out group-hover:grayscale-0 opacity-90 group-hover:opacity-100"
         />
         
         {/* Overlay Gradient: Suavitza la unió amb la web a dalt i a baix */}
         <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-background to-transparent pointer-events-none" />
         <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent pointer-events-none" />
      </div>

      {/* 📍 TARGETA FLOTANT D'INFORMACIÓ */}
      <div className="container mx-auto px-4 h-full relative pointer-events-none flex flex-col justify-end pb-12 md:pb-16">
        <motion.div 
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="pointer-events-auto max-w-sm w-full bg-card/85 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 rounded-3xl shadow-2xl shadow-black/10"
        >
            <div className="flex items-start gap-5">
                {/* Icona Gran */}
                <div className="p-3.5 bg-primary rounded-2xl text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                    <MapPin className="w-6 h-6" />
                </div>

                <div className="space-y-3">
                    <div>
                        <h3 className="font-bold text-xl text-foreground tracking-tight">
                            {location.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-1">
                            {location.address}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        {/* Botó Principal: Com arribar-hi */}
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                "bg-foreground text-background hover:bg-foreground/80 shadow-md"
                            )}
                        >
                            <Navigation className="w-3.5 h-3.5" />
                            Com arribar-hi
                        </a>

                        {/* Botó Secundari: Veure al mapa */}
                        <a 
                             href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`} 
                             target="_blank" 
                             rel="noreferrer"
                             className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-secondary/50 transition-colors border border-border/50"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}