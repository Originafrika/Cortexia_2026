// Script to fix ALL imports with version suffixes (including scoped packages)
const fs = require('fs');
const path = require('path');

function fixImportsInDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixImportsInDir(fullPath);
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      // Fix imports like: from 'package@2.0.3' -> from 'package'
      // Also fix scoped packages: from '@scope/package@1.2.3' -> from '@scope/package'
      content = content.replace(/from ['"]([^'"]+?)@\d+(?:\.\d+)*(?:-\w+)?['"]/g, (match, pkg) => {
        return `from '${pkg}'`;
      });
      
      // Also fix import statements
      content = content.replace(/import ['"]([^'"]+?)@\d+(?:\.\d+)*(?:-\w+)?['"]/g, (match, pkg) => {
        return `import '${pkg}'`;
      });
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

fixImportsInDir('c:/Users/junio/Downloads/Cortexiapwauiuxdesign/src');
console.log('Done!');
