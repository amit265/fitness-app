const fs = require('fs');

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs'
  },
  transpileOnly: true
});

const { en } = require('./src/i18n/locales/en.ts');
const { ptBR } = require('./src/i18n/locales/pt-BR.ts');
const { fr } = require('./src/i18n/locales/fr.ts');
const { de } = require('./src/i18n/locales/de.ts');

function getMissingKeys(source, target, prefix = '') {
  let missing = [];
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
