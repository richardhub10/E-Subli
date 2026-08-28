import { supabase } from '../supabaseClient';
import appConfig from '../app.json';

export const CURRENT_APP_VERSION = appConfig.expo.version || '1.0.0';
export const DEFAULT_GITHUB_RELEASE_URL = 'https://github.com/richardhub10/E-Subli/releases/latest/download/e-subli.apk';
export const GITHUB_REPO_URL = 'https://github.com/richardhub10/E-Subli/releases/latest';

export type VersionCheckResult = {
  isUpdateRequired: boolean;
  isUpdateAvailable: boolean;
  currentVersion: string;
  minSupportedVersion: string;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
};

/**
 * Compares two semantic version strings (e.g. "1.0.0" vs "1.0.1").
 * Returns:
 *   -1 if v1 < v2 (v1 is older)
 *    0 if v1 == v2 (same version)
 *    1 if v1 > v2 (v1 is newer)
 */
export function compareSemver(v1: string, v2: string): number {
  const parts1 = v1.replace(/[^0-9.]/g, '').split('.').map(p => parseInt(p, 10) || 0);
  const parts2 = v2.replace(/[^0-9.]/g, '').split('.').map(p => parseInt(p, 10) || 0);
  const maxLen = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }
  return 0;
}

/**
 * Checks for updates against Supabase app_config table.
 * If app_config table does not exist or fails, safely falls back without blocking user.
 */
export async function checkAppVersion(): Promise<VersionCheckResult> {
  const fallbackResult: VersionCheckResult = {
    isUpdateRequired: false,
    isUpdateAvailable: false,
    currentVersion: CURRENT_APP_VERSION,
    minSupportedVersion: CURRENT_APP_VERSION,
    latestVersion: CURRENT_APP_VERSION,
    downloadUrl: DEFAULT_GITHUB_RELEASE_URL,
    releaseNotes: 'Multiplayer stability, enhanced Kulitan tracing guides, and daily quests.',
  };

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('key', 'version_control')
      .maybeSingle();

    if (error || !data) {
      return fallbackResult;
    }

    const minVersion = data.min_version || CURRENT_APP_VERSION;
    const latestVersion = data.latest_version || CURRENT_APP_VERSION;
    const downloadUrl = data.download_url || DEFAULT_GITHUB_RELEASE_URL;
    const releaseNotes = data.release_notes || fallbackResult.releaseNotes;

    const isUpdateRequired = compareSemver(CURRENT_APP_VERSION, minVersion) < 0;
    const isUpdateAvailable = compareSemver(CURRENT_APP_VERSION, latestVersion) < 0;

    return {
      isUpdateRequired,
      isUpdateAvailable,
      currentVersion: CURRENT_APP_VERSION,
      minSupportedVersion: minVersion,
      latestVersion,
      downloadUrl,
      releaseNotes,
    };
  } catch (err) {
    console.warn('App version check warning (using local fallback):', err);
    return fallbackResult;
  }
}
