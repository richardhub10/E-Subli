import type { AudioSource } from 'expo-audio';
import type { SyllableData } from './kulitanData';

export const kulitanAudioById: Record<string, AudioSource> = {
  '1': require('../assets/audio/kulitan_a.mp3'), // a
  '2': require('../assets/audio/kulitan_i.mp3'), // i
  '3': require('../assets/audio/kulitan_u.mp3'), // u
  '4': require('../assets/audio/kulitan_ka.mp3'), // ka
  '5': require('../assets/audio/kulitan_ki.mp3'), // ki
  '6': require('../assets/audio/kulitan_ku.mp3'), // ku
  '7': require('../assets/audio/kulitan_kank.mp3'), // kang
  '8': require('../assets/audio/kulitan_ga.mp3'), // ga
  '9': require('../assets/audio/kulitan_gi.mp3'), // gi
  '10': require('../assets/audio/kulitan_gu.mp3'), // gu
  '11': require('../assets/audio/kulitan_gang.mp3'), // gang
  '12': require('../assets/audio/kulitan_nga.mp3'), // nga
  '13': require('../assets/audio/kulitan_ngi.mp3'), // ngi
  '14': require('../assets/audio/kulitan_ngu.mp3'), // ngu
  '15': require('../assets/audio/kulitan_ngang.mp3'), // ngang
  '16': require('../assets/audio/kulitan_ta.mp3'), // ta
  '17': require('../assets/audio/kulitan_ti.mp3'), // ti
  '18': require('../assets/audio/kulitan_tu.mp3'), // tu
  '19': require('../assets/audio/kulitan_tang.mp3'), // tang
  '20': require('../assets/audio/kulitan_da.mp3'), // da
  '21': require('../assets/audio/kulitan_di.mp3'), // di
  '22': require('../assets/audio/kulitan_du.mp3'), // du
  '23': require('../assets/audio/kulitan_dang.mp3'), // dang
  '24': require('../assets/audio/kulitan_na.mp3'), // na
  '25': require('../assets/audio/kulitan_ni.mp3'), // ni
  '26': require('../assets/audio/kulitan_nu.mp3'), // nu
  '27': require('../assets/audio/kulitan_nang.mp3'), // nang
  '28': require('../assets/audio/kulitan_la.mp3'), // la
  '29': require('../assets/audio/kulitan_li.mp3'), // li
  '30': require('../assets/audio/kulitan_lu.mp3'), // lu
  '31': require('../assets/audio/kulitan_lang.mp3'), // lang
  '32': require('../assets/audio/kulitan_sa.mp3'), // sa
  '33': require('../assets/audio/kulitan_si.mp3'), // si
  '34': require('../assets/audio/kulitan_su.mp3'), // su
  '35': require('../assets/audio/kulitan_sang.mp3'), // sang
  '36': require('../assets/audio/kulitan_ma.mp3'), // ma
  '37': require('../assets/audio/kulitan_mi.mp3'), // mi
  '38': require('../assets/audio/kulitan_mu.mp3'), // mu
  '39': require('../assets/audio/kulitan_mang.mp3'), // mang
  '40': require('../assets/audio/kulitan_pa.mp3'), // pa
  '41': require('../assets/audio/kulitan_pi.mp3'), // pi
  '42': require('../assets/audio/kulitan_pu.mp3'), // pu
  '43': require('../assets/audio/kulitan_pang.mp3'), // pang
  '44': require('../assets/audio/kulitan_ba.mp3'), // ba
  '45': require('../assets/audio/kulitan_bi.mp3'), // bi
  '46': require('../assets/audio/kulitan_bu.mp3'), // bu
  '47': require('../assets/audio/kulitan_bang.mp3'), // bang
  '48': require('../assets/audio/kulitan_e.mp3'), // e
  '49': require('../assets/audio/kulitan_o.mp3'), // o
  '50': require('../assets/audio/kulitan_ke.mp3'), // ke
  '51': require('../assets/audio/kulitan_ko.mp3'), // ko
  '52': require('../assets/audio/kulitan_ge.mp3'), // ge
  '53': require('../assets/audio/kulitan_go.mp3'), // go
  '54': require('../assets/audio/kulitan_nge.mp3'), // nge
  '55': require('../assets/audio/kulitan_ngo.mp3'), // ngo
  '56': require('../assets/audio/kulitan_te.mp3'), // te
  '57': require('../assets/audio/kulitan_to.mp3'), // to
  '58': require('../assets/audio/kulitan_de.mp3'), // de
  '59': require('../assets/audio/kulitan_do.mp3'), // do
  '60': require('../assets/audio/kulitan_ne.mp3'), // ne
  '61': require('../assets/audio/kulitan_no.mp3'), // no
  '62': require('../assets/audio/kulitan_le.mp3'), // le
  '63': require('../assets/audio/kulitan_lo.mp3'), // lo
  '64': require('../assets/audio/kulitan_se.mp3'), // se
  '65': require('../assets/audio/kulitan_so.mp3'), // so
  '66': require('../assets/audio/kulitan_me.mp3'), // me
  '67': require('../assets/audio/kulitan_mo.mp3'), // mo
  '68': require('../assets/audio/kulitan_pe.mp3'), // pe
  '69': require('../assets/audio/kulitan_po.mp3'), // po
  '70': require('../assets/audio/kulitan_be.mp3'), // be
  '71': require('../assets/audio/kulitan_bo.mp3'), // bo
  '72': require('../assets/audio/kulitan_gi_i.mp3'), // gi/i
  '73': require('../assets/audio/kulitan_gu_u.mp3'), // gu/u
  '74': require('../assets/audio/kulitan_ki_i.mp3'), // ki/i
  '75': require('../assets/audio/kulitan_ku_u.mp3'), // ku/u
  '76': require('../assets/audio/kulitan_ngi_i.mp3'), // ngi/i
  '77': require('../assets/audio/kulitan_ngu_u.mp3'), // ngu/u
  '78': require('../assets/audio/kulitan_ti_i.mp3'), // ti/i
  '79': require('../assets/audio/kulitan_tu_u.mp3'), // tu/u
  '80': require('../assets/audio/kulitan_di_i.mp3'), // di/i
  '81': require('../assets/audio/kulitan_du_u.mp3'), // du/u
  '82': require('../assets/audio/kulitan_ni_i.mp3'), // ni/i
  '83': require('../assets/audio/kulitan_nu_u.mp3'), // nu/u
  '84': require('../assets/audio/kulitan_li_i.mp3'), // li/i
  '85': require('../assets/audio/kulitan_lu_u.mp3'), // lu/u
  '86': require('../assets/audio/kulitan_si_i.mp3'), // si/i
  '87': require('../assets/audio/kulitan_su_u.mp3'), // su/u
  '88': require('../assets/audio/kulitan_mi_i.mp3'), // mi/i
  '89': require('../assets/audio/kulitan_mu_u.mp3'), // mu/u
  '90': require('../assets/audio/kulitan_pi_i.mp3'), // pi/i
  '91': require('../assets/audio/kulitan_pu_u.mp3'), // pu/u
  '92': require('../assets/audio/kulitan_bi_i.mp3'), // bi/i
  '93': require('../assets/audio/kulitan_bu_u.mp3'), // bu/u
};

export function getKulitanAudioSource(
  syllable?: Pick<SyllableData, 'id'> | null
): AudioSource | null {
  if (!syllable) return null;
  return kulitanAudioById[syllable.id] ?? null;
}
