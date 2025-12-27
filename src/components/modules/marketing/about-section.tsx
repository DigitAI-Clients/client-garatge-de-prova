'use client';

import Image from "next/image";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { AboutContent } from '@/types/models';
import { siteConfig } from '@/lib/site-config'; // 👈 IMPORT IMPORTANTÍSSIM

// ✅ 1. Definim els tipus possibles per a les estadístiques
interface StatItem {
  label: string;
  value: string;
}

// L'objecte "lleig" que a vegades retorna la IA
interface AiStatsObject {
  label1?: string; value1?: string;
  label2?: string; value2?: string;
  label3?: string; value3?: string;
  [key: string]: string | undefined;
}

export function AboutSection({ data }: { data: AboutContent }) {

  // --- CONFIGURACIÓ DE FALLBACKS INTEL·LIGENTS ---
  
  // 1. Badge: Si no n'hi ha, usem el sector del negoci (ex: "Restaurant")
  const badge = data?.badge || siteConfig.sector || "La Nostra Història";

  // 2. Títol: Personalitzat amb el nom del negoci
  const title = data?.title || `L'essència de ${siteConfig.name}`;

  // 3. Descripció: Usem la descripció REAL del negoci si falla la IA
  const description = data?.description || siteConfig.description;

  // 4. Imatge: Unsplash fallback
  const image = data?.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop";

  // 5. Features: Si la IA falla, no posem "Qualitat", posem coses reals de la config
  // Si siteConfig té features actives, les usem com a text provisional
  const defaultFeatures = [
     `Ubicació: ${siteConfig.contact.address || "Centre"}`,
     "Atenció personalitzada",
     "Producte de qualitat"
  ];
  const features = data?.features?.length ? data.features : defaultFeatures;


  // ✅ Lògica de transformació d'estadístiques (Igual que tenies)
  const rawStats = data?.stats as unknown as (StatItem[] | AiStatsObject | undefined);
  let statsArray: StatItem[] = [];

  if (Array.isArray(rawStats)) {
    statsArray = rawStats;
  } else if (rawStats && typeof rawStats === 'object') {
    statsArray = [
      { label: rawStats.label1 || "", value: rawStats.value1 || "" },
      { label: rawStats.label2 || "", value: rawStats.value2 || "" },
      { label: rawStats.label3 || "", value: rawStats.value3 || "" }
    ].filter(s => s.label && s.value);
  }

  // Fallback d'estadístiques (Només si està buit)
  const stats = statsArray.length > 0 ? statsArray : [
    { label: "Experiència", value: "+10 Anys" }, // Això la IA ho hauria de sobreescriure
    { label: "Valoració", value: "5/5" },
    { label: "Clients", value: "Feliços" }
  ];

  const cardData = data?.card || { title: "Creixement", subtitle: "Constant" };

  // --- ANIMACIONS (Igual que tenies) ---
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }
  };

  const progressBar: Variants = {
    hidden: { width: 0 },
    visible: { width: "85%", transition: { delay: 0.8, duration: 1, ease: "easeOut" } }
  };

  return (
    <section id="about" className="relative py-24 bg-background overflow-hidden">
      
      {/* DECORACIÓ DE FONS */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[-10%] w-[20%] h-[20%] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* COLUMNA DE TEXT */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col gap-8 order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 border border-primary/20">
                  {badge}
                </span>
            </motion.div>
            
            {/* Títol */}
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              {title}
            </motion.h2>
            
            {/* Descripció */}
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </motion.p>

            {/* Features */}
            <motion.div variants={fadeInUp} className="flex flex-col gap-4">
              {features.map((item, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="mt-1 p-1 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  </div>
                  <span className="text-base font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-6 pt-8 mt-4 border-t border-border/50">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* COLUMNA D'IMATGE (Igual que abans) */}
          <div className="relative order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }} viewport={{ once: true }}
              className="relative"
            >
                {/* Marc Decoratiu */}
                <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent rounded-[2.5rem] rotate-3 blur-sm transform translate-x-4 translate-y-4 -z-10" />
                
                {/* Imatge Principal */}
                <div className="relative aspect-4/5 w-full rounded-4xl overflow-hidden shadow-2xl border border-border/50 bg-secondary/20">
                    <Image
                        src={image} 
                        alt={title} 
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
            </motion.div>

            {/* Targeta Flotant */}
            <motion.div 
                className="absolute -bottom-8 -left-8 md:bottom-10 md:-left-10 z-10 max-w-60 w-full"
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.5 }}
            >
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="bg-card/95 backdrop-blur-md p-5 rounded-2xl border border-border shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">{cardData.title}</p>
                            <p className="text-xs text-muted-foreground">{cardData.subtitle}</p>
                        </div>
                    </div>
                    {/* Barra de progrés */}
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div variants={progressBar} initial="hidden" whileInView="visible" viewport={{ once: true }} className="h-full bg-primary rounded-full" />
                    </div>
                </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}