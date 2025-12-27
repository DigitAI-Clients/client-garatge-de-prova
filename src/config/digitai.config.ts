// PROJECTE: Master Template
// FITXER: src/config/digitai.config.ts

import { MasterConfig } from "@/types/config";

export const CONFIG: MasterConfig = {
  identity: {
    name: "Master Template Debug",
    description: "Entorn de proves local",
    logoUrl: "/branding/logo.png",
    faviconUrl: "/favicon.ico",
    contactEmail: "debug@digitai.com",
    address: "Carrer de Proves, 404, Localhost",
  },

  branding: {
    colors: {
      primary: "#6366f1",   // Un color visible per veure si carrega
      secondary: "#10b981",
      background: "#ffffff",
      foreground: "#0f172a",
    },
    radius: 0.75,
  },

  content: {},

  footer: {
    columns: [
      { title: "Empresa", links: [{ label: "Inici", href: "/" }] }
    ],
    socials: { instagram: "https://instagram.com" },
    bottomText: "© 2025 Mode Debug."
  },

  modules: {
    layout: { variant: 'modern', stickyHeader: true },
    landing: {
      active: true,
      // 👇 AQUI DEFINIM L'ORDRE VISUAL DE LA PROVA
      sections: [
        { id: 'hero', type: 'hero' },
        { id: 'about', type: 'about' },       // Inclou stats normalment
        { id: 'services', type: 'services' },
        { id: 'cta_banner', type: 'cta_banner' },
        { id: 'featured_products', type: 'featured_products' }, // 👈 ID unificat
        { id: 'testimonials', type: 'testimonials' },
        { id: 'map', type: 'map' },           // 👈 La nova secció
        { id: 'faq', type: 'faq' },
        { id: 'contact', type: 'contact' }
      ]
    },
    auth: { active: true, allowPublicRegistration: true, redirects: { admin: '/dashboard', client: '/my-account' } },

    // 👇 AQUI AFEGIM LES PROPIETATS QUE FALTAVEN PER CUMPLIR EL TIPUS
    dashboard: true,
    booking: true,
    ecommerce: true,
    blog: true,
    inventory: true,
    accessControl: true,
    chatbot: true,
    gallery: false, // <--- NOVA (Required)
    faq: true       // <--- NOVA (Required)
  },
  i18n: { locales: ['ca', 'es', 'en'], defaultLocale: 'ca' }
};