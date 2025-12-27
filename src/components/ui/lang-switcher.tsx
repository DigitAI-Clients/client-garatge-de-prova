'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
// 👇 Importem les noves banderes
import { FlagCA, FlagES, FlagGB } from '@/components/icons/flags';

const LANGUAGES = [
  { code: 'ca', label: 'Català', Flag: FlagCA },
  { code: 'es', label: 'Español', Flag: FlagES },
  { code: 'en', label: 'English', Flag: FlagGB },
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split('/')[1] || 'ca';
  const currentLang = LANGUAGES.find(l => l.code === currentLocale) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newCode: string) => {
    if (newCode === currentLocale) {
        setIsOpen(false);
        return;
    }
    const segments = pathname.split('/');
    segments[1] = newCode;
    const newPath = segments.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* BOTÓ TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-secondary/50 transition-colors text-sm font-medium border border-transparent"
      >
        {/* Renderitzem el component SVG */}
        <currentLang.Flag className="w-5 h-auto rounded-[2px] shadow-sm object-cover" />
        
        <span className="hidden lg:inline uppercase text-[10px] font-bold tracking-wide opacity-70">
          {currentLang.code}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-40 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5"
          >
            <div className="p-1 flex flex-col gap-0.5">
              {LANGUAGES.map((lang) => {
                const isSelected = currentLocale === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                      isSelected 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "hover:bg-secondary/80 text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                        {/* SVG al menú desplegable també */}
                        <lang.Flag className="w-5 h-auto rounded-[2px] shadow-sm" />
                        <span>{lang.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}