import { Octokit } from '@octokit/rest';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// ------------------------------------------------------------------
// 0. DEFINICIÓ DE TIPUS & HELPERS
// ------------------------------------------------------------------

interface ApiError { status?: number; message?: string; }
interface OctokitErrorResponse { message?: string; response?: { data?: { message?: string; }; }; }

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const e = error as OctokitErrorResponse;
    if (e.response?.data?.message) return `GitHub API: ${e.response.data.message}`;
    if (e.message) return e.message;
  }
  return String(error);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------------
// 1. VALIDACIÓ DE VARIABLES D'ENTORN
// ------------------------------------------------------------------

const ENV = {
  GITHUB_TOKEN: process.env.GITHUB_ACCESS_TOKEN ?? '',
  TEMPLATE_OWNER: process.env.GITHUB_TEMPLATE_OWNER ?? '',
  TEMPLATE_REPO: process.env.GITHUB_TEMPLATE_REPO ?? '',
  TARGET_ORG: process.env.GITHUB_TARGET_ORG ?? '',
  VERCEL_TOKEN: process.env.VERCEL_TOKEN ?? '',
  
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  SUPABASE_SERVICE: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '', 
};

if (!ENV.GITHUB_TOKEN || !ENV.VERCEL_TOKEN || !ENV.SUPABASE_URL) {
  console.error('❌ Error Crític: Falten variables d\'entorn essencials.');
  process.exit(1);
}

// ------------------------------------------------------------------
// 2. INICIALITZACIÓ
// ------------------------------------------------------------------

const octokit = new Octokit({ auth: ENV.GITHUB_TOKEN });
const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ------------------------------------------------------------------
// 3. FUNCIONS DE NEGOCI
// ------------------------------------------------------------------

async function createOrganizationInDB(name: string, slug: string): Promise<string> {
  console.log(`🗄️  SUPABASE: Creant organització "${name}"...`);
  const { data, error } = await supabase
    .from('organizations')
    .insert([{ name, slug, created_at: new Date().toISOString() }])
    .select('id')
    .single();

  if (error) throw new Error(`Error Supabase: ${error.message}`);
  console.log(`   ✅ ID: ${data.id}`);
  return data.id;
}

async function cloneRepository(newRepoName: string): Promise<number> {
  console.log(`🏭 GITHUB: Clonant template a ${ENV.TARGET_ORG}/${newRepoName}...`);
  const response = await octokit.repos.createUsingTemplate({
    template_owner: ENV.TEMPLATE_OWNER,
    template_repo: ENV.TEMPLATE_REPO,
    owner: ENV.TARGET_ORG,
    name: newRepoName,
    private: false, 
    description: 'Web generada automàticament per DigitAI Factory',
    include_all_branches: false
  });
  
  console.log(`   ✅ Clonat (ID: ${response.data.id})`);
  return response.data.id;
}

// 🧠 MOCK DATA (Simulem el que faria la IA)
const MOCK_AI_CONTENT = {
    hero: {
        title: "Somriures que canvien vides",
        subtitle: "Clínica dental especialitzada en ortodòncia invisible i implants d'última generació.",
        cta: "Reserva Cita"
    },
    about: {
        title: "Més que dentistes",
        description: "Amb més de 20 anys d'experiència, cuidem de la salut bucal de tota la família amb tecnologia indolora.",
        stats: [
            { label: "Pacients", value: "15k+" },
            { label: "Anys", value: "20" }
        ]
    },
    services_intro: {
        title: "Tractaments Destacats",
        subtitle: "Tecnologia punta al servei del teu somriure.",
        items: [
            { title: "Ortodòncia Invisible", description: "Alineadors transparents per a nens i adults." },
            { title: "Implants", description: "Recupera la teva dentadura en un sol dia." },
            { title: "Estètica", description: "Blanquejament i carilles de porcellana." }
        ]
    }
};

// ⚙️ CONFIG GENERATOR ACTUALITZAT
function generateClientConfig(clientName: string, orgId: string): string {
  const year = new Date().getFullYear();
  
  // Injectem el contingut simulat (MOCK_AI_CONTENT)
  const contentJson = JSON.stringify(MOCK_AI_CONTENT, null, 2);

  return `
import { MasterConfig } from '@/types/config';

export const CONFIG: MasterConfig = {
  organizationId: "${orgId}",
  identity: {
    name: "${clientName}",
    description: "Web oficial de ${clientName}",
    logoUrl: "/branding/logo.png",
    faviconUrl: "/favicon.ico",
    contactEmail: "info@clinicadental.test",
    address: "Carrer Major 123, Barcelona"
  },
  branding: {
    colors: {
      primary: "#0ea5e9", // Sky Blue
      secondary: "#0284c7",
      background: "#ffffff",
      foreground: "#0f172a",
    },
    radius: 0.75,
  },
  // 👇 AQUI INJECTEM EL CONTINGUT QUE FALTAVA
  content: ${contentJson},

  modules: {
    layout: { variant: 'modern', stickyHeader: true },
    landing: { 
        active: true, 
        // 👇 Assegura't que les seccions coincideixen amb el contingut que hem posat
        sections: ['hero', 'stats', 'about', 'services', 'contact'] 
    },
    auth: { active: true, allowPublicRegistration: false, redirects: { admin: '/dashboard', client: '/my-account' } },
    dashboard: true, 
    booking: true, 
    ecommerce: true, 
    blog: true, 
    inventory: false, 
    accessControl: true,
    chatbot: true
  },
  i18n: { locales: ['ca', 'es'], defaultLocale: 'ca' },
  footer: {
    columns: [
        {
            title: "Clínica",
            links: [{ label: "Serveis", href: "/#services"}, { label: "Equip", href: "/#about"}]
        }
    ],
    socials: { instagram: "https://instagram.com/test" },
    bottomText: "© ${year} ${clientName}. Powered by DigitAI."
  }
};
`;
}

