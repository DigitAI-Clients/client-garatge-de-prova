'use client';

import { useActionState, useEffect, useRef } from 'react';
import { ContactContent } from '@/types/models';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mail, Phone, MapPin, Loader2, CheckCircle2, LucideIcon } from 'lucide-react';
import { submitContactForm } from '@/features/contact/actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config'; // 👈 IMPORTACIÓ CLAU

export function ContactSection({ data }: { data: ContactContent }) {
  const [state, formAction, isPending] = useActionState(submitContactForm, { 
    success: false, 
    message: '' 
  });
  
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) formRef.current.reset();
  }, [state.success]);

  // 🧠 LÒGICA HÍBRIDA: Textos IA + Dades Reals Config
  const contactInfo = {
    email: siteConfig.contact.email, // Dades reals del client
    phone: siteConfig.contact.phone,
    address: siteConfig.contact.address,
    title: data.title || "Contacta amb nosaltres", // Text persuasiu IA
    description: data.description || "Estem aquí per ajudar-te."
  };

  return (
    <section className="relative py-24 bg-background overflow-hidden" id="contact">
      
      {/* Fons Decoratiu */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="container px-4 mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* INFO COLUMNA ESQUERRA */}
          <motion.div 
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
          >
             <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              Contacte
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
              {contactInfo.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              {contactInfo.description}
            </p>

            <div className="space-y-8">
              {/* Dades reals del JSON site-config */}
              <ContactItem icon={Mail} title="Email" value={contactInfo.email} href={`mailto:${contactInfo.email}`} />
              
              {contactInfo.phone && (
                <ContactItem icon={Phone} title="Telèfon" value={contactInfo.phone} href={`tel:${contactInfo.phone}`} />
              )}
              
              {contactInfo.address && (
                <ContactItem icon={MapPin} title="Ubicació" value={contactInfo.address} />
              )}
            </div>
          </motion.div>

          {/* FORMULARI COLUMNA DRETA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 md:p-10 rounded-4xl shadow-2xl shadow-primary/5">
              
              <h3 className="text-2xl font-bold mb-6 text-foreground">Envia'ns un missatge</h3>
              
              <form ref={formRef} action={formAction} className="space-y-6">
                
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground/80 ml-1">Nom complet</label>
                  <input type="text" id="name" name="name" required placeholder="El teu nom" className="w-full px-5 py-3.5 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground/80 ml-1">Correu electrònic</label>
                  <input type="email" id="email" name="email" required placeholder="tucorreu@exemple.com" className="w-full px-5 py-3.5 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground/80 ml-1">Missatge</label>
                  <textarea id="message" name="message" required rows={4} placeholder="Com et podem ajudar?" className="w-full px-5 py-3.5 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" />
                </div>

                {/* Checkbox Legal */}
                <div className="flex items-start gap-3 pt-2">
                    <div className="relative flex items-center">
                        <input type="checkbox" id="terms" name="terms" required className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border bg-background transition-all checked:border-primary checked:bg-primary" />
                        <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer select-none">
                        He llegit i accepto la <Link href="/privacy" className="font-bold underline">política de privacitat</Link>.
                    </label>
                </div>

                {/* Feedback Messages */}
                <AnimatePresence>
                  {state.message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={cn("p-4 rounded-lg text-sm font-medium flex items-center gap-2", state.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}
                    >
                      {state.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={isPending} className="w-full group relative flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-xl font-bold text-lg overflow-hidden transition-all disabled:opacity-70 hover:shadow-lg">
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-primary-foreground">
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <> Enviar <Send className="w-4 h-4" /> </>}
                  </span>
                </button>

              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// Component auxiliar per als items de contacte
interface ContactItemProps {
  icon: LucideIcon;
  title: string;
  value: string;
  href?: string;
}

function ContactItem({ icon: Icon, title, value, href }: ContactItemProps) {
    const Wrapper = href ? 'a' : 'div';
    return (
        <Wrapper href={href} className={cn("flex items-start gap-5 p-4 rounded-2xl transition-all duration-300 border border-transparent", href ? "hover:bg-card hover:border-border hover:shadow-sm group cursor-pointer" : "")}>
            <div className="p-3 bg-secondary rounded-xl text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-foreground text-base mb-1">{title}</h3>
                <p className="text-muted-foreground group-hover:text-primary transition-colors duration-300 font-medium">{value}</p>
            </div>
        </Wrapper>
    );
}