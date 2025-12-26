// Script to check template prompt lengths
// Run with: node scripts/check-prompt-lengths.js

import { MOCK_TEMPLATES } from '../lib/data/templates.js';

console.log('🔍 Checking Template Prompt Lengths\n');
console.log('=' .repeat(80));

const SAFE_LIMIT = 700;  // Safe limit for prompts (before URL encoding)
const WARNING_LIMIT = 1000; // Warning limit
const MAX_LIMIT = 1500; // Absolute max (from pollinations.tsx)

let warnings = [];
let errors = [];

MOCK_TEMPLATES.forEach((template, index) => {
  const promptLength = template.prompt ? template.prompt.length : 0;
  const status = 
    promptLength > MAX_LIMIT ? '❌ TOO LONG' :
    promptLength > WARNING_LIMIT ? '⚠️  WARNING' :
    promptLength > SAFE_LIMIT ? '⚡ CAUTION' :
    '✅ OK';
  
  console.log(`${index + 1}. ${template.title}`);
  console.log(`   ID: ${template.id}`);
  console.log(`   Category: ${template.category}`);
  console.log(`   Prompt length: ${promptLength} chars ${status}`);
  
  if (promptLength > MAX_LIMIT) {
    errors.push({
      template: template.title,
      id: template.id,
      length: promptLength,
      category: template.category
    });
  } else if (promptLength > WARNING_LIMIT) {
    warnings.push({
      template: template.title,
      id: template.id,
      length: promptLength,
      category: template.category
    });
  }
  
  console.log('');
});

console.log('=' .repeat(80));
console.log('\n📊 Summary\n');
console.log(`Total templates: ${MOCK_TEMPLATES.length}`);
console.log(`Safe (< ${SAFE_LIMIT} chars): ${MOCK_TEMPLATES.filter(t => t.prompt?.length < SAFE_LIMIT).length}`);
console.log(`Caution (${SAFE_LIMIT}-${WARNING_LIMIT} chars): ${MOCK_TEMPLATES.filter(t => t.prompt?.length >= SAFE_LIMIT && t.prompt?.length < WARNING_LIMIT).length}`);
console.log(`Warning (${WARNING_LIMIT}-${MAX_LIMIT} chars): ${warnings.length}`);
console.log(`Error (> ${MAX_LIMIT} chars): ${errors.length}`);

if (errors.length > 0) {
  console.log('\n❌ ERRORS - These templates will fail:\n');
  errors.forEach(e => {
    console.log(`  • ${e.template} (${e.id})`);
    console.log(`    ${e.length} chars - EXCEEDS ${MAX_LIMIT} char limit!`);
    console.log(`    Fix: Reduce prompt by ${e.length - SAFE_LIMIT} chars\n`);
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS - These templates are close to the limit:\n');
  warnings.forEach(w => {
    console.log(`  • ${w.template} (${w.id})`);
    console.log(`    ${w.length} chars - Consider reducing\n`);
  });
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All templates have safe prompt lengths!\n');
} else {
  console.log('\n💡 Recommendations:');
  console.log('  1. Keep prompts under 700 chars for safety');
  console.log('  2. Use concise language and bullet points');
  console.log('  3. Avoid repetition and unnecessary words');
  console.log('  4. Test prompts after modifications\n');
}
