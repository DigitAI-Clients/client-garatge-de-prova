'use client';

import Link from 'next/link';
import { CONFIG } from '@/config/digitai.config';
// 👇 Importem LucideIcon per evitar 'any'
import { Twitter, Instagram, Linkedin, Hexagon, Heart, LucideIcon } from 'lucide-react';

export function Footer() {
  const { identity, footer } = CONFIG;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0a] text-white pt-24 pb-12 overflow-hidden border-t border-white/10">
      
      {/* 🎨 TEXTURA DE FONS & GLOW */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-25 bg-primary/20 blur-[100px] opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* COLUMNA 1: BRANDING */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
               <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-500">
                  <Hexagon className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
               </div>
               <span className="text-2xl font-black tracking-tight text-white group-hover:tracking-wide transition-all duration-500">
                 {identity.name}
               </span>
            </Link>
            
            <p className="text-zinc-400 leading-relaxed max-w-sm text-sm">
              {identity.description}
            </p>
            
            <div className="flex gap-3">
              {footer.socials?.twitter && <SocialButton href={footer.socials.twitter} icon={Twitter} />}
              {footer.socials?.instagram && <SocialButton href={footer.socials.instagram} icon={Instagram} />}
              {footer.socials?.linkedin && <SocialButton href={footer.socials.linkedin} icon={Linkedin} />}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2" />

          {/* COLUMNES DINÀMIQUES */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8">
              {footer.columns.map((col, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider opacity-90">{col.title}</h3>
                  <ul className="space-y-4">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link 
                          href={link.href} 
                          className="group flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors text-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-300 scale-0 group-hover:scale-100" />
                          <span className="group-hover:translate-x-1 transition-transform duration-300">
                            {link.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>

        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-zinc-500 font-medium">
            © {currentYear} {identity.name}. {footer.bottomText.replace(/\d{4}/, '')}
          </p>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <span>Fet amb</span>
                <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                <span>per <span className="text-zinc-300 font-bold">{identity.name}</span></span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ✨ Component Auxiliar Correctament Tipat
interface SocialButtonProps {
    href: string;
    icon: LucideIcon; // 👈 CORRECCIÓ: Substituït 'any' per 'LucideIcon'
}

function SocialButton({ href, icon: Icon }: SocialButtonProps) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden hover:border-primary/50 transition-colors"
        >
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <Icon className="w-4 h-4 text-zinc-400 relative z-10 group-hover:text-white transition-colors duration-300" />
        </a>
    )
}