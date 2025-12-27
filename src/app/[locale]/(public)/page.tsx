import { marketingService } from '@/services/container';
import { getServices } from '@/features/booking/actions';
import { ServiceContent } from '@/types/models'; // Assegura't que tens aquests tipus

// 1. IMPORTEM TOTS ELS COMPONENTS
import { HeroSection } from '@/components/modules/marketing/hero-section';
import { ServicesSection } from '@/components/modules/marketing/services-section';
import { ContactSection } from '@/components/modules/marketing/contact-section';
import { StatsSection } from '@/components/modules/marketing/stats-section';
import { TestimonialsSection } from '@/components/modules/marketing/testimonials-section';
import { MapSection } from '@/components/modules/marketing/map-section';
import { CTABannerSection } from '@/components/modules/marketing/cta-section';
import { FAQSection } from '@/components/modules/marketing/faq-section';
import { FeaturedProductsSection } from '@/components/modules/marketing/featured-products-section';
import { AboutSection } from '@/components/modules/marketing/about-section';

// 2. DEFINICIÓ DE TIPUS ESTRICTA
// En lloc de 'any', diem que un component de secció accepta una prop 'data' de tipus desconegut.
type SectionComponent = React.ComponentType<{ data: unknown }>;

// 3. MAPA DE COMPONENTS
// Fem servir 'as unknown as SectionComponent' per compatibilitzar els tipus estrictes de cada component
// amb el tipus genèric del mapa. Això és segur i evita l'ús d''any'.
const COMPONENTS: Record<string, SectionComponent | null> = {
  hero: HeroSection as unknown as SectionComponent,
  services: ServicesSection as unknown as SectionComponent,
  contact: ContactSection as unknown as SectionComponent,
  stats: StatsSection as unknown as SectionComponent,
  testimonials: TestimonialsSection as unknown as SectionComponent,
  map: MapSection as unknown as SectionComponent,
  cta_banner: CTABannerSection as unknown as SectionComponent,
  faq: FAQSection as unknown as SectionComponent,
  featured_products: FeaturedProductsSection as unknown as SectionComponent,
  about: AboutSection as unknown as SectionComponent, // 👈 Registre nou
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DynamicLandingPage({ params }: Props) {
  const { locale } = await params;
  
  // 4. Càrrega de Dades
  const sections = await marketingService.getLandingPageData(locale);
  const dbServices = await getServices();

  if (!sections.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Web en construcció</h1>
          <p className="text-muted-foreground">Configura les seccions a digitai.config.ts</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {sections.map((section) => {
        
        // 5. CAS ESPECIAL: SERVEIS (Injectem dades reals de DB)
        if (section.type === 'services') {
            // Casting segur en dos passos: unknown -> Tipus Correcte
            // Això evita l'error de "types do not overlap"
            const content = section.content as unknown as ServiceContent;

            return (
                <ServicesSection 
                    key={section.id} 
                    headerData={content} 
                    services={dbServices} 
                />
            );
        }

        // 6. CAS GENÈRIC (Renderitzat automàtic del config)
        const Component = COMPONENTS[section.type];
        
        if (!Component) {
          // Warning en desenvolupament només
          if (process.env.NODE_ENV === 'development') {
             console.warn(`⚠️ Secció desconeguda: "${section.type}"`);
          }
          return null;
        }

        return <Component key={section.id} data={section.content} />;
      })}
    </main>
  );
}