import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 1. On som?
const currentDir = process.cwd();
console.log('📍 Directori de treball (CWD):', currentDir);

// 2. Busquem el fitxer explícitament
const envPath = path.join(currentDir, '.env');
console.log('🔎 Buscant .env a:', envPath);

if (fs.existsSync(envPath)) {
  console.log('✅ Fitxer EXISTEIX.');
  
  // 3. Llegim el contingut en cru (sense mostrar secrets)
  const rawContent = fs.readFileSync(envPath, 'utf-8');
  console.log(`📄 Mida del fitxer: ${rawContent.length} bytes`);
  
  // 4. Intentem carregar-lo
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('❌ Error de parseig:', result.error);
  } else {
    console.log('✅ Dotenv ha carregat les variables.');
    console.log('------------------------------------------------');
    console.log('GITHUB_ACCESS_TOKEN:', process.env.GITHUB_ACCESS_TOKEN ? '✅ CARREGAT' : '❌ BUIT');
    console.log('GITHUB_TARGET_ORG:', process.env.GITHUB_TARGET_ORG ? '✅ CARREGAT' : '❌ BUIT');
  }

} else {
  console.error('❌ EL FITXER .env NO EXISTEIX EN AQUESTA RUTA.');
  console.log('📂 Fitxers que SÍ que veig aquí:');
  console.log(fs.readdirSync(currentDir));
}