import { phrasebookData } from '../data/phrasebookData';

export interface TranslationResult {
  text: string;
  source: 'gemini' | 'online' | 'local';
}

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

interface DictEntry {
  kpm: string;
  tag: string;
  eng: string;
}

// Comprehensive authentic Kapampangan, Tagalog, and English dictionary
const DICTIONARY_ENTRIES: DictEntry[] = [
  // Interrogatives
  { kpm: 'Nanu', tag: 'Ano', eng: 'What' },
  { kpm: 'Nanu ini', tag: 'Ano ito', eng: 'What is this' },
  { kpm: 'Nanu iyan', tag: 'Ano iyan', eng: 'What is that' },
  { kpm: 'Nanu ita', tag: 'Ano iyon', eng: 'What is that over there' },
  { kpm: 'Ninu', tag: 'Sino', eng: 'Who' },
  { kpm: 'Ninu ka', tag: 'Sino ka', eng: 'Who are you' },
  { kpm: 'Nukarin', tag: 'Saan', eng: 'Where' },
  { kpm: 'Nukarin ya', tag: 'Nasaan ito', eng: 'Where is it' },
  { kpm: 'Nukarin ka munta', tag: 'Saan ka pupunta', eng: 'Where are you going' },
  { kpm: 'Kapilan', tag: 'Kailan', eng: 'When' },
  { kpm: 'Bakit / Obat', tag: 'Bakit', eng: 'Why' },
  { kpm: 'Obat', tag: 'Bakit', eng: 'Why' },
  { kpm: 'Makananu', tag: 'Paano', eng: 'How' },
  { kpm: 'Magkanu', tag: 'Magkano', eng: 'How much' },
  { kpm: 'Pilan', tag: 'Ilan', eng: 'How many' },

  // Greetings & Courtesies
  { kpm: 'Mayap a aldo', tag: 'Magandang araw', eng: 'Good day' },
  { kpm: 'Mayap a abak', tag: 'Magandang umaga', eng: 'Good morning' },
  { kpm: 'Mayap a gatpanapun', tag: 'Magandang hapon', eng: 'Good afternoon' },
  { kpm: 'Mayap a bengi', tag: 'Magandang gabi', eng: 'Good evening' },
  { kpm: 'Mayap a oras kekayu ngan', tag: 'Magandang araw sa inyong lahat', eng: 'Good day to you all' },
  { kpm: 'Dakal a salamat', tag: 'Salamat', eng: 'Thank you' },
  { kpm: 'Dakal a salamat', tag: 'Maraming salamat', eng: 'Thank you very much' },
  { kpm: 'Alang nanu man', tag: 'Walang anuman', eng: "You're welcome" },
  { kpm: 'Wa', tag: 'Oo', eng: 'Yes' },
  { kpm: 'Ali', tag: 'Hindi', eng: 'No' },
  { kpm: 'Kaluguran daka', tag: 'Mahal kita', eng: 'I love you' },
  { kpm: 'Kaluguran da kang bina', tag: 'Mahal na mahal kita', eng: 'I love you very much' },
  { kpm: 'Komusta', tag: 'Kumusta', eng: 'How are you' },
  { kpm: 'Komusta ka', tag: 'Kumusta ka', eng: 'How are you' },
  { kpm: 'Komusta naka', tag: 'Kumusta ka na', eng: 'How are you now' },
  { kpm: 'Masalese', tag: 'Mabuti', eng: 'Good' },
  { kpm: 'Masalese naman', tag: 'Mabuti naman', eng: 'I am doing well' },
  { kpm: 'Mimingat ka', tag: 'Ingat', eng: 'Take care' },
  { kpm: 'Mim-ingat ka pane', tag: 'Mag-ingat ka palagi', eng: 'Take care always' },
  { kpm: 'Mako naku', tag: 'Paalam', eng: 'Goodbye' },
  { kpm: 'Malaus ko pu', tag: 'Tuloy po kayo', eng: 'Welcome' },
  { kpm: 'Mikit kata pota', tag: 'Magkikita tayo mamaya', eng: 'See you later' },
  { kpm: 'Patawad pu', tag: 'Patawad po', eng: 'I am sorry' },
  { kpm: 'Eku balu', tag: 'Hindi ko alam', eng: 'I do not know' },
  { kpm: 'Aintindian ku', tag: 'Naiintindihan ko', eng: 'I understand' },
  { kpm: 'Eku aintindian', tag: 'Hindi ko naiintindihan', eng: 'I do not understand' },

  // Pronouns
  { kpm: 'Yaku', tag: 'Ako', eng: 'I' },
  { kpm: 'Ika', tag: 'Ikaw', eng: 'You' },
  { kpm: 'Ya', tag: 'Siya', eng: 'He / She' },
  { kpm: 'Ikami', tag: 'Kami', eng: 'We' },
  { kpm: 'Ikatamu', tag: 'Tayo', eng: 'We all' },
  { kpm: 'Ikayu', tag: 'Kayo', eng: 'You all' },
  { kpm: 'Ila', tag: 'Sila', eng: 'They' },
  { kpm: 'Kanaku', tag: 'Akin', eng: 'Mine' },
  { kpm: 'Keka', tag: 'Iyo', eng: 'Yours' },
  { kpm: 'Kaya', tag: 'Kanya', eng: 'His / Hers' },

  // Feelings & States
  { kpm: 'Masaya', tag: 'Masaya', eng: 'Happy' },
  { kpm: 'Malungkut', tag: 'Malungkot', eng: 'Sad' },
  { kpm: 'Mapagal', tag: 'Pagod', eng: 'Tired' },
  { kpm: 'Maranup', tag: 'Gutom', eng: 'Hungry' },
  { kpm: 'Mau', tag: 'Uhaw', eng: 'Thirsty' },
  { kpm: 'Masakit', tag: 'Masakit', eng: 'Painful / Sick' },
  { kpm: 'Mayap', tag: 'Mabuti / Maayos', eng: 'Fine / Well' },
  { kpm: 'Marok', tag: 'Masama', eng: 'Bad' },
  { kpm: 'Malagu', tag: 'Maganda', eng: 'Beautiful' },
  { kpm: 'Masanting', tag: 'Guwapo / Maganda', eng: 'Handsome' },
  { kpm: 'Manyaman', tag: 'Masarap', eng: 'Delicious' },
  { kpm: 'Mabandi', tag: 'Mayaman', eng: 'Rich' },
  { kpm: 'Kalulu', tag: 'Mahirap', eng: 'Poor' },

  // Common Nouns
  { kpm: 'Bale', tag: 'Bahay', eng: 'House' },
  { kpm: 'Danum', tag: 'Tubig', eng: 'Water' },
  { kpm: 'Pamangan', tag: 'Pagkain', eng: 'Food' },
  { kpm: 'Nasi', tag: 'Kanin', eng: 'Cooked rice' },
  { kpm: 'Asan', tag: 'Ulam', eng: 'Viand' },
  { kpm: 'Pera / Salapi', tag: 'Pera', eng: 'Money' },
  { kpm: 'Dalan', tag: 'Daan / Kalsada', eng: 'Road / Street' },
  { kpm: 'Tau', tag: 'Tao', eng: 'Person' },
  { kpm: 'Indu / Ima', tag: 'Ina', eng: 'Mother' },
  { kpm: 'Tatang / Ibpa', tag: 'Ama', eng: 'Father' },
  { kpm: 'Kapatad', tag: 'Kapatid', eng: 'Sibling' },
  { kpm: 'Kakaluguran', tag: 'Kaibigan', eng: 'Friend' },
  { kpm: 'Anak', tag: 'Anak', eng: 'Child' },
  { kpm: 'Ingkung', tag: 'Lolo', eng: 'Grandfather' },
  { kpm: 'Apu / Impo', tag: 'Lola', eng: 'Grandmother' },
  { kpm: 'Aldo', tag: 'Araw', eng: 'Day / Sun' },
  { kpm: 'Bengi', tag: 'Gabi', eng: 'Night' },
  { kpm: 'Uran', tag: 'Ulan', eng: 'Rain' },
  { kpm: 'Hangin', tag: 'Hangin', eng: 'Wind' },
  { kpm: 'Asu', tag: 'Aso', eng: 'Dog' },
  { kpm: 'Pusa', tag: 'Pusa', eng: 'Cat' }
];

