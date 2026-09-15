const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let totalReplaced = 0;

// Matches fontFamily: 'Outfit-Bold', etc. (including trailing commas and whitespace)
const regex = /fontFamily:\s*['"`](Outfit|PlayfairDisplay)-[a-zA-Z]+['"`],?\s*/g;

files.forEach(file => {
  // Skip our centralized theme files
  if (file.endsWith('theme.ts') || file.endsWith('Typography.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  if (regex.test(content)) {
    console.log(`Cleaning fonts in: ${file.replace(__dirname, '')}`);
    content = content.replace(regex, '');
    
    // Clean up empty inline styles left behind: style={{ }} or style={[]}
    content = content.replace(/style=\{\{\s*\}\}/g, '');
    content = content.replace(/,\s*\{\s*\}/g, '');
    content = content.replace(/style=\{\[\s*\]\}/g, '');
    
    fs.writeFileSync(file, content, 'utf8');
    totalReplaced++;
  }
});

console.log(`\nSuccess! Scrubbed hardcoded fonts from ${totalReplaced} files.`);
