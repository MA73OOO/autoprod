import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de .env o .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('\n🔍 [Harness] Verificando variables de entorno requeridas...');

const REQUIRED_VARS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const missing: string[] = [];

for (const v of REQUIRED_VARS) {
  if (!process.env[v] || process.env[v]?.trim() === '') {
    missing.push(v);
  }
}

if (missing.length > 0) {
  console.error('\n❌ [ERROR] Faltan las siguientes variables de entorno requeridas:');
  missing.forEach((m) => console.error(`   - ${m}`));
  console.log('\nPor favor configúralas en tu archivo .env o .env.local\n');
  process.exit(1);
} else {
  console.log('✅ [OK] Todas las variables de entorno principales están configuradas correctamente.\n');
  process.exit(0);
}
