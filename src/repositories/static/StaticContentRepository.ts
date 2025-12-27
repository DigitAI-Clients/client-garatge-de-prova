import { IContentRepository } from '../interfaces/IContentRepository';
import { LandingSectionData, SectionType } from '@/types/models';
import { CONFIG } from '@/config/digitai.config';

// 1. Definim l'estructura esperada del fitxer JSON de traduccions
interface TranslationStructure {
  Hero?: { title?: string; subtitle?: string; cta?: string };
  Services?: {
    title?: string;
    badge?: string;
    subtitle?: string;
    headlinePrefix?: string;
    headlineHighlight?: string;
    emptyState?: { title: string; text: string };
  };
  Contact?: { title?: string; button?: string };
  Stats?: { items: Array<{ value: string; label: string }> };
  Testimonials?: {
    title?: string;
    subtitle?: string;
    reviews: Array<{ author: string; role: string; text: string; rating: number }>;
  };
  Map?: { title?: string; embedUrl?: string };
  FAQ?: {
    title?: string;
    subtitle?: string;
    items: Array<{ question: string; answer: string }>
  };
  CTA?: {
    heading?: string;
    subheading?: string;
    button?: string
  };
  Shop?: {
    featuredTitle?: string;
    featuredSubtitle?: string;
  };
  About?: {
    badge?: string;
    title?: string;
    description?: string;
    features?: string[];
    stats?: Array<{ label: string; value: string }>;
    card?: { title: string; subtitle: string };
  }
}

export class StaticContentRepository implements IContentRepository {

  async getLandingSections(locale: string): Promise<LandingSectionData[]> {
    if (!CONFIG.modules.landing.active) return [];

    // 2. Inicialitzem traduccions
    let messages: Partial<TranslationStructure> = {};

    try {
      // Intentem carregar l'idioma demanat
      messages = (await import(`@/messages/${locale}.json`)).default;
    } catch (error) {
      console.warn(`⚠️ No s'ha trobat traducció per a '${locale} error:${error}', provant default.`);
      try {
        // Intentem carregar l'idioma per defecte
        messages = (await import(`@/messages/${CONFIG.i18n.defaultLocale}.json`)).default;
      } catch (fatalError) {
        console.error(`❌ Error Crític: No s'han trobat fitxers de traducció. '${fatalError}'`);
      }
    }

    // 3. Mapegem les seccions amb PRIORITAT CONFIG (IA)
    const sections = CONFIG.modules.landing.sections.map((sectionType, index) => {
      let content = {};

      // Preparem accessos directes a la config de la IA
      const aiHero = CONFIG.content?.hero;
      const aiAbout = CONFIG.content?.about;
      const aiServices = CONFIG.content?.services_intro;
      const aiTestimonials = CONFIG.content?.testimonials; // Recuperem testimonis IA
      switch (sectionType) {
        case 'hero':
          content = {
            // ✅ CORREGIT: Prioritat Config IA -> Traducció -> Default
            title: aiHero?.title || messages.Hero?.title || `Benvingut a ${CONFIG.identity.name}`,
            subtitle: aiHero?.subtitle || messages.Hero?.subtitle || CONFIG.identity.description,
            ctaText: aiHero?.cta || messages.Hero?.cta || "Saber-ne més",
            companyName: CONFIG.identity.name
          };
          break;

        case 'services':
          content = {
            // 1. Textos: Prioritat IA -> Traducció -> Defecte
            title: aiServices?.title || messages.Services?.badge || messages.Services?.title || "Serveis",
            subtitle: aiServices?.subtitle || messages.Services?.subtitle || "El que oferim",

            // 2. Configuració extra (Prefixos de títol)
            headlinePrefix: messages.Services?.headlinePrefix || "Solucions",
            headlineHighlight: messages.Services?.headlineHighlight || "A mida",

            // 3. Text per si tot falla (Empty State)
            emptyState: {
              title: messages.Services?.emptyState?.title || "No hi ha serveis disponibles",
              text: messages.Services?.emptyState?.text || "Sembla que encara no hem configurat els serveis."
            },

            // ✅ 4. LA CLAU: Passem els items de la IA al frontend
            items: aiServices?.items || []
          };
          break;

        case 'about':
          content = {
            badge: messages.About?.badge || "Sobre Nosaltres",
            // ✅ Aquest ja el tenies bé, però repassa'l
            title: aiAbout?.title || messages.About?.title || "La nostra essència",
            description: aiAbout?.description || messages.About?.description || "Som una empresa compromesa...",
            image_url: aiAbout?.image_url,
            features: messages.About?.features || [],
            stats: aiAbout?.stats || messages.About?.stats || [], // Prioritzem IA stats
            card: messages.About?.card || { title: "Creixement", subtitle: "Resultats" }
          };
          break;

        // ... La resta de casos (Contact, Stats, etc.) es mantenen igual perquè no els toca la IA encara
        case 'contact':
          content = {
            title: messages.Contact?.title || "Contacte",
            buttonText: messages.Contact?.button || "Enviar Missatge",
            // Podríem afegir email/telèfon del CONFIG.identity aquí si el component ho suporta
          };
          break;
        case 'stats':
          // ✅ FIX: Recuperem els stats de la IA (que estan dins de content.about)
          // Si no n'hi ha, mirem si n'hi ha al JSON de traducció.
          const statsItems = CONFIG.content?.about?.stats || messages.Stats?.items || [];

          content = {
            items: statsItems
          };
          break;

        case 'testimonials':
          content = {
            title: aiTestimonials?.title || messages.Testimonials?.title || "Opinions",
            subtitle: aiTestimonials?.subtitle || messages.Testimonials?.subtitle || "Clients feliços",
            // ✅ CLAU: Si la IA ha generat testimonis, els fem servir
            reviews: aiTestimonials?.items || messages.Testimonials?.reviews || []
          };
          break;

        case 'map':
          content = {
            title: messages.Map?.title || "Troba'ns",
            address: CONFIG.identity.address || "Barcelona, Spain",
            embedUrl: messages.Map?.embedUrl || ""
          };
          break;

        case 'faq':
          content = {
            title: messages.FAQ?.title || "Preguntes Freqüents",
            subtitle: messages.FAQ?.subtitle || "Resolem els teus dubtes.",
            items: messages.FAQ?.items || []
          };
          break;

        case 'cta_banner':
          content = {
            heading: messages.CTA?.heading || "A punt per començar?",
            subheading: messages.CTA?.subheading || "Uneix-te a nosaltres avui mateix.",
            buttonText: messages.CTA?.button || "Començar",
            buttonLink: '/booking'
          };
          break;

        case 'featured_products':
          content = {
            title: messages.Shop?.featuredTitle || "Productes Destacats",
            subtitle: messages.Shop?.featuredSubtitle || "Els més venuts.",
            limit: 4
          };
          break;

        default:
          return null;
      }

      return {
        id: `${sectionType}-${index}`,
        type: sectionType as SectionType,
        content
      };
    });

    return sections.filter((s): s is LandingSectionData => s !== null);
  }
}