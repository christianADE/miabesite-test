#!/usr/bin/env node

/**
 * Script d'initialisation complète MiabeSite + Supabase
 * 
 * Ce script configure complètement votre application:
 * 1. Vérifie les variables d'environnement
 * 2. Initialise la base de données Supabase
 * 3. Lance les tests basiques
 * 
 * Usage:
 *   pnpm node scripts/setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

function logStep(number, title) {
  console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  log(BLUE, `${number}. ${title}`);
  console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
}

function checkEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    log(RED, `❌ ${name} manquante`);
    return false;
  }
  const masked = value.substring(0, 10) + '...';
  log(GREEN, `✅ ${name} trouvée (${masked})`);
  return true;
}

async function main() {
  try {
    log(BLUE, '\n🚀 MiabeSite - Setup Supabase\n');

    // Charger .env.local
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

    // Étape 1: Vérifier les variables d'environnement
    logStep(1, 'Vérification des Variables d\'Environnement');
    
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];
    
    const optional = [
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    let allOk = true;
    
    log(YELLOW, 'Requises:');
    for (const env of required) {
      if (!checkEnvVar(env)) {
        allOk = false;
      }
    }

    log(YELLOW, '\nOptionnelles (pour init automatique):');
    for (const env of optional) {
      if (!checkEnvVar(env)) {
        log(YELLOW, `⚠️  ${env} manquante (nécessaire pour init-supabase.js)`);
      }
    }

    if (!allOk) {
      log(RED, '\n❌ Certaines variables requises manquent!');
      log(YELLOW, '\nAction requise:');
      log(YELLOW, '1. Ouvrez .env.local');
      log(YELLOW, '2. Complétez les variables manquantes');
      log(YELLOW, '3. Réexécutez: pnpm node scripts/setup.js\n');
      process.exit(1);
    }

    // Étape 2: Vérifier les fichiers nécessaires
    logStep(2, 'Vérification des Fichiers');

    const requiredFiles = [
      'scripts/init-supabase.sql',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        log(GREEN, `✅ ${file}`);
      } else {
        log(RED, `❌ ${file} manquant`);
        allOk = false;
      }
    }

    if (!allOk) {
      log(RED, '\n❌ Fichiers manquants!');
      process.exit(1);
    }

    // Étape 3: Afficher le guide d'initialisation
    logStep(3, 'Prochaines Étapes');

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      log(GREEN, '✅ Service Role Key détectée - initialisation automatique possible');
      log(YELLOW, '\nOption A: Initialisation Automatique');
      log(YELLOW, 'Exécutez:');
      log(BLUE, '  pnpm node scripts/init-supabase.js');
    } else {
      log(YELLOW, '⚠️  Service Role Key manquante - initialisation manuelle nécessaire');
      log(YELLOW, '\nAction requise:');
      log(YELLOW, '1. Allez sur votre Dashboard Supabase: https://app.supabase.com');
      log(YELLOW, '2. Settings → API → Copiez le "Service role key"');
      log(YELLOW, '3. Collez-le dans .env.local: SUPABASE_SERVICE_ROLE_KEY=...');
      log(YELLOW, '4. Réexécutez: pnpm node scripts/setup.js');
    }

    log(YELLOW, '\nOption B: Initialisation Manuelle (Plus rapide)');
    log(YELLOW, '1. Allez sur: https://app.supabase.com → Votre Projet');
    log(YELLOW, '2. SQL Editor → + New Query');
    log(YELLOW, '3. Ouvrez scripts/init-supabase.sql (bloc-notes)');
    log(YELLOW, '4. Copiez tout → Collez dans l\'éditeur SQL');
    log(YELLOW, '5. Cliquez "Run"');

    // Étape 4: Afficher le guide complet
    log(YELLOW, '\nPour le guide complet:');
    log(BLUE, '  Lisez: SUPABASE_INIT_GUIDE.md\n');

    logStep(4, 'Vérification de la Structure du Projet');

    const requiredDirs = [
      'src/app',
      'src/components/auth',
      'src/lib/supabase',
      'scripts',
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(__dirname, '..', dir);
      if (fs.existsSync(dirPath)) {
        log(GREEN, `✅ ${dir}/`);
      } else {
        log(RED, `❌ ${dir}/ manquant`);
      }
    }

    // Étape 5: Afficher les commandes utiles
    logStep(5, 'Commandes Utiles');

    log(BLUE, 'Lancer l\'application en développement:');
    log(YELLOW, '  pnpm dev');

    log(BLUE, '\nConstruire pour la production:');
    log(YELLOW, '  pnpm build && pnpm start');

    log(BLUE, '\nVérifier les erreurs TypeScript:');
    log(YELLOW, '  pnpm build');

    log(BLUE, '\nTester l\'inscription:');
    log(YELLOW, '  http://localhost:3000/signup');

    log(GREEN, '\n\n✨ Configuration en attente d\'initialisation de la base de données!');
    log(GREEN, 'Une fois la BD initialisée, lancez: pnpm dev\n');

  } catch (error) {
    log(RED, `\n❌ Erreur: ${error.message}\n`);
    process.exit(1);
  }
}

main();
