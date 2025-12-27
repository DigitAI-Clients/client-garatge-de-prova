import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeInjector } from "@/components/providers/theme-injector";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CONFIG } from "@/config/digitai.config";
import "../globals.css";
import { Toaster } from 'sonner';
import { siteConfig, theme } from "@/lib/site-config";
// ✅ IMPORTAR REACT (necessari per als tipus)
import React from "react"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: { icon: CONFIG.identity.faviconUrl }
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!CONFIG.i18n.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    // ✅ FIX: Fem servir 'as React.CSSProperties' per permetre variables custom
    <html 
      lang={locale} 
      suppressHydrationWarning 
      style={{ '--primary': theme.primary } as React.CSSProperties}
    >
      <head>
        <ThemeInjector />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster position="top-center" richColors />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}