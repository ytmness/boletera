#!/usr/bin/env node

/**
 * Script de Diagnóstico de Conexión Supabase
 * 
 * Uso: node diagnostico-conexion.js
 */

const { PrismaClient } = require('@prisma/client');
const https = require('https');

console.log('🔍 Iniciando diagnóstico de conexión...\n');

// 1. Verificar variables de entorno
console.log('📋 PASO 1: Verificando variables de entorno');
console.log('─'.repeat(50));

const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

let hasAllEnvVars = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Ocultar password
    const displayValue = varName.includes('URL') 
      ? value.replace(/:[^@]+@/, ':****@')
      : value.substring(0, 20) + '...';
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NO DEFINIDA`);
    hasAllEnvVars = false;
  }
});

console.log('');

if (!hasAllEnvVars) {
  console.log('❌ Faltan variables de entorno en .env.local\n');
  console.log('Crea un archivo .env.local con:');
  console.log('DATABASE_URL="postgresql://..."');
  console.log('DIRECT_URL="postgresql://..."');
  console.log('NEXT_PUBLIC_SUPABASE_URL="https://..."');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."');
  process.exit(1);
}

// 2. Verificar URL de Supabase
console.log('📋 PASO 2: Verificando URL de Supabase');
console.log('─'.repeat(50));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  const url = new URL(supabaseUrl);
  console.log(`🌐 Host: ${url.host}`);
  
  // Ping a Supabase
  https.get(supabaseUrl, (res) => {
    if (res.statusCode === 200 || res.statusCode === 404) {
      console.log('✅ Supabase URL es accesible');
    } else {
      console.log(`⚠️  Supabase respondió con código: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.log(`❌ Error al conectar a Supabase: ${err.message}`);
  });
}

console.log('');

// 3. Analizar DATABASE_URL
console.log('📋 PASO 3: Analizando DATABASE_URL');
console.log('─'.repeat(50));

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    console.log(`🌐 Host: ${url.hostname}`);
    console.log(`🔌 Puerto: ${url.port || '5432'}`);
    console.log(`👤 Usuario: ${url.username}`);
    console.log(`🔒 Password: ${url.password ? '****' : 'NO DEFINIDO'}`);
    console.log(`📊 Database: ${url.pathname.slice(1)}`);
    console.log(`⚙️  Parámetros: ${url.search || 'ninguno'}`);
    
    // Verificaciones
    if (!url.password || url.password === '[YOUR-PASSWORD]') {
      console.log('\n❌ ERROR: La contraseña no está configurada');
      console.log('   Reemplaza [YOUR-PASSWORD] con tu contraseña real de Supabase');
    }
    
    if (!url.search.includes('sslmode') && !url.search.includes('pgbouncer')) {
      console.log('\n⚠️  ADVERTENCIA: Falta configuración SSL o pgbouncer');
      console.log('   Agrega ?sslmode=require o usa connection pooler');
    }
    
    if (url.port === '6543') {
      console.log('\n✅ Usando connection pooler (recomendado)');
    } else if (url.port === '5432') {
      console.log('\n⚠️  Usando conexión directa (puede tener límites)');
    }
  } catch (error) {
    console.log(`❌ DATABASE_URL inválida: ${error.message}`);
  }
}

console.log('');

// 4. Intentar conexión con Prisma
console.log('📋 PASO 4: Intentando conexión con Prisma');
console.log('─'.repeat(50));

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testPrismaConnection() {
  try {
    console.log('⏳ Conectando a la base de datos...');
    
    await prisma.$connect();
    console.log('✅ Conexión exitosa con Prisma!');
    
    // Intentar una query simple
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Query exitosa!');
    console.log(`📊 PostgreSQL version: ${result[0].version.split(' ').slice(0, 2).join(' ')}`);
    
    // Verificar si hay tablas
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    
    console.log(`\n📦 Tablas encontradas: ${tables.length}`);
    if (tables.length === 0) {
      console.log('⚠️  No hay tablas. Ejecuta: npx prisma db push');
    } else {
      tables.forEach(t => console.log(`   - ${t.tablename}`));
    }
    
  } catch (error) {
    console.log('❌ Error de conexión con Prisma:');
    console.log(`   Código: ${error.code || 'N/A'}`);
    console.log(`   Mensaje: ${error.message}`);
    
    // Diagnóstico específico
    if (error.code === 'P1001') {
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('   El error P1001 significa que Prisma no puede alcanzar el servidor.');
      console.log('   Posibles causas:');
      console.log('   1. La contraseña es incorrecta');
      console.log('   2. El proyecto Supabase está pausado');
      console.log('   3. La URL tiene un typo');
      console.log('   4. Firewall bloqueando la conexión');
      console.log('\n   Soluciones:');
      console.log('   1. Ve a Supabase > Settings > Database');
      console.log('   2. Reset database password');
      console.log('   3. Copia la nueva contraseña');
      console.log('   4. Actualiza .env.local');
      console.log('   5. Reinicia la terminal');
    } else if (error.code === 'P1002') {
      console.log('\n🔍 DIAGNÓSTICO:');
      console.log('   El servidor rechazó la conexión.');
      console.log('   Verifica que el proyecto Supabase esté activo.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection().then(() => {
  console.log('\n' + '═'.repeat(50));
  console.log('✅ Diagnóstico completado');
  console.log('═'.repeat(50));
}).catch(err => {
  console.error('\n❌ Error inesperado:', err);
  process.exit(1);
});
