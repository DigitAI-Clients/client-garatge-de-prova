'use client';

import Link from 'next/link';
import { 
  LayoutDashboard, ShoppingBag, Store, 
  List, FileText, Package, User, Globe, Menu, X 
} from 'lucide-react';
import { CONFIG } from '@/config/digitai.config';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AppMobileBar({ user }: { user: { role?: string } }) {
  const locale = useLocale();
  const isAdmin = user?.role === 'admin';
  const { modules } = CONFIG;
  const [isOpen, setIsOpen] = useState(false);

  // LINKS ADMIN
  const adminLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Resum' },
    { href: '/products', icon: Store, label: 'Productes', show: modules.ecommerce },
    { href: '/orders', icon: ShoppingBag, label: 'Comandes', show: modules.ecommerce },
    { href: '/services', icon: List, label: 'Serveis', show: modules.booking },
    { href: '/blog-manager', icon: FileText, label: 'Blog', show: modules.blog },
    { href: '/inventory', icon: Package, label: 'Inventari', show: modules.inventory },
  ].filter(l => l.show !== false);

  // LINKS CLIENT
  const clientLinks = [
    { href: '/my-account', icon: User, label: 'Perfil' },
    // Afegir més si cal
  ];

  const links = isAdmin ? adminLinks : clientLinks;
  
  // Mostrem max 4 fixes + menú
  const fixed = links.slice(0, 4);
  const more = links.slice(4);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-60 bg-white rounded-t-2xl shadow-2xl p-4 pb-24 md:hidden">
                <div className="grid grid-cols-3 gap-4">
                    {more.map(l => (
                        <Link key={l.href} href={`/${locale}${l.href}`} onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <l.icon size={24} className="text-primary"/> <span className="text-xs">{l.label}</span>
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link href={`/${locale}`} className="flex flex-col items-center gap-2 p-3 bg-slate-900 text-white rounded-xl col-span-3">
                            <Globe size={24} /> <span className="text-xs font-bold">Anar a Web Pública</span>
                        </Link>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50">
        <div className="flex justify-around items-center">
            {fixed.map(link => (
                <Link key={link.href} href={`/${locale}${link.href}`} className="flex flex-col items-center gap-1 text-slate-500">
                    <link.icon size={24} />
                    <span className="text-[10px]">{link.label}</span>
                </Link>
            ))}
            {more.length > 0 || isAdmin ? (
                <button onClick={() => setIsOpen(!isOpen)} className="flex flex-col items-center gap-1 text-slate-500">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                    <span className="text-[10px]">Més</span>
                </button>
            ) : null}
        </div>
      </div>
    </>
  );
}