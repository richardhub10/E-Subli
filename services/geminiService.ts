import { phrasebookData } from '../data/phrasebookData';

export interface TranslationResult {
  text: string;
  source: 'gemini' | 'local';
}

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-pro',
];

// Comprehensive authentic Kapampangan, Tagalog, English dictionary
const DICTIONARY: Record<string, { kpm: string; tag: string; eng: string }> = {
  'ano': { kpm: 'Nanu', tag: 'Ano', eng: 'What' },
  'ano ito': { kpm: 'Nanu ini', tag: 'Ano ito', eng: 'What is this' },
  'ano iyan': { kpm: 'Nanu iyan', tag: 'Ano iyan', eng: 'What is that' },
  'ano iyon': { kpm: 'Nanu ita', tag: 'Ano iyon', eng: 'What is that over there' },
  'sino': { kpm: 'Ninu', tag: 'Sino', eng: 'Who' },
  'sino ka': { kpm: 'Ninu ka', tag: 'Sino ka', eng: 'Who are you' },
  'saan': { kpm: 'Nukarin', tag: 'Saan', eng: 'Where' },
  'saan ka pupunta': { kpm: 'Nukarin ka munta', tag: 'Saan ka pupunta', eng: 'Where are you going' },
  'kailan': { kpm: 'Kapilan', tag: 'Kailan', eng: 'When' },
  'bakit': { kpm: 'Bakit / Obat', tag: 'Bakit', eng: 'Why' },
  'paano': { kpm: 'Makananu', tag: 'Paano', eng: 'How' },
  'magkano': { kpm: 'Magkanu', tag: 'Magkano', eng: 'How much' },
  'magandang araw': { kpm: 'Mayap a aldo', tag: 'Magandang araw', eng: 'Good day' },
  'magandang umaga': { kpm: 'Mayap a abak', tag: 'Magandang umaga', eng: 'Good morning' },
  'magandang hapon': { kpm: 'Mayap a gatpanapun', tag: 'Magandang hapon', eng: 'Good afternoon' },
  'magandang gabi': { kpm: 'Mayap a bengi', tag: 'Magandang gabi', eng: 'Good evening' },
  'salamat': { kpm: 'Dakal a salamat', tag: 'Salamat', eng: 'Thank you' },
  'maraming salamat': { kpm: 'Dakal a salamat', tag: 'Maraming salamat', eng: 'Thank you very much' },
  'walang anuman': { kpm: 'Alang nanu man', tag: 'Walang anuman', eng: "You're welcome" },
  'oo': { kpm: 'Wa', tag: 'Oo', eng: 'Yes' },
  'hindi': { kpm: 'Ali', tag: 'Hindi', eng: 'No' },
  'mahal kita': { kpm: 'Kaluguran daka', tag: 'Mahal kita', eng: 'I love you' },
  'mahal na mahal kita': { kpm: 'Kaluguran da kang bina', tag: 'Mahal na mahal kita', eng: 'I love you very much' },
  'kumusta': { kpm: 'Komusta ka', tag: 'Kumusta', eng: 'How are you' },
  'kumusta ka': { kpm: 'Komusta ka', tag: 'Kumusta ka', eng: 'How are you' },
  'mabuti': { kpm: 'Masalese', tag: 'Mabuti', eng: 'Good / Well' },
  'mabuti naman': { kpm: 'Masalese naman', tag: 'Mabuti naman', eng: 'I am doing well' },
  'ingat': { kpm: 'Mimingat ka', tag: 'Ingat', eng: 'Take care' },
  'paalam': { kpm: 'Mako naku', tag: 'Paalam', eng: 'Goodbye' },
  'masaya': { kpm: 'Masaya', tag: 'Masaya', eng: 'Happy' },
  'malungkot': { kpm: 'Malungkut', tag: 'Malungkot', eng: 'Sad' },
  'pagod': { kpm: 'Mapagal', tag: 'Pagod', eng: 'Tired' },
  'gutom': { kpm: 'Maranup', tag: 'Gutom', eng: 'Hungry' },
  'uhaw': { kpm: 'Mau', tag: 'Uhaw', eng: 'Thirsty' },
  'bahay': { kpm: 'Bale', tag: 'Bahay', eng: 'House' },
  'tubig': { kpm: 'Danum', tag: 'Tubig', eng: 'Water' },
  'pagkain': { kpm: 'Pamangan', tag: 'Pagkain', eng: 'Food' },
  'kanin': { kpm: 'Nasi', tag: 'Kanin', eng: 'Cooked rice' },
  'pera': { kpm: 'Pera / Salapi', tag: 'Pera', eng: 'Money' },
  'ina': { kpm: 'Indû / Ima', tag: 'Ina', eng: 'Mother' },
  'ama': { kpm: 'Tatáng / Ibpa', tag: 'Ama', eng: 'Father' },
  'kapatid': { kpm: 'Kapatad', tag: 'Kapatid', eng: 'Sibling' },
  'kaibigan': { kpm: 'Kakaluguran', tag: 'Kaibigan', eng: 'Friend' },
  'anak': { kpm: 'Anak', tag: 'Anak', eng: 'Child' },
  'lolo': { kpm: 'Ingkung', tag: 'Lolo', eng: 'Grandfather' },
  'lola': { kpm: 'Apu / Impo', tag: 'Lola', eng: 'Grandmother' },
};

