#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all required environment variables and dependencies are set up correctly
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Checking CareerRoad setup...\n');

let hasErrors = false;
let hasWarnings = false;

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Node.js version must be 18 or higher. Current:', nodeVersion);
  hasErrors = true;
} else {
  console.log('✅ Node.js version:', nodeVersion);
}

// Check if .env file exists
const envPath = join(__dirname, '.env');
if (!existsSync(envPath)) {
  console.warn('⚠️  .env file not found. Create one from .env.example');
  hasWarnings = true;
} else {
  console.log('✅ .env file exists');
  
  // Check required environment variables
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {
      DATABASE_URL: envContent.includes('DATABASE_URL=') && !envContent.includes('DATABASE_URL=your_'),
      GEMINI_API_KEY: envContent.includes('GEMINI_API_KEY=') && !envContent.includes('GEMINI_API_KEY=your_'),
      SESSION_SECRET: envContent.includes('SESSION_SECRET=') && !envContent.includes('SESSION_SECRET=your_'),
    };
    
    if (!envVars.DATABASE_URL) {
      console.error('❌ DATABASE_URL not set or using placeholder value');
      hasErrors = true;
    } else {
      console.log('✅ DATABASE_URL is set');
    }
    
    if (!envVars.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not set or using placeholder value');
      hasErrors = true;
    } else {
      console.log('✅ GEMINI_API_KEY is set');
    }
    
    if (!envVars.SESSION_SECRET) {
      console.warn('⚠️  SESSION_SECRET not set or using placeholder value');
      hasWarnings = true;
    } else {
      console.log('✅ SESSION_SECRET is set');
    }
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
    hasErrors = true;
  }
}

// Check if node_modules exists
const nodeModulesPath = join(__dirname, 'node_modules');
if (!existsSync(nodeModulesPath)) {
  console.error('❌ node_modules not found. Run: npm install');
  hasErrors = true;
} else {
  console.log('✅ Dependencies installed');
  
  // Check for cross-env (Windows compatibility)
  const crossEnvPath = join(nodeModulesPath, 'cross-env');
  if (!existsSync(crossEnvPath)) {
    console.warn('⚠️  cross-env not found. Install with: npm install --save-dev cross-env');
    hasWarnings = true;
  } else {
    console.log('✅ cross-env installed (Windows compatibility)');
  }
}

// Check if package.json exists
const packageJsonPath = join(__dirname, 'package.json');
if (!existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  hasErrors = true;
} else {
  console.log('✅ package.json exists');
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.error('\n❌ Setup incomplete. Please fix the errors above.');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  Setup complete with warnings. Review the warnings above.');
  console.log('\nNext steps:');
  console.log('  1. Run: npm run db:push');
  console.log('  2. Run: npm run dev');
  process.exit(0);
} else {
  console.log('\n✅ Setup looks good!');
  console.log('\nNext steps:');
  console.log('  1. Run: npm run db:push');
  console.log('  2. Run: npm run dev');
  process.exit(0);
}

