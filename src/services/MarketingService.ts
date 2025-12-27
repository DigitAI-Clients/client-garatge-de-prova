import { siteConfig as baseConfig } from '@/lib/site-config';
import { getMessages } from 'next-intl/server';
import { SectionConfig } from '@/types/config';
import { SiteConfig } from '@/types/site-config'; // Necessitem importar el tipus

export class MarketingService {
  
  async getLandingPageData(locale: string) {
    // ✅ SOLUCIÓ ERROR 2: Usem '?.' i '?? []' per si landing és undefined
    let sectionsConfig = baseConfig.landing?.sections ?? [];

    // 1. INTENTEM CARREGAR EL JSON DINÀMIC
    try {
        // Importem el JSON
        const rawImport = await import('@/config/site-config.json');
        
        // ✅ SOLUCIÓ ERROR 3: Fem un cast (as unknown as ...)
        // Això li diu a TypeScript: "Tracta aquest import com un SiteConfig"
        // 'default' és necessari perquè els imports JSON a vegades venen dins de .default
        const dynamicConfig = (rawImport.default || rawImport) as unknown as Partial<SiteConfig>;
        
        if (dynamicConfig.landing?.sections && Array.isArray(dynamicConfig.landing.sections)) {
            console.log(`✅ [MarketingService] Config JSON carregada! Seccions: ${dynamicConfig.landing.sections.length}`);
            sectionsConfig = dynamicConfig.landing.sections as SectionConfig[];
        }
    } catch (e) {
        // No fem warn, és normal en mode template
    }

    // 2. Comprovació de seguretat
    if (!sectionsConfig || sectionsConfig.length === 0) {
        return [];
    }

    // 3. Carreguem traduccions
    const messages = await getMessages({ locale });
    const t = messages as Record<string, unknown>;

    // 4. Muntem les dades
    const populatedSections = sectionsConfig.map(section => {
      // Normalitzem strings vs objectes
      const sectionId = typeof section === 'string' ? section : section.id;
      const sectionType = typeof section === 'string' ? section : section.type;

      const content = t[sectionId];

      return {
        id: sectionId,
        type: sectionType,
        content: (content as object) || {} 
      };
    });

    return populatedSections;
  }
}

export const marketingService = new MarketingService();