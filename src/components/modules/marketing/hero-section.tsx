'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/lib/site-config';
import Link from 'next/link';

export function HeroSection() {
  const t = useTranslations('hero');
  
  // 1. Lògica segura per la imatge
  // Intentem obtenir la traducció. Si retorna la clau o està buida, usem null.
  const rawImage = t('image');
  const bgImage = (rawImage && rawImage.startsWith('http')) ? rawImage : null;

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 70, damping: 15 } }
  };

  return (
    <section className="relative py-24 lg:py-40 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
      
      {/* 🖼️ FONS AMB LA IMATGE DE LA IA */}
      {bgImage && (
        <div className="absolute inset-0 -z-20">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-20 transition-all duration-1000 scale-105"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            {/* Gradient Overlay per llegibilitat */}
            <div className="absolute inset-0 bg-linear-to-b from-background via-background/80 to-background" />
        </div>
      )}

      {/* Blobs de color */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 -mr-20 -mt-20 w-125 h-125 rounded-full bg-primary/20 blur-[120px] pointer-events-none -z-10"
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="container mx-auto px-4 relative z-10 text-center max-w-5xl"
      >
        {/* Badge Company Name */}
        <motion.div variants={item} className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-bold tracking-wide ring-1 ring-inset ring-secondary/20 shadow-sm shadow-secondary/10 backdrop-blur-md">
            ✨ {siteConfig.name}
          </span>
        </motion.div>

        {/* Títol IA */}
        <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground leading-[1.1]">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground to-primary">
            {t('title')}
          </span>
        </motion.h1>

        {/* Subtítol IA */}
        <motion.p variants={item} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          {t('subtitle')}
        </motion.p>

        {/* Botons */}
        <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contact" className="w-full sm:w-auto">
              <button className="group relative w-full bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                <span>{t('cta')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}