import { en } from './src/i18n/locales/en';
import { ptBR } from './src/i18n/locales/pt-BR';
import { fr } from './src/i18n/locales/fr';
import { de } from './src/i18n/locales/de';
import * as fs from 'fs';

function getMissingKeys(source: any, target: any, prefix = '') {
  let missing: any[] = [];
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) {
        missing.push(`${prefix}${key} (object)`);
      } else {
        missing = missing.concat(getMissingKeys(source[key], target[key], `${prefix}${key}.`));
      }
    } else {
      if (target[key] === undefined) {
        missing.push({ key: `${prefix}${key}`, value: source[key] });
      }
    }
  }
  return missing;
}

const ptBRMissing = getMissingKeys(en, ptBR);
const frMissing = getMissingKeys(en, fr);
const deMissing = getMissingKeys(en, de);

fs.writeFileSync('missing_pt.json', JSON.stringify(ptBRMissing, null, 2));
fs.writeFileSync('missing_fr.json', JSON.stringify(frMissing, null, 2));
fs.writeFileSync('missing_de.json', JSON.stringify(deMissing, null, 2));

console.log('Done');
