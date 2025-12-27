import { CONFIG as staticConfig } from '@/config/digitai.config';
import { SiteConfig } from '@/types/site-config'; 
import { SectionConfig, SectionType, ConfigLandingSection } from '@/types/config';

// Helper per netejar seccions (es manté igual, està bé)
const getStaticSections = (): SectionConfig[] => {
    return staticConfig.modules.landing.sections.map((s: ConfigLandingSection) => {
        if (typeof s === 'string') {
            return { id: s, type: s as SectionType };
        }
        return s;
    });
};

export const siteConfig: SiteConfig = {
  // --- IDENTITAT ---
  name: staticConfig.identity.name,
  description: staticConfig.identity.description,
  sector: 'general', // Això pot quedar així o venir de la config si cal

  // --- FEATURES (Mòduls) ---
  // ✅ ARA SÍ: Connectem amb la Fàbrica
  features: {
    booking: staticConfig.modules.booking,
    ecommerce: staticConfig.modules.ecommerce,
    blog: staticConfig.modules.blog,
    
    // Si la config té gallery, l'usem. Si no, false.
    gallery: staticConfig.modules.gallery ?? false, 
    
    // Si la config té faq (o chatbot), l'usem.
    faq: staticConfig.modules.faq ?? staticConfig.modules.chatbot ?? false 
  },

  // --- TEMA ---
  theme: {
    primary: staticConfig.branding.colors.primary,
    layout: staticConfig.modules.layout.variant, // Connectat
  },

  // --- LANDING ---
  landing: {
    sections: getStaticSections()
  },

  // --- CONTACTE ---
  contact: {
    email: staticConfig.identity.contactEmail,
    
    // ✅ ARREGLAT: Ara llegeix el telèfon de la IA/Formulari
    phone: staticConfig.identity.phone || "", 
    
    address: staticConfig.identity.address || "",
    socials: staticConfig.footer.socials || {}
  }
};

// Exports per facilitat d'ús
export const features = siteConfig.features;
export const contact = siteConfig.contact;
export const theme = siteConfig.theme;