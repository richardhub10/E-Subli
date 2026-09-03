import { supabase } from '../supabaseClient';
import appConfig from '../app.json';

export const CURRENT_APP_VERSION = appConfig.expo.version || '1.0.0';
export const DEFAULT_GITHUB_RELEASE_URL = 'https://expo.dev/accounts/richardhub10/projects/E-Subli/builds';
export const GITHUB_REPO_URL = 'https://github.com/richardhub10/E-Subli';

const REMOTE_VERSION_URL = 'https://raw.githubusercontent.com/richardhub10/E-Subli/master/version.json';
const REMOTE_APP_JSON_URL = 'https://raw.githubusercontent.com/richardhub10/E-Subli/master/app.json';

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
 * Checks for updates against live remote version.json on GitHub, app.json fallback,
 * or Supabase app_config table.
 */
export async function checkAppVersion(): Promise<VersionCheckResult> {
  const fallbackResult: VersionCheckResult = {
    isUpdateRequired: false,
    isUpdateAvailable: false,
    currentVersion: CURRENT_APP_VERSION,
    minSupportedVersion: CURRENT_APP_VERSION,
    latestVersion: CURRENT_APP_VERSION,
    downloadUrl: DEFAULT_GITHUB_RELEASE_URL,
    releaseNotes: 'Multiplayer synchronization, navigation improvements, and bug fixes.',
  };

  try {
    // 1. First priority: Check live remote version.json from GitHub master branch (cache-busted with timestamp)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${REMOTE_VERSION_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const latestVersion = data.latest_version || CURRENT_APP_VERSION;
        const minVersion = data.min_version || latestVersion;
        const downloadUrl = data.download_url || DEFAULT_GITHUB_RELEASE_URL;
        const releaseNotes = data.release_notes || fallbackResult.releaseNotes;

        const isUpdateAvailable = compareSemver(CURRENT_APP_VERSION, latestVersion) < 0;
        const isUpdateRequired = compareSemver(CURRENT_APP_VERSION, minVersion) < 0;

        return {
          isUpdateRequired,
          isUpdateAvailable,
          currentVersion: CURRENT_APP_VERSION,
          minSupportedVersion: minVersion,
          latestVersion,
          downloadUrl,
          releaseNotes,
        };
      }
    } catch (e) {
      // Fall through to second check
    }

    // 2. Secondary fallback: Check live remote app.json from GitHub
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${REMOTE_APP_JSON_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const appData = await res.json();
        const remoteVersion = appData?.expo?.version;
        if (remoteVersion) {
          const isNewer = compareSemver(CURRENT_APP_VERSION, remoteVersion) < 0;
          return {
            isUpdateRequired: isNewer,
            isUpdateAvailable: isNewer,
            currentVersion: CURRENT_APP_VERSION,
            minSupportedVersion: remoteVersion,
            latestVersion: remoteVersion,
            downloadUrl: DEFAULT_GITHUB_RELEASE_URL,
            releaseNotes: 'A new version of E-Subli is available. Please update to continue playing multiplayer.',
          };
        }
      }
    } catch (e) {
      // Fall through
    }

    // 3. Supabase app_config fallback if present
    try {
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
    } catch (e) {
      // Fall through
    }

    return fallbackResult;
  } catch (err) {
    return fallbackResult;
  }
}
