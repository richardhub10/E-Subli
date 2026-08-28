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
 * Checks for updates against Supabase app_config table or GitHub Releases API.
 * If remote check fails or table is not created yet, safely falls back without blocking user.
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
    // 1. Try Supabase app_config table if configured
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('key', 'version_control')
      .maybeSingle();

    if (!error && data) {
      const minVersion = data.min_version || CURRENT_APP_VERSION;
      const latestVersion = data.latest_version || CURRENT_APP_VERSION;
      const downloadUrl = data.download_url || DEFAULT_GITHUB_RELEASE_URL;
      const releaseNotes = data.release_notes || fallbackResult.releaseNotes;

      return {
        isUpdateRequired: compareSemver(CURRENT_APP_VERSION, minVersion) < 0,
        isUpdateAvailable: compareSemver(CURRENT_APP_VERSION, latestVersion) < 0,
        currentVersion: CURRENT_APP_VERSION,
        minSupportedVersion: minVersion,
        latestVersion,
        downloadUrl,
        releaseNotes,
      };
    }

    // 2. Otherwise query GitHub Releases API directly for latest tag
    try {
      const ghRes = await fetch('https://api.github.com/repos/richardhub10/E-Subli/releases/latest', {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      });
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        const tagVer = (ghData.tag_name || '').replace(/^v/, '');
        if (tagVer) {
          const isNewer = compareSemver(CURRENT_APP_VERSION, tagVer) < 0;
          return {
            isUpdateRequired: false,
            isUpdateAvailable: isNewer,
            currentVersion: CURRENT_APP_VERSION,
            minSupportedVersion: CURRENT_APP_VERSION,
            latestVersion: tagVer,
            downloadUrl: ghData.html_url || DEFAULT_GITHUB_RELEASE_URL,
            releaseNotes: ghData.body || fallbackResult.releaseNotes,
          };
        }
      }
    } catch (ghErr) {
      // Offline or network restricted - use safe local fallback
    }

    return fallbackResult;
  } catch (err) {
    return fallbackResult;
  }
}
