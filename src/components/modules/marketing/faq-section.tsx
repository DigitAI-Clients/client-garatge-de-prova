'use client';

import { useState } from 'react';
import { FAQContent } from '@/types/models';
import { ChevronDown, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config'; // 👈 IMPORT IMPORTANT

// 🧠 FAQ PER DEFECTE "AGNÒSTIQUES" (Per no posar coses de programació a un restaurant)
const GENERIC_FAQS = [
  {
    question: "Quin és el vostre horari d'atenció?",
    answer: "Estem oberts de dilluns a divendres de 9h a 18h. Pots contactar amb nosaltres per telèfon o correu electrònic."
  },
  {
    question: "On esteu ubicats exactament?",
    answer: `Ens trobaràs a ${siteConfig.contact.address || "la nostra oficina central"}. T'esperem!`
  },
  {
    question: "Com puc demanar un pressupost o reserva?",
    answer: "És molt fàcil! Fes servir el formulari de contacte d'aquesta mateixa pàgina o truca'ns directament."
  },
  {
    question: "Oferiu serveis personalitzats?",
    answer: "I tant. Ens adaptem a les teves necessitats específiques. Explica'ns què busques i trobarem la solució."
  }
];

export function FAQSection({ data }: { data: FAQContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // 1. Dades: Si la IA n'envia, perfecte. Si no, usem les genèriques de negoci.
  const items = data?.items?.length > 0 ? data.items : GENERIC_FAQS;
  
  // 2. Títol: Personalitzat
  const title = data?.title || `Preguntes sobre ${siteConfig.name}`;
  const subtitle = data?.subtitle || "Resolem els teus dubtes principals.";

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // --- VARIANTS (Igual que tenies) ---
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring", stiffness: 70, damping: 20 } 
    }
  };

  const contentVars: Variants = {
    collapsed: { opacity: 0, height: 0, marginTop: 0, scale: 0.98 },
    open: { 
      opacity: 1, height: "auto", marginTop: 16, scale: 1,
      transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }
    }
  };

  return (
    <section className="relative py-24 bg-background overflow-hidden" id="faq">
      
      {/* FONS ANIMAT */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -right-[10%] w-150 h-150 bg-primary/5 rounded-full blur-[120px]" 
          />
          <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }} 
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center p-4 bg-linear-to-br from-primary/10 to-primary/5 rounded-2xl mb-6 text-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-foreground"
          >
            {title}
          </motion.h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* GRID SYSTEM */}
        <motion.div 
            variants={containerVars}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
        >
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            
            return (
              <motion.div 
                key={i} 
                variants={itemVars}
                className={cn(
                  "group relative rounded-2xl overflow-hidden transition-all duration-500",
                  isOpen 
                    ? "bg-card shadow-xl shadow-primary/5 ring-1 ring-primary/30 z-10" 
                    : "bg-card/40 hover:bg-card hover:shadow-md border border-border/50"
                )}
              >
                {/* Gradient de fons actiu */}
                <div className={cn(
                    "absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none",
                    isOpen && "opacity-100"
                )} />

                <button
                  onClick={() => toggle(i)}
                  className="relative w-full flex items-start justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary z-10"
                >
                  <div className="flex items-start gap-4">
                      {/* Icona */}
                      <div className={cn(
                          "hidden sm:flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 mt-1 shrink-0",
                          isOpen ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      )}>
                          <MessageCircle className="w-4 h-4" />
                      </div>

                      <span className={cn(
                        "font-bold text-lg transition-colors duration-300 leading-tight",
                        isOpen ? "text-primary" : "text-foreground group-hover:text-foreground/80"
                      )}>
                        {item.question}
                      </span>
                  </div>
                  
                  {/* Fletxa */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={cn(
                        "p-2 rounded-full transition-colors shrink-0 ml-2",
                        isOpen ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={contentVars}
                            className="relative z-10 px-6 sm:pl-18 pr-6 pb-6"
                        >
                            <div className="text-muted-foreground leading-relaxed text-base">
                                {item.answer}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}