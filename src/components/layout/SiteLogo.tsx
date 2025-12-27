'use client';

import Link from 'next/link';
import { CONFIG } from '@/config/digitai.config'; // 👈 Connectat a la Fàbrica
import { Hexagon } from 'lucide-react';

export function SiteLogo() {
  const { identity } = CONFIG;

  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      {/* Si hi ha logoUrl (i no és placeholder), el mostrem. Si no, icona */}
      {identity.logoUrl && identity.logoUrl !== "/images/logo-placeholder.png" ? (
         // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={identity.logoUrl} 
          alt={identity.name} 
          className="h-8 w-auto object-contain"
        />
      ) : (
        <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
          <Hexagon className="w-6 h-6 text-primary fill-primary/20" />
        </div>
      )}
      
      <span className="font-bold text-xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
        {identity.name} {/* 👈 AQUI SURTIRÀ "Perruqueria Clip" */}
      </span>
    </Link>
  );
}