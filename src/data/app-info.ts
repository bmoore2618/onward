import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Updates from 'expo-updates';

/** Where tester feedback goes; also the privacy contact */
export const FEEDBACK_EMAIL = 'bmoore2618@gmail.com';

/** Public privacy policy (docs/privacy.md in the GitHub repo) */
export const PRIVACY_URL = 'https://raw.githubusercontent.com/bmoore2618/onward/main/docs/privacy.md';

/**
 * "1.0.0 (3) · update 4f2a9c1e" in a TestFlight build, "1.0.0 · development"
 * in Expo Go. The update id says which over-the-air update is running.
 */
export function versionLabel(): string {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build = Constants.platform?.ios?.buildNumber;
  const base = build ? `${version} (${build})` : version;
  if (__DEV__) return `${base} · development`;
  if (Updates.updateId && !Updates.isEmbeddedLaunch) return `${base} · update ${Updates.updateId.slice(0, 8)}`;
  return base;
}

/** A pre-filled feedback email: the version and phone are filled in so testers don't have to */
export function feedbackMailto(): string {
  const subject = `Onward feedback (${versionLabel()})`;
  const device = [Device.modelName, Device.osName && Device.osVersion ? `${Device.osName} ${Device.osVersion}` : null].filter(Boolean).join(', ');
  const body = [
    'What happened, or what would you change?',
    '',
    '',
    'What screen were you on?',
    '',
    '',
    '---',
    `App: ${versionLabel()}`,
    device ? `Phone: ${device}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n');
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
