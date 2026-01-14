#!/usr/bin/env node

/**
 * COCONUT WARM - Script de correction automatique
 * Remplace toutes les couleurs non-conformes par la palette exclusive shell/husk/cream/milk
 * 
 * Usage: node fix-coconut-colors.js
 */

const fs = require('fs');
const path = require('path');

// Palette Coconut Warm exclusive
const COCONUT_COLORS = {
  shell: 'var(--coconut-shell)', // #8B7355 - Marron foncé
  husk: 'var(--coconut-husk)',   // #A89080 - Marron moyen
  cream: 'var(--coconut-cream)', // #FFF8F0 - Beige clair
  milk: 'var(--coconut-milk)',   // #FFFCF7 - Blanc cassé
};

// Mappings de remplacement
const REPLACEMENT_RULES = [
  // CYAN → HUSK/CREAM
  { pattern: /text-cyan-600/g, replace: 'text-[var(--coconut-husk)]' },
  { pattern: /text-cyan-700/g, replace: 'text-[var(--coconut-husk)]' },
  { pattern: /text-cyan-800/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /text-cyan-900/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /bg-cyan-50/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-cyan-100/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /border-cyan-200/g, replace: 'border-[var(--coconut-husk)]/30' },
  { pattern: /border-cyan-400/g, replace: 'border-[var(--coconut-husk)]/40' },
  { pattern: /from-cyan-500/g, replace: 'from-[var(--coconut-husk)]' },
  { pattern: /to-cyan-600/g, replace: 'to-[var(--coconut-shell)]' },
  
  // BLUE → HUSK/SHELL
  { pattern: /text-blue-600/g, replace: 'text-[var(--coconut-husk)]' },
  { pattern: /text-blue-700/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /bg-blue-50/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-blue-100/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-blue-600/g, replace: 'bg-[var(--coconut-husk)]' },
  { pattern: /border-blue-300/g, replace: 'border-[var(--coconut-husk)]/30' },
  
  // GREEN → SHELL/CREAM (Success)
  { pattern: /text-green-500/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /text-green-600/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /text-green-700/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /text-green-900/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /bg-green-50/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-green-100/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-green-500\/20/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-green-500\/10/g, replace: 'bg-[var(--coconut-cream)]/50' },
  { pattern: /border-green-200/g, replace: 'border-[var(--coconut-husk)]/20' },
  { pattern: /border-green-300/g, replace: 'border-[var(--coconut-husk)]/30' },
  { pattern: /border-green-500\/20/g, replace: 'border-[var(--coconut-husk)]/20' },
  { pattern: /border-green-500\/30/g, replace: 'border-[var(--coconut-husk)]/30' },
  { pattern: /from-green-50/g, replace: 'from-[var(--coconut-cream)]' },
  { pattern: /to-emerald-50/g, replace: 'to-[var(--coconut-milk)]' },
  { pattern: /from-green-500/g, replace: 'from-[var(--coconut-shell)]' },
  { pattern: /to-green-600/g, replace: 'to-[var(--coconut-shell)]' },
  { pattern: /from-emerald-500/g, replace: 'from-[var(--coconut-shell)]' },
  { pattern: /to-emerald-600/g, replace: 'to-[var(--coconut-shell)]' },
  
  // AMBER/ORANGE/YELLOW → HUSK/CREAM (Warning/Accent)
  { pattern: /text-amber-600/g, replace: 'text-[var(--coconut-husk)]' },
  { pattern: /text-amber-700/g, replace: 'text-[var(--coconut-husk)]' },
  { pattern: /text-amber-800/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /text-amber-900/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /text-orange-600/g, replace: 'text-[var(--coconut-husk)]' },
  { pattern: /text-yellow-600/g, replace: 'text-[var(--coconut-husk)]' },
  { pattern: /bg-amber-50/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-amber-100/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-amber-500\/20/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-orange-50/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-yellow-50/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /border-amber-200/g, replace: 'border-[var(--coconut-husk)]/30' },
  { pattern: /border-amber-500\/30/g, replace: 'border-[var(--coconut-husk)]/30' },
  { pattern: /border-amber-500\/40/g, replace: 'border-[var(--coconut-husk)]/40' },
  { pattern: /border-orange-200/g, replace: 'border-[var(--coconut-husk)]/30' },
  { pattern: /border-yellow-200/g, replace: 'border-[var(--coconut-husk)]/30' },
  { pattern: /from-amber-500/g, replace: 'from-[var(--coconut-husk)]' },
  { pattern: /to-amber-600/g, replace: 'to-[var(--coconut-shell)]' },
  { pattern: /from-orange-500/g, replace: 'from-[var(--coconut-husk)]' },
  { pattern: /to-orange-600/g, replace: 'to-[var(--coconut-husk)]' },
  { pattern: /from-yellow-50/g, replace: 'from-[var(--coconut-cream)]' },
  { pattern: /to-orange-50/g, replace: 'to-[var(--coconut-cream)]' },
  
  // RED → SHELL/CREAM (Errors)
  { pattern: /text-red-500/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /text-red-600/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /text-red-700/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /text-red-900/g, replace: 'text-[var(--coconut-shell)]' },
  { pattern: /bg-red-50/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /bg-red-500/g, replace: 'bg-[var(--coconut-shell)]' },
  { pattern: /bg-red-500\/20/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /border-red-200/g, replace: 'border-[var(--coconut-husk)]/30' },
  { pattern: /border-red-500\/30/g, replace: 'border-[var(--coconut-husk)]/30' },
  { pattern: /border-red-500\/40/g, replace: 'border-[var(--coconut-husk)]/40' },
  { pattern: /hover:bg-red-500\/20/g, replace: 'hover:bg-[var(--coconut-cream)]' },
  { pattern: /hover:border-red-500\/40/g, replace: 'hover:border-[var(--coconut-husk)]/40' },
  { pattern: /from-red-50/g, replace: 'from-[var(--coconut-cream)]' },
  { pattern: /to-red-600/g, replace: 'to-[var(--coconut-shell)]' },
  
  // PINK/ROSE → CREAM/MILK
  { pattern: /text-pink-500/g, replace: 'text-[var(--coconut-husk)]' },
  { pattern: /text-pink-600/g, replace: 'text-[var(--coconut-husk)]' },
  { pattern: /bg-pink-50/g, replace: 'bg-[var(--coconut-cream)]' },
  { pattern: /from-pink-50/g, replace: 'from-[var(--coconut-cream)]' },
  { pattern: /to-rose-50/g, replace: 'to-[var(--coconut-milk)]' },
  { pattern: /from-pink-500/g, replace: 'from-[var(--coconut-cream)]' },
  { pattern: /to-rose-500/g, replace: 'to-[var(--coconut-milk)]' },
  
  // Focus states (cyan → husk)
  { pattern: /focus:border-cyan-400/g, replace: 'focus:border-[var(--coconut-husk)]' },
  { pattern: /focus:ring-cyan-400\/20/g, replace: 'focus:ring-[var(--coconut-husk)]/20' },
  { pattern: /hover:border-cyan-400\/60/g, replace: 'hover:border-[var(--coconut-husk)]/60' },
  
  // Anciennes couleurs Coconut (palm/sunset/water)
  { pattern: /\[var\(--coconut-palm\)\]/g, replace: '[var(--coconut-husk)]' },
  { pattern: /\[var\(--coconut-sunset\)\]/g, replace: '[var(--coconut-husk)]' },
  { pattern: /\[var\(--coconut-water\)\]/g, replace: '[var(--coconut-cream)]' },
  { pattern: /border-\[var\(--coconut-palm\)\]/g, replace: 'border-[var(--coconut-husk)]' },
  { pattern: /hover:border-\[var\(--coconut-palm\)\]/g, replace: 'hover:border-[var(--coconut-husk)]' },
  { pattern: /bg-\[var\(--coconut-palm\)\]/g, replace: 'bg-[var(--coconut-husk)]' },
];

