'use client';

import { useState } from 'react';
import { ServiceDTO } from '@/types/models'; // Nota: Si uses ServiceDTO, importa aquest
import { motion } from 'framer-motion';
import { Clock, Sparkles, ArrowRight, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: ServiceDTO;
  index: number;
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Formategem preu
  const priceString = (service.price ?? 0).toString();
  const [priceMain, priceDecimals] = priceString.split('.');

  // Toggle per mòbil
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="h-full"
    >
        <div 
            onClick={toggleOpen} 
            className={cn(
                "group relative bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 overflow-hidden transition-all duration-300",
                "rounded-2xl cursor-pointer md:cursor-default", 
                isOpen ? "bg-card/60 shadow-lg border-primary/20" : "hover:bg-card/50",
                "md:h-full md:flex md:flex-col md:p-6 md:hover:border-primary/20 md:hover:shadow-xl md:hover:shadow-primary/5 md:bg-card/40"
            )}
        >
            {/* Header */}
            <div className="p-5 md:p-0 flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                        "bg-primary/10 text-primary shadow-inner shadow-primary/10",
                        "md:group-hover:bg-primary md:group-hover:text-primary-foreground"
                    )}>
                        <Sparkles className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col">
                        <h3 className="font-bold text-lg md:text-xl text-foreground leading-tight group-hover:text-primary transition-colors">
                            {service.title}
                        </h3>
                        {/* Teaser Mòbil */}
                        <div className={cn("md:hidden text-xs font-medium text-muted-foreground flex items-center gap-2", isOpen && "opacity-0")}>
                           <span>{service.duration_minutes} min</span> • <span className="text-foreground font-bold">{service.price}€</span>
                        </div>
                    </div>
                </div>

                <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-300 md:hidden",
                    isOpen && "rotate-180 text-primary"
                )} />
            </div>

            {/* Contingut */}
            <div className={cn(
                "md:block md:mt-4 md:flex-1", 
                isOpen ? "block" : "hidden"
            )}>
                <div className="h-px w-full bg-border/50 md:hidden mb-4" />

                <div className="px-5 pb-5 md:p-0 flex flex-col h-full">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 md:mb-6">
                        {service.description || "Servei professional optimitzat per a resultats ràpids."}
                    </p>

                    <div className="flex items-center gap-3 mb-6 text-xs text-muted-foreground/80 md:mb-auto">
                         <div className="flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded-md">
                            <Clock size={12} /> {service.duration_minutes} min
                         </div>
                         <div className="flex items-center gap-1 px-2 py-1">
                            <Check size={12} className="text-green-500" /> Disponibilitat immediata
                         </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-auto pt-4 md:pt-0 md:border-t-0 border-t border-border/30">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Preu</span>
                            <div className="flex items-baseline leading-none">
                                <span className="text-2xl font-black text-foreground">{priceMain}</span>
                                {priceDecimals && <span className="text-sm font-bold text-muted-foreground">.{priceDecimals}</span>}
                                <span className="text-sm font-bold text-primary ml-0.5">€</span>
                            </div>
                        </div>

                        <Link href={`/book?serviceId=${service.id}`} className="md:w-auto">
                            <button className="group/btn relative overflow-hidden rounded-lg bg-foreground text-background px-5 py-2.5 font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                                <span className="relative z-10 flex items-center gap-2 group-hover/btn:text-primary-foreground transition-colors">
                                    Reservar <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            
            <div className="hidden md:block absolute -inset-px bg-linear-to-b from-primary/30 to-transparent opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 -z-10 rounded-2xl" />
        </div>
    </motion.div>
  );
}