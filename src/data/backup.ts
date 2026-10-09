import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { INITIAL_STATE, loadState, saveState, todayKey, type AppState } from '@/data/storage';

/**
 * Backup = one JSON file with everything the app knows, photos included as
 * base64. Big (a few MB per dozen photos) but self-contained: save it to
 * iCloud, email it, restore it on a new phone.
 */
type Backup = {
  app: 'onward';
  version: 1;
  exportedOn: string;
  state: AppState;
  /** Photo file name → base64 contents */
  photoFiles: Record<string, string>;
};

function photosDir(): Directory {
  const dir = new Directory(Paths.document, 'photos');
  if (!dir.exists) dir.create();
  return dir;
}

export function backupSummary(counts: { days: number; weighIns: number; photos: number }): string {
  const { days, weighIns, photos } = counts;
  return `${days} logged day${days === 1 ? '' : 's'}, ${weighIns} weigh-in${weighIns === 1 ? '' : 's'}, ${photos} photo${photos === 1 ? '' : 's'}`;
}

/** Write the backup file and open the share sheet. Resolves false if sharing isn't available. */
export async function exportBackup(): Promise<boolean> {
  const state = await loadState();
  const photoFiles: Record<string, string> = {};
  if (Platform.OS !== 'web') {
    for (const p of state.photos) {
      try {
        const f = new File(photosDir(), p.file);
        if (f.exists) photoFiles[p.file] = await f.base64();
      } catch {
        // Skip a photo we can't read rather than fail the whole backup
      }
    }
  }
  const backup: Backup = { app: 'onward', version: 1, exportedOn: new Date().toISOString(), state, photoFiles };
  const name = `onward-backup-${todayKey()}.json`;

  if (Platform.OS === 'web') {
    const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(backup));
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Save your Onward backup' });
  return true;
}

export type RestoreResult = { ok: true; summary: string } | { ok: false; reason: string } | { ok: false; reason: 'cancelled' };

/** Pick a backup file and replace everything in the app with it */
export async function restoreBackup(): Promise<RestoreResult> {
  const picked = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'public.json', '*/*'], copyToCacheDirectory: true });
  if (picked.canceled || !picked.assets[0]) return { ok: false, reason: 'cancelled' };

  let text: string;
  try {
    if (Platform.OS === 'web') {
      const res = await fetch(picked.assets[0].uri);
      text = await res.text();
    } else {
      text = await new File(picked.assets[0].uri).text();
    }
  } catch {
    return { ok: false, reason: 'That file couldn’t be read.' };
  }

  let backup: Backup;
  try {
    backup = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'That isn’t an Onward backup file.' };
  }
  if (backup?.app !== 'onward' || !backup.state) return { ok: false, reason: 'That isn’t an Onward backup file.' };

  // Put the photo files back first so the restored state can display them
  if (Platform.OS !== 'web') {
    const dir = photosDir();
    for (const [name, b64] of Object.entries(backup.photoFiles ?? {})) {
      try {
        const f = new File(dir, name);
        if (f.exists) f.delete();
        f.create();
        f.write(b64, { encoding: 'base64' });
      } catch {
        // A photo that fails to write just won't show; the data still restores
      }
    }
  }

  const state: AppState = { ...INITIAL_STATE, ...backup.state };
  await saveState(state);
  return { ok: true, summary: backupSummary({ days: state.completed.length, weighIns: Object.keys(state.bodyWeight).length, photos: state.photos.length }) };
}
