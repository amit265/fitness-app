import { en } from './locales/en';
import { id } from './locales/id';
import { hi } from './locales/hi';
import { es } from './locales/es';
import { ptBR } from './locales/pt-BR';
import { fr } from './locales/fr';
import { de } from './locales/de';

declare const require: any;
declare const module: any;
declare const process: any;

const targets: Record<string, any> = {
  id,
  hi,
  es,
  'pt-BR': ptBR,
  fr,
  de,
};

function extractKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(extractKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

export function validateTranslations(): { success: boolean; errors: string[] } {
  const enKeys = extractKeys(en).sort();
  const errors: string[] = [];

  console.log(`[i18n Validation] English source keys count: ${enKeys.length}`);

  for (const [lang, localeDict] of Object.entries(targets)) {
    const targetKeys = extractKeys(localeDict).sort();
    const missingKeys = enKeys.filter((k) => !targetKeys.includes(k));
    const extraKeys = targetKeys.filter((k) => !enKeys.includes(k));

    if (missingKeys.length > 0) {
      errors.push(`[${lang}] Missing ${missingKeys.length} keys:\n  - ${missingKeys.join('\n  - ')}`);
    }
    if (extraKeys.length > 0) {
      errors.push(`[${lang}] Extra ${extraKeys.length} keys:\n  - ${extraKeys.join('\n  - ')}`);
    }

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`✅ [${lang}] 100% key parity with English (${targetKeys.length} keys).`);
    }
  }

  const success = errors.length === 0;
  if (success) {
    console.log('✨ All 7 supported languages passed 100% i18n key completeness validation!');
  } else {
    console.error('❌ i18n Key Completeness Validation Failed:\n' + errors.join('\n\n'));
  }

  return { success, errors };
}

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const res = validateTranslations();
  if (!res.success) {
    process.exit(1);
  }
}
