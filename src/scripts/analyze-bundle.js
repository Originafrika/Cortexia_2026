/**
 * BUNDLE ANALYZER - Analyze bundle size and composition
 * 
 * Run with: node scripts/analyze-bundle.js
 * 
 * This script analyzes the production build and generates a report.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

async function analyzeBuild() {
  log('\n🔍 Starting Bundle Analysis...\n', 'bright');

  // Check if dist folder exists
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    log('❌ Error: dist folder not found. Run "npm run build" first.', 'red');
    process.exit(1);
  }

  // Analyze files
  const stats = {
    js: { files: [], totalSize: 0 },
    css: { files: [], totalSize: 0 },
    images: { files: [], totalSize: 0 },
    other: { files: [], totalSize: 0 },
  };

  function analyzeDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        analyzeDir(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        const size = stat.size;
        const relativePath = path.relative(distPath, filePath);

        const fileInfo = { path: relativePath, size };

        if (ext === '.js') {
          stats.js.files.push(fileInfo);
          stats.js.totalSize += size;
        } else if (ext === '.css') {
          stats.css.files.push(fileInfo);
          stats.css.totalSize += size;
        } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
          stats.images.files.push(fileInfo);
          stats.images.totalSize += size;
        } else {
          stats.other.files.push(fileInfo);
          stats.other.totalSize += size;
        }
      }
    });
  }

  analyzeDir(distPath);

  // Sort files by size
  Object.keys(stats).forEach((key) => {
    stats[key].files.sort((a, b) => b.size - a.size);
  });

  // Display results
  log('📦 Bundle Size Analysis\n', 'cyan');
  log('=' .repeat(70), 'cyan');

  // Total size
  const totalSize =
    stats.js.totalSize +
    stats.css.totalSize +
    stats.images.totalSize +
    stats.other.totalSize;

  log(`\n📊 Total Bundle Size: ${formatBytes(totalSize)}`, 'bright');

  // JavaScript files
  log(`\n📜 JavaScript Files (${stats.js.files.length} files)`, 'yellow');
  log(`   Total: ${formatBytes(stats.js.totalSize)}`, 'yellow');
  stats.js.files.slice(0, 10).forEach((file) => {
    const color = file.size > 100000 ? 'red' : file.size > 50000 ? 'yellow' : 'green';
    log(`   ${formatBytes(file.size).padEnd(12)} - ${file.path}`, color);
  });
  if (stats.js.files.length > 10) {
    log(`   ... and ${stats.js.files.length - 10} more files`, 'cyan');
  }

  // CSS files
  log(`\n🎨 CSS Files (${stats.css.files.length} files)`, 'yellow');
  log(`   Total: ${formatBytes(stats.css.totalSize)}`, 'yellow');
  stats.css.files.forEach((file) => {
    log(`   ${formatBytes(file.size).padEnd(12)} - ${file.path}`, 'green');
  });

  // Images
  log(`\n🖼️  Images (${stats.images.files.length} files)`, 'yellow');
  log(`   Total: ${formatBytes(stats.images.totalSize)}`, 'yellow');
  stats.images.files.slice(0, 5).forEach((file) => {
    const color = file.size > 100000 ? 'red' : file.size > 50000 ? 'yellow' : 'green';
    log(`   ${formatBytes(file.size).padEnd(12)} - ${file.path}`, color);
  });
  if (stats.images.files.length > 5) {
    log(`   ... and ${stats.images.files.length - 5} more files`, 'cyan');
  }

  // Recommendations
  log('\n💡 Recommendations\n', 'cyan');
  log('=' .repeat(70), 'cyan');

  const largeJsFiles = stats.js.files.filter((f) => f.size > 200000);
  if (largeJsFiles.length > 0) {
    log('⚠️  Large JavaScript files detected:', 'yellow');
    largeJsFiles.forEach((file) => {
      log(`   ${formatBytes(file.size)} - ${file.path}`, 'yellow');
    });
    log('   Consider code splitting or lazy loading for these files.\n', 'yellow');
  }

  const largeImages = stats.images.files.filter((f) => f.size > 100000);
  if (largeImages.length > 0) {
    log('⚠️  Large images detected:', 'yellow');
    largeImages.forEach((file) => {
      log(`   ${formatBytes(file.size)} - ${file.path}`, 'yellow');
    });
    log('   Consider compressing or using next-gen formats (WebP/AVIF).\n', 'yellow');
  }

  // Success metrics
  log('\n✅ Success Metrics\n', 'green');
  const initialJs = stats.js.files.find((f) => f.path.includes('index'));
  if (initialJs) {
    const isGood = initialJs.size < 500000; // 500KB threshold
    log(
      `   Initial JS Bundle: ${formatBytes(initialJs.size)} ${isGood ? '✅' : '❌'}`,
      isGood ? 'green' : 'red'
    );
  }

  const isGoodTotal = totalSize < 2000000; // 2MB threshold
  log(
    `   Total Bundle Size: ${formatBytes(totalSize)} ${isGoodTotal ? '✅' : '❌'}`,
    isGoodTotal ? 'green' : 'red'
  );

  log('\n' + '='.repeat(70) + '\n', 'cyan');
}

analyzeBuild().catch((err) => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
