const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  { path: 'src/services/firebase/messagingService.ts', depth: 2 },
  { path: 'src/app/groq-api.tsx', depth: 1 },
  { path: 'src/app/logModal.tsx', depth: 1 },
  { path: 'src/app/bmi.tsx', depth: 1 },
  { path: 'src/app/nutritionDetailModal.tsx', depth: 1 },
  { path: 'src/app/cycle.tsx', depth: 1 },
  { path: 'src/app/settings.tsx', depth: 1 },
  { path: 'src/app/(tabs)/profile.tsx', depth: 2 },
  { path: 'src/app/edit-profile.tsx', depth: 1 },
  { path: 'src/components/CoachChat.tsx', depth: 1 },
  { path: 'src/context/IAPContext.tsx', depth: 1 }
];

for (const { path: filePath, depth } of filesToUpdate) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('Alert.alert')) {
    content = content.replace(/Alert\.alert\(/g, 'useAppStore.getState().showAlert(');
    
    if (!content.includes('useAppStore')) {
      const prefix = '../'.repeat(depth);
      const importStatement = `import { useAppStore } from '${prefix}store/useAppStore';\n`;
      // Find last import
      const lastImportMatch = [...content.matchAll(/^import .*$/gm)].pop();
      if (lastImportMatch) {
        const insertIndex = lastImportMatch.index + lastImportMatch[0].length + 1;
        content = content.slice(0, insertIndex) + importStatement + content.slice(insertIndex);
      } else {
        content = importStatement + content;
      }
    }
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${filePath}`);
  }
}
