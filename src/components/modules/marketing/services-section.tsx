'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ServiceContent } from '@/types/models';
import { siteConfig } from '@/lib/site-config'; // 👈 IMPORT CLAU

// 1. DEFINICIÓ DE TIPOS
// ------------------------------

interface ServiceDTO {
    id: string;
    title: string;
    description: string;
    price?: number;
    image?: string;
}

interface AIServiceItem {
    title: string;
    description: string;
    icon_name?: string;
}

type UnifiedServiceItem = ServiceDTO | AIServiceItem;

// Estenem la interfície per evitar errors de TypeScript amb el JSON de la IA
interface ExtendedServiceContent extends Omit<ServiceContent, 'items'> {
    badge?: string;
    items?: AIServiceItem[];
}

interface Props {
    headerData: ServiceContent; 
    services?: ServiceDTO[];    
}

export function ServicesSection({ headerData, services = [] }: Props) {
    
    const data = headerData as ExtendedServiceContent;

    // 2. LÒGICA DE FALLBACK INTEL·LIGENT (Si la IA falla)
    // ---------------------------------------------------
    const generateSmartServices = () => [
        {
            title: `Experiència ${siteConfig.name}`,
            description: `Gaudeix del millor servei de ${siteConfig.sector || "la zona"} amb la nostra atenció personalitzada.`
        },
        {
            title: "Qualitat Premium",
            description: "Treballem amb els millors estàndards per garantir la teva satisfacció total."
        },
        {
            title: "Atenció Integral",
            description: `L'equip de ${siteConfig.name} està a la teva disposició per resoldre qualsevol dubte.`
        }
    ];

    // 3. SELECCIÓ DE DADES
    // Prioritat: 1. DB (services) -> 2. IA (data.items) -> 3. Fallback Generat
    let itemsToShow: UnifiedServiceItem[] = [];

    if (services && services.length > 0) {
        itemsToShow = services;
    } else if (data.items && data.items.length > 0) {
        itemsToShow = data.items;
    } else {
        itemsToShow = generateSmartServices();
    }

    // Fallbacks de textos
    const badge = data.badge || "Els nostres serveis";
    const title = data.title || `Què oferim a ${siteConfig.name}`;
    const subtitle = data.subtitle || "Solucions pensades per a tu.";

    return (
        <section className="py-24 bg-secondary/5 relative overflow-hidden" id="services">
            
            {/* Decoració de fons */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-125 h-125 bg-secondary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                            {badge}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground tracking-tight">
                            {title}
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">{subtitle}</p>
                    </motion.div>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {itemsToShow.map((item, i) => {
                        // Generem Key segura
                        const key = 'id' in item ? item.id : `service-${i}`;

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative p-8 bg-background rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Gradient Hover Effect */}
                                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <Sparkles className="w-7 h-7" />
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    
                                    <p className="text-muted-foreground mb-6 leading-relaxed min-h-20">
                                        {item.description}
                                    </p>

                                    {/* Link Simulat */}
                                    <div className="flex items-center gap-2 text-sm font-bold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        Saber-ne més <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}