async function injectConfiguration(repoName: string, configContent: string) {
  console.log(`💉 GITHUB: Injectant configuració personalitzada...`);
  const FILE_PATH = 'src/config/digitai.config.ts';
  let currentSha: string | undefined;
  let fileReady = false;

  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      if (attempt === 1) await wait(2000);
      const { data } = await octokit.repos.getContent({ owner: ENV.TARGET_ORG, repo: repoName, path: FILE_PATH });
      if (!Array.isArray(data) && data.sha) {
        currentSha = data.sha;
        fileReady = true;
        break;
      }
    } catch (error) {
      const err = error as ApiError;
      if (err.status === 404) await wait(3000); 
      else throw error;
    }
  }

  if (!fileReady) throw new Error('TIMEOUT: El repositori no està llest per rebre fitxers.');

  await octokit.repos.createOrUpdateFileContents({
    owner: ENV.TARGET_ORG, repo: repoName, path: FILE_PATH,
    message: '⚙️ Setup: Injecció de configuració automàtica',
    content: Buffer.from(configContent).toString('base64'),
    sha: currentSha,
    committer: { name: 'DigitAI Bot', email: 'bot@digitai.studios' }
  });
  console.log(`   ✅ Configurada.`);
}

async function deployToVercel(repoName: string, orgId: string) {
  console.log(`🚀 VERCEL: Creant projecte i assignant entorn...`);
  const productionUrl = `https://${repoName}.vercel.app`;

  const envVars = {
    NEXT_PUBLIC_ORG_ID: orgId,
    NEXT_PUBLIC_APP_URL: productionUrl,
    NEXT_PUBLIC_SITE_URL: productionUrl,
    NEXT_PUBLIC_SUPABASE_URL: ENV.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ENV.SUPABASE_ANON,
  };

  const response = await fetch('https://api.vercel.com/v9/projects', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ENV.VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: repoName,
      framework: 'nextjs',
      gitRepository: { type: 'github', repo: `${ENV.TARGET_ORG}/${repoName}` },
      environmentVariables: Object.entries(envVars).map(([key, value]) => ({
        key, value, target: ['production', 'preview', 'development'], type: 'encrypted'
      })),
    }),
  });
  
  const data = await response.json();
  if (!response.ok && data.error?.code !== 'project_already_exists') {
      throw new Error(`Error Vercel Create: ${data.error?.message}`);
  }
  
  console.log(`   ✅ Projecte Vercel vinculat!`);
  return data;
}

async function triggerVercelDeployment(repoName: string, repoId: number) {
  console.log(`⚡ VERCEL: Forçant primer desplegament...`);
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ENV.VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: repoName,
      gitSource: { type: 'github', repoId: repoId, ref: 'main' },
      projectSettings: { framework: 'nextjs' }
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error Vercel Deploy: ${data.error?.message}`);
  
  console.log(`   🚀 DESPLEGAMENT EN CAMÍ!`);
  console.log(`   🌍 URL Final: https://${repoName}.vercel.app`);
}

// ------------------------------------------------------------------
// 4. EXECUCIÓ PRINCIPAL
// ------------------------------------------------------------------

async function main() {
  const CLIENT_NAME = "Clínica Dental Test Final";
  const repoSlug = CLIENT_NAME.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const NEW_REPO_NAME = `${repoSlug}-${Math.floor(Math.random() * 1000)}`;

  console.log(`\n🏭 INICIANT DIGITAI FACTORY TEST (AMB CONTINGUT)`);
  console.log(`   Target: ${NEW_REPO_NAME}\n`);

  try {
    const orgId = await createOrganizationInDB(CLIENT_NAME, NEW_REPO_NAME);
    const githubRepoId = await cloneRepository(NEW_REPO_NAME);
    
    // Injectem la config bona
    await injectConfiguration(NEW_REPO_NAME, generateClientConfig(CLIENT_NAME, orgId));
    
    await deployToVercel(NEW_REPO_NAME, orgId);
    await triggerVercelDeployment(NEW_REPO_NAME, githubRepoId);

    console.log(`\n🎉 TOT CORRECTE! Comprova la URL en uns minuts.\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', getErrorMessage(error));
  }
}

main();