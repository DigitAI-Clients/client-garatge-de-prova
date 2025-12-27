'use client';

import { CTABannerContent } from '@/types/models';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { siteConfig } from '@/lib/site-config'; // 👈 IMPORT CLAU

export function CTABannerSection({ data }: { data: CTABannerContent }) {
  
  // 1. Fallbacks Intel·ligents amb el nom del negoci
  const heading = data?.heading || `Tens dubtes sobre ${siteConfig.name}?`;
  const subheading = data?.subheading || "Estem aquí per ajudar-te a fer el següent pas.";
  
  // 2. Botó i Enllaç
  const btnText = data?.buttonText || "Parlem-ne";
  const btnLink = "/contact"; // Normalment el CTA sempre porta a contacte

  // 3. Etiquetes de Confiança (Neutres per a qualsevol sector)
  const trustTags = ["Sense Compromís", "Resposta Ràpida"];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
            
            {/* CONTENIDOR PRINCIPAL (Glassmorphism) */}
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[3rem] border border-border/50 bg-background/30 backdrop-blur-2xl shadow-2xl isolate"
            >
                
                {/* MOTOR D'ANIMACIÓ DE FONS (L'Aurora) */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    {/* Blob 1: Color Primari */}
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, -50, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-[20%] -right-[10%] w-125 h-125 rounded-full bg-primary/20 blur-[120px]"
                    />
                    {/* Blob 2: Color Secundari */}
                    <motion.div 
                        animate={{ scale: [1, 1.5, 1], x: [0, -100, 0], y: [0, 50, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute -bottom-[20%] -left-[10%] w-100 h-100 rounded-full bg-secondary/20 blur-[100px]"
                    />
                </div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                {/* ESTRUCTURA DE CONTINGUT */}
                <div className="relative z-10 grid lg:grid-cols-2 gap-12 p-10 md:p-20 items-center">
                    
                    {/* TEXT */}
                    <div className="text-left space-y-6">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                            {heading}
                        </h2>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-md font-medium">
                            {subheading}
                        </p>

                        {/* Trust Signals Dinàmics */}
                        <div className="flex flex-wrap gap-3 pt-4">
                            {trustTags.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-foreground/90 font-bold bg-background/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-sm">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACCIÓ */}
                    <div className="flex flex-col items-start lg:items-end justify-center">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
                            {/* Halo Glow */}
                            <div className="absolute -inset-1 bg-linear-to-r from-primary via-secondary to-primary rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500" />
                            
                            <Link 
                                href={btnLink} 
                                className="relative flex items-center gap-4 bg-primary text-primary-foreground px-10 py-6 rounded-full font-bold text-xl shadow-xl transition-all"
                            >
                                <MessageSquare className="w-6 h-6" />
                                <span>{btnText}</span>
                                <div className="bg-white/20 rounded-full p-1.5 group-hover:translate-x-1 transition-transform">
                                    <ArrowRight className="w-4 h-4 text-primary-foreground" />
                                </div>
                            </Link>
                        </motion.div>
                    </div>

                </div>

                {/* Glass Border */}
                <div className="absolute inset-0 border border-white/20 dark:border-white/10 rounded-[3rem] pointer-events-none" />
                
            </motion.div>
        </div>
    </section>
  );
}