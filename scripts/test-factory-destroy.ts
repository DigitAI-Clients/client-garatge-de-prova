import { Octokit } from '@octokit/rest';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// ------------------------------------------------------------------
// 1. CONFIGURACIÓ
// ------------------------------------------------------------------
const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const TARGET_ORG = process.env.GITHUB_TARGET_ORG;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (!GITHUB_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !VERCEL_TOKEN) {
  console.error('❌ Error: Falten variables d\'entorn per destruir.');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// DEFINICIÓ D'ERRORS (Per evitar 'any')
interface ApiError { status?: number; message?: string; }

// ------------------------------------------------------------------
// 2. OBTENCIÓ DEL NOM (Argument de la Terminal)
// ------------------------------------------------------------------

// process.argv[2] agafa el que escrius després de la comanda
// Ex: npx tsx script.ts NOM-DEL-REPO
const repoName = process.argv[2];

if (!repoName) {
  console.error('\n⚠️  ALERTA DE SEGURETAT: Falta el nom.');
  console.error('   Has d\'especificar quin repositori vols destruir.');
  console.error('   Exemple: npx tsx scripts/test-factory-destroy.ts cl-nica-dental-prova-9575\n');
  process.exit(1);
}

// ------------------------------------------------------------------
// 3. FUNCIONS DE DESTRUCCIÓ
// ------------------------------------------------------------------

async function destroyVercel(name: string) {
  console.log(`🔥 VERCEL: Buscant projecte "${name}"...`);

  const getRes = await fetch(`https://api.vercel.com/v9/projects/${name}`, {
    headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
  });

  if (getRes.status === 404) {
    console.log('   🔸 El projecte no existeix a Vercel.');
    return;
  }

  const project = await getRes.json();

  const delRes = await fetch(`https://api.vercel.com/v9/projects/${project.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
  });

  if (delRes.ok) console.log('   ✅ Projecte Vercel eliminat.');
  else console.error('   ❌ Error esborrant Vercel:', await delRes.text());
}

async function destroyGitHub(name: string) {
  console.log(`🔥 GITHUB: Buscant repo "${TARGET_ORG}/${name}"...`);
  try {
    await octokit.repos.delete({
      owner: TARGET_ORG!,
      repo: name
    });
    console.log('   ✅ Repositori GitHub eliminat.');
  } catch (error: unknown) {
    // 🛡️ Type Assertion segur
    const e = error as ApiError;
    if (e.status === 404) console.log('   🔸 El repo no existeix a GitHub.');
    else console.error('   ❌ Error GitHub:', e.message);
  }
}

async function destroySupabase(slug: string) {
  console.log(`🔥 SUPABASE: Buscant organització "${slug}"...`);

  // 1. Trobem l'Organització
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!org) {
    console.log("   ⚠️ No s'ha trobat l'organització a Supabase. Res a fer.");
    return;
  }

  const orgId = org.id;
  console.log(`   🎯 Organització trobada: ${orgId}`);

  // 2. NETEJA EN CASCADA (Ordre Crític: De més específic a més general)
  // Primer els items, després les comandes/reserves, després els productes/serveis
  const dependentTables = [
    'order_items', // Fills de comandes
    'orders',      // Comandes (té FK a organization)
    'bookings',    // Reserves
    'services',    // Serveis

    'products',    // Productes
    'posts',       // Blog

    'profiles',    // Usuaris/Staff
    'projects'     // Projectes de la Fàbrica
  ];

  for (const table of dependentTables) {
    // Intentem esborrar. Si la taula no existeix o està buida, no passa res.
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('organization_id', orgId);

    if (error) {
      // Ignorem errors de "taula no existeix" però avisem d'altres
      console.warn(`   ⚠️  Error netejant '${table}': ${error.message}`);
    } else {
      console.log(`   ✅ Taula '${table}' netejada.`);
    }
  }

  // 3. FINALMENT: ESBORREM EL PARE (L'Organització)
  const { error: orgError } = await supabase
    .from('organizations')
    .delete()
    .eq('id', orgId);

  if (orgError) {
    console.error(`   ❌ Error Fatal Supabase: ${orgError.message}`);
  } else {
    console.log(`   💀 Organització eliminada definitivament.`);
  }
}

// ------------------------------------------------------------------
// 4. CONFIRMACIÓ DE SEGURETAT (Doble Check)
// ------------------------------------------------------------------

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log(`\n🚨 ZONA DE PERILL 🚨`);
console.log(`Estàs a punt d'ELIMINAR PER SEMPRE el client: "${repoName}"`);
console.log(`Això esborrarà: DB, GitHub i Vercel.`);

rl.question('\nEstàs segur? Escriu "SI" (en majúscules) per confirmar: ', async (answer) => {
  if (answer === 'SI') {
    console.log('\n🗑️  INICIANT DESTRUCCIÓ...\n');
    try {
      await destroyVercel(repoName);
      await destroyGitHub(repoName);
      await destroySupabase(repoName);
      console.log('\n💀 NETEJA COMPLETADA. Client eliminat.');
    } catch (e) {
      console.error(e);
    }
  } else {
    console.log('\n🛡️  Operació cancel·lada. No s\'ha tocat res.');
  }
  rl.close();
  process.exit(0);
});