/**
 * Intelligent local dictionary translation
 */
export function localDictionaryTranslate(text: string, sourceLang: string, targetLang: string): string | null {
  const clean = text.trim().toLowerCase().replace(/[?!.,;]/g, '');

  // 1. Direct dictionary match
  if (DICTIONARY[clean]) {
    const entry = DICTIONARY[clean];
    if (targetLang === 'Kapampangan') return entry.kpm;
    if (targetLang === 'Tagalog') return entry.tag;
    return entry.eng;
  }

  // 2. Phrasebook exact / substring search
  for (const item of phrasebookData) {
    const kpmClean = item.kapampangan.toLowerCase().split('(')[0].trim();
    const tagClean = item.tagalog.toLowerCase().replace(/[?!.,;]/g, '').trim();
    const engClean = item.english.toLowerCase().replace(/^\d+\.\s*/, '').replace(/[?!.,;]/g, '').trim();

    if (sourceLang === 'Tagalog' && (tagClean === clean || tagClean.includes(clean))) {
      return targetLang === 'Kapampangan' ? kpmClean : engClean;
    }
    if (sourceLang === 'English' && (engClean === clean || engClean.includes(clean))) {
      return targetLang === 'Kapampangan' ? kpmClean : tagClean;
    }
    if (sourceLang === 'Kapampangan' && (kpmClean === clean || kpmClean.includes(clean))) {
      return targetLang === 'Tagalog' ? tagClean : engClean;
    }
  }

  // 3. Word-by-word token substitution
  const words = clean.split(/\s+/);
  if (words.length > 1) {
    let matches = 0;
    const translated = words.map(w => {
      if (DICTIONARY[w]) {
        matches++;
        const entry = DICTIONARY[w];
        if (targetLang === 'Kapampangan') return entry.kpm;
        if (targetLang === 'Tagalog') return entry.tag;
        return entry.eng;
      }
      return w;
    });

    if (matches > 0) {
      return translated.join(' ');
    }
  }

  return null;
}

/**
 * Robust Cross-Platform Translator using Gemini REST API with multi-endpoint failover
 */
export async function translateText(
  sourceText: string,
  sourceLang: string,
  targetLang: string,
  apiKey?: string
): Promise<TranslationResult> {
  // 1. First check local dictionary for instant zero-latency match
  const localMatch = localDictionaryTranslate(sourceText, sourceLang, targetLang);
  if (localMatch) {
    return { text: localMatch, source: 'local' };
  }

  // 2. If no direct local match, attempt Gemini AI REST endpoint
  const prompt = `You are an expert linguist specializing in authentic Kapampangan (Amanung Sisuan), Tagalog, and English. Translate the following text from ${sourceLang} to natural, fluent ${targetLang}. Output ONLY the translated ${targetLang} text with no commentary, no markdown, and no quotes. Text to translate: "${sourceText.trim()}"`;

  if (apiKey) {
    for (const model of GEMINI_MODELS) {
      for (const apiVersion of ['v1beta', 'v1']) {
        try {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ]
            }),
            signal: controller ? controller.signal : undefined
          });

          if (timeoutId) clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              return { text, source: 'gemini' };
            }
          }
        } catch (e) {
          // Fall through to next model / local fallback
        }
      }
    }
  }

  // 3. Fallback to token word lookup or original text
  const fallback = localDictionaryTranslate(sourceText, sourceLang, targetLang) || sourceText;
  return {
    text: fallback,
    source: 'local'
  };
}