// Bidirectional indexing for ultra-fast O(1) lookups
const tagalogMap = new Map<string, DictEntry>();
const englishMap = new Map<string, DictEntry>();
const kapampanganMap = new Map<string, DictEntry>();

function normalizeWord(str: string): string {
  return str.toLowerCase().replace(/[?!.,;:'"()]/g, '').trim();
}

for (const entry of DICTIONARY_ENTRIES) {
  // Index Tagalog
  for (const part of entry.tag.split('/')) {
    const key = normalizeWord(part);
    if (key && !tagalogMap.has(key)) tagalogMap.set(key, entry);
  }
  // Index English
  for (const part of entry.eng.split('/')) {
    const key = normalizeWord(part);
    if (key && !englishMap.has(key)) englishMap.set(key, entry);
  }
  // Index Kapampangan
  for (const part of entry.kpm.split('/')) {
    const key = normalizeWord(part);
    if (key && !kapampanganMap.has(key)) kapampanganMap.set(key, entry);
  }
}

function getFromEntry(entry: DictEntry, targetLang: string): string {
  if (targetLang === 'Kapampangan') return entry.kpm.split('/')[0].trim();
  if (targetLang === 'Tagalog') return entry.tag.split('/')[0].trim();
  return entry.eng.split('/')[0].trim();
}

function cleanTranslationText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim();
}

/**
 * 1. Check local dictionary and phrasebook for direct exact match
 */
export function localDictionaryTranslate(text: string, sourceLang: string, targetLang: string): string | null {
  const clean = normalizeWord(text);
  if (!clean) return null;

  // Direct dictionary lookup
  let entry: DictEntry | undefined;
  if (sourceLang === 'Tagalog') entry = tagalogMap.get(clean);
  else if (sourceLang === 'English') entry = englishMap.get(clean);
  else if (sourceLang === 'Kapampangan') entry = kapampanganMap.get(clean);

  if (entry) {
    return getFromEntry(entry, targetLang);
  }

  // Phrasebook check
  for (const item of phrasebookData) {
    const tag = normalizeWord(item.tagalog);
    const eng = normalizeWord(item.english.replace(/^\d+\.\s*/, ''));
    const kpm = normalizeWord(item.kapampangan.split('(')[0]);

    if (sourceLang === 'Tagalog' && (tag === clean || clean === tag)) {
      return targetLang === 'Kapampangan' ? item.kapampangan.split('(')[0].trim() : item.english;
    }
    if (sourceLang === 'English' && (eng === clean || clean === eng)) {
      return targetLang === 'Kapampangan' ? item.kapampangan.split('(')[0].trim() : item.tagalog;
    }
    if (sourceLang === 'Kapampangan' && (kpm === clean || clean === kpm)) {
      return targetLang === 'Tagalog' ? item.tagalog : item.english;
    }
  }

  return null;
}

/**
 * 2. Word-by-word token fallback for offline partial translations
 */
export function localTokenFallback(text: string, sourceLang: string, targetLang: string): string | null {
  const words = text.split(/\s+/);
  if (words.length <= 1) return null;

  let matches = 0;
  const translated = words.map(rawWord => {
    const clean = normalizeWord(rawWord);
    let entry: DictEntry | undefined;
    if (sourceLang === 'Tagalog') entry = tagalogMap.get(clean);
    else if (sourceLang === 'English') entry = englishMap.get(clean);
    else if (sourceLang === 'Kapampangan') entry = kapampanganMap.get(clean);

    if (entry) {
      matches++;
      return getFromEntry(entry, targetLang);
    }
    return rawWord;
  });

  // Only return if we translated at least half or significant words
  if (matches > 0 && matches / words.length >= 0.4) {
    return translated.join(' ');
  }

  return null;
}

/**
 * 3. Free Neural Translation Engine (MyMemory)
 * Supports authentic Kapampangan (pam), Tagalog (tl), and English (en)
 * Works without an API key, perfect for client and test APK builds
 */
export async function onlineNeuralTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  const codeMap: Record<string, string> = {
    Tagalog: 'tl',
    English: 'en',
    Kapampangan: 'pam',
  };

  const sCode = codeMap[sourceLang] || 'tl';
  const tCode = codeMap[targetLang] || 'pam';

  if (sCode === tCode) return text;

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 6500) : null;

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${sCode}|${tCode}`;
    const response = await fetch(url, {
      signal: controller ? controller.signal : undefined,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.responseData?.translatedText;
      if (rawText && typeof rawText === 'string' && !rawText.startsWith('MYMEMORY WARNING')) {
        const cleaned = cleanTranslationText(rawText);
        if (cleaned && cleaned.toLowerCase() !== text.trim().toLowerCase()) {
          return cleaned;
        }
      }
    }
  } catch (err) {
    // Online request failed or timed out
  }

  return null;
}

/**
 * 4. Google Gemini AI REST API
 * Used whenever a valid API key is present
 */
export async function geminiTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<string | null> {
  const prompt = `You are an expert linguist specializing in authentic Kapampangan (Amanung Sisuan), Tagalog, and English. Translate the following text from ${sourceLang} to natural, fluent ${targetLang}. Output ONLY the translated ${targetLang} text with no commentary, no markdown, and no quotes. Text to translate: "${text.trim()}"`;

  for (const model of GEMINI_MODELS) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: controller ? controller.signal : undefined,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidate) {
          return cleanTranslationText(candidate);
        }
      }
    } catch {
      // Fall through to next model
    }
  }

  return null;
}

/**
 * Robust Multi-Tier Translator Orchestrator
 * Pipeline:
 * 1. Zero-latency exact dictionary / phrasebook match (Offline)
 * 2. Gemini AI REST API (if EXPO_PUBLIC_GEMINI_API_KEY is configured)
 * 3. High-Accuracy Neural Translation Engine (MyMemory - Free, Zero Config)
 * 4. Word-by-word token substitution (Offline)
 * 5. Original text fallback
 */
export async function translateText(
  sourceText: string,
  sourceLang: string,
  targetLang: string,
  apiKey?: string
): Promise<TranslationResult> {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    return { text: '', source: 'local' };
  }

  // 1. Instant local dictionary / phrasebook match
  const exactLocal = localDictionaryTranslate(trimmed, sourceLang, targetLang);
  if (exactLocal) {
    return { text: exactLocal, source: 'local' };
  }

  // 2. Gemini AI (if API key available)
  if (apiKey) {
    const geminiResult = await geminiTranslate(trimmed, sourceLang, targetLang, apiKey);
    if (geminiResult) {
      return { text: geminiResult, source: 'gemini' };
    }
  }

  // 3. Online Neural Translation Engine (Free, supports Kapampangan seamlessly)
  const onlineResult = await onlineNeuralTranslate(trimmed, sourceLang, targetLang);
  if (onlineResult) {
    return { text: onlineResult, source: 'online' };
  }

  // 4. Offline word-by-word token substitution
  const tokenFallback = localTokenFallback(trimmed, sourceLang, targetLang);
  if (tokenFallback) {
    return { text: tokenFallback, source: 'local' };
  }

  // 5. Ultimate graceful fallback
  return {
    text: trimmed,
    source: 'local',
  };
}
