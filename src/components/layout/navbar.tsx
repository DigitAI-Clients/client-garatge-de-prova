'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
// ❌ ABANS: import { CONFIG } from '@/config/digitai.config';
// ✅ ARA: Importem la config dinàmica injectada per la Factory
import { features } from '@/lib/site-config'; 

import { ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@supabase/supabase-js';
import { useCartStore } from '@/lib/store/cart-store';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/lang-switcher';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiteLogo } from '@/components/layout/SiteLogo';

export function Navbar({ user }: { user: User | null }) {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const pathname = usePathname();
  
  // ✅ ARA ÉS DINÀMIC: Si la Factory activa l'ecommerce, això serà true
  const isShop = features.ecommerce; 
  const toggleCart = useCartStore(state => state.toggleCart);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLink = (path: string) => `/${locale}${path}`;
  const isActive = (path: string) => pathname === getLink(path) || pathname.startsWith(`${getLink(path)}/`);

  // ✅ Llista de links condicionals segons el site-config
  const navLinks = [
    { href: '/services', label: t('links.services'), show: true }, // Sempre visible
    { href: '/blog', label: t('links.blog'), show: features.blog },
    { href: '/shop', label: t('links.shop'), show: features.ecommerce }, // Usa traducció
    { href: '/contact', label: t('links.contact'), show: true }
  ];

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 border-b",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-border/60 shadow-sm"
            : "bg-background/0 border-transparent"
        )}
      >
        <div className="container relative flex h-20 items-center justify-between px-4 md:px-6">

          {/* 1. LOGO */}
          <div className="flex-1 flex justify-start">
            <SiteLogo />
          </div>

          {/* 2. CENTRE (Desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-1 bg-secondary/30 p-1.5 rounded-full border border-border/50 backdrop-blur-md">
              {navLinks.filter(l => l.show).map((link) => { // 👈 Filtrem els false
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={getLink(link.href)}
                    className={cn(
                      "relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="navbar-pill"
                        className="absolute inset-0 bg-primary rounded-full shadow-md shadow-primary/20 -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 3. DRETA */}
          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-secondary/30 rounded-full p-1 border border-border/50">
              <LanguageSwitcher />
              <div className="w-px h-4 bg-border/50 mx-1" />
              <ThemeToggle />
            </div>

            {isShop && (
              <button
                onClick={toggleCart}
                className="relative p-2.5 rounded-full hover:bg-secondary transition-colors group"
              >
                <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
              </button>
            )}

            {/* Login / User logic igual que abans... */}
             {user ? (
              <Link href="/dashboard" className="hidden sm:block">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                   {user.email?.[0].toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link href="/auth/login" className="hidden sm:block">
                <button className="bg-foreground text-background hover:bg-foreground/80 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg">
                  {t('cta')}
                </button>
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU (Igual, però filtrant links) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-20 z-30 bg-background/95 backdrop-blur-2xl border-b border-border shadow-2xl md:hidden p-6 flex flex-col gap-6"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.filter(l => l.show).map((link) => (
                <Link
                  key={link.href}
                  href={getLink(link.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-bold py-3 px-4 rounded-xl transition-colors",
                    isActive(link.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {/* Resta del menú mòbil... */}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}