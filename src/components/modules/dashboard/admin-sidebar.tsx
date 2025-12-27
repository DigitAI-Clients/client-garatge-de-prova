'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CONFIG } from '@/config/digitai.config';
import { signOutAction } from '@/features/auth/actions';
import { ThemeToggle } from '@/components/ui/theme-toggle'; // 👈
import { LanguageSwitcher } from '@/components/ui/lang-switcher'; // 👈
import { 
  LayoutDashboard, Package, ShoppingBag, 
  LogOut, Store, List, 
  Globe, FileText, User as UserIcon
} from 'lucide-react';

export function AdminSidebar({ user }: { user: { email: string, full_name?: string | null } }) {
  const pathname = usePathname();
  const locale = useLocale();
  const { modules } = CONFIG;

  const navItems = [
    { label: 'Resum', href: '/dashboard', icon: LayoutDashboard, show: true },
    { label: 'Comandes', href: '/orders', icon: ShoppingBag, show: modules.ecommerce },
    { label: 'Productes', href: '/products', icon: Store, show: modules.ecommerce },
    { label: 'Serveis', href: '/services', icon: List, show: modules.booking },
    { label: 'Blog', href: '/blog-manager', icon: FileText, show: modules.blog },
    { label: 'Inventari', href: '/inventory', icon: Package, show: modules.inventory },
  ];

  return (
    // CANVI: bg-slate-900 -> bg-card (més semàntic per suportar temes)
    <aside className="hidden md:flex w-64 h-full bg-card text-card-foreground flex-col border-r border-border">
      
      {/* HEADER */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="font-bold text-xl tracking-tight text-primary">{CONFIG.identity.name}</span>
        <span className="ml-2 text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded font-bold border border-primary/20">Admin</span>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.filter(i => i.show).map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(href);
          return (
            <Link 
                key={item.href} 
                href={href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t border-border bg-muted/30 space-y-4">
        
        {/* Selectors a la part inferior */}
        <div className="flex justify-between items-center px-1">
            <LanguageSwitcher />
            <ThemeToggle />
        </div>

        <Link href={`/${locale}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/20 transition-colors">
            <Globe className="w-5 h-5" /> Veure Web Pública
        </Link>
        
        <div className="h-px bg-border w-full" />
        
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                <UserIcon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold truncate">{user.full_name}</p>
                <p className="text-[10px] text-muted-foreground">Administrador</p>
            </div>
            <form action={signOutAction}>
                <button type="submit" className="p-2 text-muted-foreground hover:text-red-500 transition-colors" title="Tancar Sessió">
                    <LogOut className="w-5 h-5" />
                </button>
            </form>
        </div>
      </div>
    </aside>
  );
}