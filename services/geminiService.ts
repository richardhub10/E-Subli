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

/**
 * Intelligent local dictionary fallback for Kapampangan, Tagalog, and English
 */
function localDictionaryTranslate(text: string, sourceLang: string, targetLang: string): string {
  const clean = text.trim().toLowerCase();
  
  // Exact phrase match in phrasebook
  for (const item of phrasebookData) {
    if (sourceLang === 'Tagalog' && item.tagalog.toLowerCase().includes(clean)) {
      return targetLang === 'Kapampangan' ? item.kapampangan.split('(')[0].trim() : item.english;
    }
    if (sourceLang === 'English' && item.english.toLowerCase().includes(clean)) {
      return targetLang === 'Kapampangan' ? item.kapampangan.split('(')[0].trim() : item.tagalog;
    }
    if (sourceLang === 'Kapampangan' && item.kapampangan.toLowerCase().includes(clean)) {
      return targetLang === 'Tagalog' ? item.tagalog : item.english;
    }
  }

  // Common word dictionary
  const dict: Record<string, { kpm: string; tag: string; eng: string }> = {
    'ano': { kpm: 'Nanu', tag: 'Ano', eng: 'What' },
    'ano ito': { kpm: 'Nanu ini', tag: 'Ano ito', eng: 'What is this' },
    'ano iyan': { kpm: 'Nanu iyan', tag: 'Ano iyan', eng: 'What is that' },
    'sino': { kpm: 'Ninu', tag: 'Sino', eng: 'Who' },
    'saan': { kpm: 'Nukarin', tag: 'Saan', eng: 'Where' },
    'kailan': { kpm: 'Kapilan', tag: 'Kailan', eng: 'When' },
    'bakit': { kpm: 'Bakit / Obat', tag: 'Bakit', eng: 'Why' },
    'paano': { kpm: 'Makananu', tag: 'Paano', eng: 'How' },
    'magkano': { kpm: 'Magkanu', tag: 'Magkano', eng: 'How much' },
    'magandang araw': { kpm: 'Mayap a aldo', tag: 'Magandang araw', eng: 'Good day' },
    'magandang umaga': { kpm: 'Mayap a abak', tag: 'Magandang umaga', eng: 'Good morning' },
    'magandang hapon': { kpm: 'Mayap a gatpanapun', tag: 'Magandang hapon', eng: 'Good afternoon' },
    'magandang gabi': { kpm: 'Mayap a bengi', tag: 'Magandang gabi', eng: 'Good evening' },
    'salamat': { kpm: 'Salamat / Dakal a salamat', tag: 'Salamat', eng: 'Thank you' },
    'maraming salamat': { kpm: 'Dakal a salamat', tag: 'Maraming salamat', eng: 'Thank you very much' },
    'oo': { kpm: 'Wa', tag: 'Oo', eng: 'Yes' },
    'hindi': { kpm: 'Ali', tag: 'Hindi', eng: 'No' },
    'mahal kita': { kpm: 'Kaluguran daka', tag: 'Mahal kita', eng: 'I love you' },
    'kumusta': { kpm: 'Komusta ka', tag: 'Kumusta', eng: 'How are you' },
    'masaya': { kpm: 'Masaya', tag: 'Masaya', eng: 'Happy' },
    'malungkot': { kpm: 'Malungkut', tag: 'Malungkot', eng: 'Sad' },
    'bahay': { kpm: 'Bale', tag: 'Bahay', eng: 'House' },
    'tubig': { kpm: 'Danum', tag: 'Tubig', eng: 'Water' },
    'pagkain': { kpm: 'Pamangan', tag: 'Pagkain', eng: 'Food' },
    'ina': { kpm: 'Indû / Ima', tag: 'Ina', eng: 'Mother' },
    'ama': { kpm: 'Tatáng / Ibpa', tag: 'Ama', eng: 'Father' },
    'kapatid': { kpm: 'Kapatad', tag: 'Kapatid', eng: 'Sibling' },
    'kaibigan': { kpm: 'Kakaluguran', tag: 'Kaibigan', eng: 'Friend' },
  };

  if (dict[clean]) {
    const entry = dict[clean];
    if (targetLang === 'Kapampangan') return entry.kpm;
    if (targetLang === 'Tagalog') return entry.tag;
    return entry.eng;
  }

  // Word-by-word fallback if simple sentence
  const words = clean.split(/\s+/);
  const translatedWords = words.map(w => {
    if (dict[w]) {
      const entry = dict[w];
      if (targetLang === 'Kapampangan') return entry.kpm;
      if (targetLang === 'Tagalog') return entry.tag;
      return entry.eng;
    }
    return w;
  });

  return translatedWords.join(' ');
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
  const prompt = `You are an expert linguist specializing in authentic Kapampangan (Amanung Sisuan), Tagalog, and English. Translate the following text from ${sourceLang} to natural, fluent ${targetLang}. Output ONLY the translated ${targetLang} text with no commentary, no markdown, and no quotes. Text to translate: "${sourceText.trim()}"`;

  if (apiKey) {
    // Try multiple model endpoints and API versions
    for (const model of GEMINI_MODELS) {
      for (const apiVersion of ['v1beta', 'v1']) {
        try {
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
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              return { text, source: 'gemini' };
            }
          }
        } catch (e) {
          // Continue to next model/endpoint
        }
      }
    }
  }

  // Fallback to offline local dictionary translation
  const localResult = localDictionaryTranslate(sourceText, sourceLang, targetLang);
  return {
    text: localResult || sourceText,
    source: 'local'
  };
}
