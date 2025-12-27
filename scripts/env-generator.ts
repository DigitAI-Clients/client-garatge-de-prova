import { CONFIG } from '../src/config/digitai.config';
import fs from 'fs';

// 1. Variables Base (Sempre necessàries)
const BASE_ENV = `
# --- SYSTEM (OBLIGATORI) ---
# URL base per enllaços als emails i SEO (Sense barra final)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# --- SUPABASE (OBLIGATORI) ---
NEXT_PUBLIC_SUPABASE_URL="https://teu-projecte.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# --- IDENTITAT ORG (OBLIGATORI) ---
# Aquesta ID identifica el negoci dins la base de dades multi-tenant
NEXT_PUBLIC_ORG_ID="${CONFIG.organizationId}"

# --- GOOGLE GEMINI (OBLIGATORI PER CHATBOT) ---
GEMINI_API_KEY="AIzaSy..."
`;

// 2. Variables de Correu (Resend)
// Necessàries si hi ha Auth (benvinguda) o Ecommerce (tiquets)
const EMAIL_ENV = `
# --- EMAIL (RESEND) ---
# API Key de https://resend.com (Necessari per Auth i Ecommerce)
RESEND_API_KEY="re_..."

# Remitent dels correus (ha de ser un domini verificat a Resend)
# EXEMPLE: no-reply@${CONFIG.identity.name.toLowerCase().replace(/\s+/g, '')}.com
EMAIL_FROM_ADDRESS="onboarding@resend.dev"
EMAIL_FROM_NAME="${CONFIG.identity.name}" 
`;

// 3. Variables d'Ecommerce (Stripe)
const ECOMMERCE_ENV = `
# --- STRIPE (PAGAMENTS) ---
# Claus de la teva plataforma (Dashboard > Developers > API Keys)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Secret del Webhook (Dashboard > Developers > Webhooks)
# IMPORTANT: Executa 'stripe listen --forward-to localhost:3000/api/webhooks/stripe' per obtenir-lo en local
STRIPE_WEBHOOK_SECRET="whsec_..."
`;

// 4. Variables de Booking
const BOOKING_ENV = `
# --- BOOKING (Integracions futures) ---
# GOOGLE_CALENDAR_ID=""
`;

function generateEnv() {
  let envContent = BASE_ENV.trim();

  console.log("⚙️  Generant .env.local.example basat en la configuració...");

  // Lògica Condicional per mòduls

  // Si hi ha Auth o Ecommerce, necessitem enviar correus
  if (CONFIG.modules.auth.active || CONFIG.modules.ecommerce) {
    envContent += "\n\n" + EMAIL_ENV.trim();
    console.log("   👉 Afegit bloc EMAIL (Requerit per Auth/Ecommerce)");
  }

  if (CONFIG.modules.ecommerce) {
    envContent += "\n\n" + ECOMMERCE_ENV.trim();
    console.log("   👉 Afegit bloc ECOMMERCE (Stripe)");
  }

  if (CONFIG.modules.booking) {
    envContent += "\n\n" + BOOKING_ENV.trim();
    console.log("   👉 Afegit bloc BOOKING");
  }

  // Escriure el fitxer
  try {
    // Generem tant el .example com el .env.local si no existeix (opcional)
    fs.writeFileSync('.env.local.example', envContent);
    
    console.log("\n✅ Fitxer '.env.local.example' generat correctament!");
    console.log("📝 Recorda copiar-lo a '.env.local' i omplir les claus reals.");
    
  } catch (error) {
    console.error("❌ Error generant el fitxer .env:", error);
  }
}

generateEnv();