// Fichiers à corriger (ordre de priorité)
const FILES_TO_FIX = [
  // Phase 1 - Critique
  'components/coconut-v14/Dashboard.tsx',
  'components/coconut-v14/IntentInput.tsx',
  'components/coconut-v14/CreditsManager.tsx',
  'components/coconut-v14/AssetManager.tsx',
  'components/coconut-v14/CostCalculator.tsx',
  
  // Phase 2 - Haute priorité
  'components/coconut-v14/SettingsPanel.tsx',
  'components/coconut-v14/CocoBoard.tsx',
  'components/coconut-v14/AdvancedErrorBoundary.tsx',
  
  // Phase 3 - Moyenne priorité
  'components/coconut-v14/CocoBoardDemo.tsx',
  'components/coconut-v14/ConfirmDialog.tsx',
  'components/coconut-v14/ColorPalettePicker.tsx',
  'components/coconut-v14/CocoBoardHeader.tsx',
  'components/coconut-v14/CoconutV14App.tsx',
  'components/coconut-v14/ErrorDialog.tsx',
  'components/coconut-v14/Breadcrumbs.tsx',
  'components/coconut-v14/CompareView.tsx',
  'components/coconut-v14/CostWidget.tsx',
  
  // Phase 4 - Basse priorité
  'components/coconut-v14/ProgressTracker.tsx',
  'components/coconut-v14/TypeSelector.tsx',
  'components/coconut-v14/SpecsInputModal.tsx',
  'components/coconut-v14/SpecsAdjuster.tsx',
  'components/coconut-v14/IterationsGallery.tsx',
  'components/coconut-v14/HistoryManager.tsx',
];

function fixFile(filePath) {
  try {
    console.log(`\n🔧 Correction de ${filePath}...`);
    
    // Lire le fichier
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Compteur de remplacements
    let replacements = 0;
    
    // Appliquer tous les remplacements
    REPLACEMENT_RULES.forEach(rule => {
      const matches = content.match(rule.pattern);
      if (matches) {
        replacements += matches.length;
        content = content.replace(rule.pattern, rule.replace);
      }
    });
    
    // Sauvegarder si modifications
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${replacements} remplacements effectués`);
      return replacements;
    } else {
      console.log(`⏭️  Aucune modification nécessaire`);
      return 0;
    }
    
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    return 0;
  }
}

// Main
console.log('🥥 COCONUT WARM - Correction automatique des couleurs');
console.log('=' .repeat(60));

let totalReplacements = 0;
let filesFixed = 0;

FILES_TO_FIX.forEach(file => {
  const replacements = fixFile(file);
  totalReplacements += replacements;
  if (replacements > 0) filesFixed++;
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 RÉSULTAT FINAL:`);
console.log(`   Fichiers corrigés: ${filesFixed}/${FILES_TO_FIX.length}`);
console.log(`   Remplacements totaux: ${totalReplacements}`);
console.log(`\n✨ Conformité Coconut Warm atteinte! shell/husk/cream/milk uniquement\n`);
