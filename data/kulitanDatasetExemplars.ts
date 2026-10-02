// Authentic Calligraphy Exemplars extracted from the official Sulat Kapampangan (Kulitan) Dataset
export const KULITAN_DATASET_EXEMPLARS: Record<string, any> = {
  a: require('../assets/datasets/exemplar_a.jpg'),
  ga: require('../assets/datasets/exemplar_ga.jpg'),
  ka: require('../assets/datasets/exemplar_ka.jpg'),
  nga: require('../assets/datasets/exemplar_nga.jpg'),
  ta: require('../assets/datasets/exemplar_ta.jpg'),
  da: require('../assets/datasets/exemplar_da.jpg'),
  na: require('../assets/datasets/exemplar_na.jpg'),
  la: require('../assets/datasets/exemplar_la.jpg'),
  sa: require('../assets/datasets/exemplar_sa.jpg'),
  ma: require('../assets/datasets/exemplar_ma.jpg'),
  pa: require('../assets/datasets/exemplar_pa.jpg'),
  ba: require('../assets/datasets/exemplar_ba.jpg'),
  i: require('../assets/datasets/exemplar_i.jpg'),
  gi: require('../assets/datasets/exemplar_gi.jpg'),
  ki: require('../assets/datasets/exemplar_ki.jpg'),
  ngi: require('../assets/datasets/exemplar_ngi.jpg'),
  ti: require('../assets/datasets/exemplar_ti.jpg'),
  di: require('../assets/datasets/exemplar_di.jpg'),
  ni: require('../assets/datasets/exemplar_ni.jpg'),
  li: require('../assets/datasets/exemplar_li.jpg'),
  si: require('../assets/datasets/exemplar_si.jpg'),
  mi: require('../assets/datasets/exemplar_mi.jpg'),
  pi: require('../assets/datasets/exemplar_pi.jpg'),
  bi: require('../assets/datasets/exemplar_bi.jpg'),
  u: require('../assets/datasets/exemplar_u.jpg'),
  gu: require('../assets/datasets/exemplar_gu.jpg'),
  ku: require('../assets/datasets/exemplar_ku.jpg'),
  ngu: require('../assets/datasets/exemplar_ngu.jpg'),
  tu: require('../assets/datasets/exemplar_tu.jpg'),
  du: require('../assets/datasets/exemplar_du.jpg'),
  nu: require('../assets/datasets/exemplar_nu.jpg'),
  lu: require('../assets/datasets/exemplar_lu.jpg'),
  su: require('../assets/datasets/exemplar_su.jpg'),
  mu: require('../assets/datasets/exemplar_mu.jpg'),
  pu: require('../assets/datasets/exemplar_pu.jpg'),
  bu: require('../assets/datasets/exemplar_bu.jpg'),
  gang: require('../assets/datasets/exemplar_gang.png'),
  kang: require('../assets/datasets/exemplar_kang.png'),
  ngang: require('../assets/datasets/exemplar_ngang.png'),
  tang: require('../assets/datasets/exemplar_tang.png'),
  dang: require('../assets/datasets/exemplar_dang.png'),
  nang: require('../assets/datasets/exemplar_nang.png'),
  lang: require('../assets/datasets/exemplar_lang.png'),
  sang: require('../assets/datasets/exemplar_sang.png'),
  mang: require('../assets/datasets/exemplar_mang.png'),
  pang: require('../assets/datasets/exemplar_pang.png'),
  bang: require('../assets/datasets/exemplar_bang.png'),
};

/**
 * Normalizes user and model transliterations into canonical Kulitan syllables.
 * Accurately maps Kapampangan vowel allophones (-e -> -i, -o -> -u, diacritics like dí/î -> di)
 * as established in the 93 authentic archival screenshot dataset.
 */
export function normalizeKulitanSyllable(query?: string | null): string {
  if (!query) return '';
  let clean = query.toLowerCase().trim();
  if (clean.includes('/')) {
    clean = clean.split('/')[0];
  }
  clean = clean
    .replace(/[íî]/g, 'i')
    .replace(/[úû]/g, 'u')
    .replace(/[éê]/g, 'e')
    .replace(/[óô]/g, 'o')
    .replace(/[áâ]/g, 'a')
    .replace(/[^a-z]/g, '');

  const VOWEL_ALLOPHONES: Record<string, string> = {
    e: 'i', o: 'u',
    ke: 'ki', ko: 'ku',
    ge: 'gi', go: 'gu',
    nge: 'ngi', ngo: 'ngu',
    te: 'ti', to: 'tu',
    de: 'di', do: 'du',
    ne: 'ni', no: 'nu',
    le: 'li', lo: 'lu',
    se: 'si', so: 'su',
    me: 'mi', mo: 'mu',
    pe: 'pi', po: 'pu',
    be: 'bi', bo: 'bu',
  };

  return VOWEL_ALLOPHONES[clean] || clean;
}

export function getKulitanExemplar(latin: string): any | null {
  if (!latin) return null;
  const canonical = normalizeKulitanSyllable(latin);
  return KULITAN_DATASET_EXEMPLARS[canonical] || KULITAN_DATASET_EXEMPLARS[latin.toLowerCase().trim()] || null;
}

