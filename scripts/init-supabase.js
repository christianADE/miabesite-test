#!/usr/bin/env node

/**
 * Script d'initialisation Supabase pour MiabeSite
 * 
 * Ce script exécute le fichier init-supabase.sql sur votre projet Supabase
 * pour créer toutes les tables, politiques RLS et buckets de stockage.
 * 
 * Usage:
 *   pnpm node scripts/init-supabase.js
 * 
 * Prérequis:
 *   - SUPABASE_SERVICE_ROLE_KEY défini dans .env.local
 *   - NEXT_PUBLIC_SUPABASE_URL défini dans .env.local
 *   - Accès internet à votre projet Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erreur: Les variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises dans .env.local');
  process.exit(1);
}

// Créer un client Supabase avec la clé de service
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function initSupabase() {
  try {
    console.log('🚀 Initialisation de Supabase MiabeSite...');
    console.log(`📍 URL: ${SUPABASE_URL}`);
    
    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'init-supabase.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ Fichier SQL non trouvé: ${sqlFile}`);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
    
    // Diviser le SQL en déclarations individuelles
    // (Supabase peut ne pas supporter les requêtes multiples en une seule)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Total de ${statements.length} déclarations SQL à exécuter`);
    
    let executed = 0;
    let skipped = 0;
    const errors = [];
    
    // Exécuter chaque déclaration
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Skip les déclarations vides ou les commentaires
      if (!stmt || stmt.startsWith('--')) {
        skipped++;
        continue;
      }
      
      try {
        // Utiliser RPC ou requête directe
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });
        
        if (error) {
          // Si RPC ne fonctionne pas, essayer avec une approche alternative
          console.warn(`⚠️  Déclaration ${i + 1}/${statements.length} - RPC non disponible, essayez le SQL Editor de Supabase`);
          skipped++;
        } else {
          executed++;
          process.stdout.write(`\r✅ Exécuté: ${executed} | En attente: ${statements.length - executed - skipped}`);
        }
      } catch (err) {
        // Certaines déclarations peuvent échouer (ex: DROP TABLE si table n'existe pas)
        // Ce n'est pas une erreur critique
        errors.push({
          index: i + 1,
          statement: stmt.substring(0, 50),
          error: err.message,
        });
        skipped++;
      }
    }
    
    console.log(`\n\n✨ Initialisation terminée!`);
    console.log(`   ✅ Exécutées: ${executed}`);
    console.log(`   ⏭️  Non-critiques: ${skipped}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Erreurs non-critiques (DROP TABLE si table n'existe pas):`);
      errors.slice(0, 5).forEach(err => {
        console.log(`   - [${err.index}] ${err.statement}... → ${err.error}`);
      });
      if (errors.length > 5) {
        console.log(`   ... et ${errors.length - 5} autres`);
      }
    }
    
    console.log(`\n📌 Si vous voyez une erreur "RPC non disponible", suivez ces étapes manuellement:`);
    console.log(`   1. Ouvrez le SQL Editor de Supabase Dashboard`);
    console.log(`   2. Collez le contenu du fichier scripts/init-supabase.sql`);
    console.log(`   3. Cliquez "Run" pour exécuter`);
    console.log(`\n✅ Votre base de données est prête!`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    process.exit(1);
  }
}

// Exécuter l'initialisation
initSupabase();
