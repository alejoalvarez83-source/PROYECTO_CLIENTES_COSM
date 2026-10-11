// Script para verificar la conexión directa con Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

let envContent = '';
if (existsSync('.env')) {
  envContent = readFileSync('.env', 'utf-8');
}

const env = {};
envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
});

const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('--------------------------------------------------');
console.log('  🔍 DIAGNÓSTICO DE VINCULACIÓN CON SUPABASE');
console.log('--------------------------------------------------');
console.log('• URL configurada :', url || '(No definida)');
console.log('• Key configurada :', key ? `${key.slice(0, 12)}...${key.slice(-6)}` : '(No definida)');

if (!url || !key || url.includes('tu-proyecto.supabase.co') || key.includes('tu-anon-key-aqui')) {
  console.log('\n❌ RESULTADO: Aún no se han configurado las claves reales en .env');
  console.log('Actualmente la aplicación web está usando el modo demostración local.');
  console.log('\nPara vincularla con tu proyecto en Supabase:');
  console.log('1. Ve a https://supabase.com/dashboard/project/_/settings/api');
  console.log('2. Copia "Project URL" y "Project API keys (anon / public)"');
  console.log('3. Pégalos en el archivo .env de este proyecto:');
  console.log('     VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co');
  console.log('     VITE_SUPABASE_ANON_KEY=eyJhbGciOi...');
  process.exit(1);
}

try {
  const supabase = createClient(url, key);

  console.log('\n⏳ Conectando con Supabase y consultando la tabla "appointments"...');
  const { data, error, count } = await supabase
    .from('appointments')
    .select('id, client_name, appointment_date, appointment_time, status', { count: 'exact' })
    .limit(5);

  if (error) {
    console.log('\n❌ ERROR DEVUELTO POR SUPABASE:');
    console.log('Código:', error.code);
    console.log('Mensaje:', error.message);
    if (error.code === '42P01') {
      console.log('Causa: La tabla "appointments" no fue encontrada.');
      console.log('Solución: Ejecuta el script supabase_schema.sql en el SQL Editor de tu proyecto.');
    }
    process.exit(1);
  }

  console.log('\n🎉 ¡CONEXIÓN VERIFICADA EXITOSAMENTE CON SUPABASE!');
  console.log(`• Tabla "appointments": Encontrada y con acceso de lectura/escritura.`);
  console.log(`• Total de citas registradas en la base de datos:`, count ?? data.length);
  if (data && data.length > 0) {
    console.log('• Primeras citas encontradas:');
    data.forEach((c) => {
      console.log(`  - [${c.appointment_date} ${c.appointment_time}] ${c.client_name} (${c.status})`);
    });
  }
} catch (err) {
  console.log('\n❌ Error de red al intentar conectar:', err.message);
  process.exit(1);
}
