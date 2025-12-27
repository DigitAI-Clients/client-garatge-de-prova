'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Calendar, User } from 'lucide-react';
import { CONFIG } from '@/config/digitai.config';
import { useCartStore } from '@/lib/store/cart-store';
import { useLocale } from 'next-intl';
type UserSummary = {
  email: string;
  full_name?: string | null;
  role?: string;
};
export function PublicMobileBar({ user }: { user: UserSummary | null}) {
  const pathname = usePathname();
  const locale = useLocale();
  const cartCount = useCartStore(s => s.items.length);
  const { modules } = CONFIG;

  const links = [
    { href: '/', icon: Home, label: 'Inici', show: true },
    { href: '/shop', icon: ShoppingBag, label: 'Botiga', show: modules.ecommerce, badge: cartCount },
    { href: '/book', icon: Calendar, label: 'Cites', show: modules.booking },
    { 
      href: user ? (user.role === 'admin' ? '/dashboard' : '/my-account') : '/auth/login', 
      icon: User, 
      label: user ? 'Compte' : 'Login', 
      show: true 
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {links.filter(l => l.show).map((link) => {
          const href = `/${locale}${link.href === '/' ? '' : link.href}`;
          const isActive = pathname === href;
          return (
            <Link key={link.label} href={href} className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
              <div className="relative">
                <link.icon className="w-6 h-6" />
                {link.badge ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{link.badge}</span> : null}
              </div>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}