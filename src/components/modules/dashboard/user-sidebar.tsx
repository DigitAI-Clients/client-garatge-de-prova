'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CONFIG } from '@/config/digitai.config';
import { signOutAction } from '@/features/auth/actions';
import { ThemeToggle } from '@/components/ui/theme-toggle'; // 👈
import { LanguageSwitcher } from '@/components/ui/lang-switcher'; // 👈
import { User, Calendar, LogOut, ShoppingBag, Store } from 'lucide-react';

export function UserSidebar({ user }: { user: { email: string, full_name?: string | null } }) {
  const pathname = usePathname();
  const locale = useLocale();
  const { modules } = CONFIG;

  const navItems = [
    { label: 'El meu Compte', href: '/my-account', icon: User, show: true },
    { label: 'Les meves Cites', href: '/my-booking-history', icon: Calendar, show: modules.booking },
    { label: 'Tornar a la Botiga', href: '/shop', icon: ShoppingBag, show: modules.ecommerce },
  ];

  return (
    <aside className="hidden md:flex w-64 h-full bg-card text-card-foreground flex-col border-r border-border">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="font-bold text-xl text-primary">{CONFIG.identity.name}</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.filter(i => i.show).map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(href);
          return (
            <Link 
                key={item.href} 
                href={href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                    ? "bg-secondary text-secondary-foreground font-bold" 
                    : "text-muted-foreground hover:bg-muted"
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-muted/30 space-y-4">
        {/* INTEGRACIÓ TOGGLES */}
        <div className="flex justify-between items-center px-1">
            <LanguageSwitcher />
            <ThemeToggle />
        </div>

        <div className="h-px bg-border w-full" />

        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User className="w-4 h-4" /></div>
            <div className="overflow-hidden flex-1"><p className="text-sm font-bold truncate">{user.full_name || 'Client'}</p></div>
            <form action={signOutAction}><button type="submit" className="p-2 text-muted-foreground hover:text-red-500"><LogOut className="w-5 h-5" /></button></form>
        </div>
      </div>
    </aside>
  );
}