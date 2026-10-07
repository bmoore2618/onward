import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { todayKey } from '@/data/storage';

export type Pose = 'front' | 'side' | 'back';
export const POSES: Pose[] = ['front', 'side', 'back'];
export const POSE_LABELS: Record<Pose, string> = { front: 'Front', side: 'Side', back: 'Back' };

export type Photo = {
  id: string;
  /** Session date, YYYY-MM-DD. Photos on the same date form one session. */
  date: string;
  pose: Pose;
  /** File name inside the app's photos folder (full URI on web) */
  file: string;
  /** When the camera says the photo was taken, if known (YYYY-MM-DD) */
  takenOn?: string;
};

/** A picked image copied into app storage, before it's assigned a pose/date */
export type PickedImage = { file: string; takenOn?: string };

function photosDir(): Directory {
  const dir = new Directory(Paths.document, 'photos');
  if (!dir.exists) dir.create();
  return dir;
}

/** Full URI for displaying a stored photo */
export function displayUri(photo: Pick<Photo, 'file'>): string {
  return Platform.OS === 'web' ? photo.file : new File(photosDir(), photo.file).uri;
}

/** EXIF dates look like "2026:10:05 07:12:33" */
function dateFromExif(exif: Record<string, unknown> | null | undefined): string | undefined {
  const raw = exif?.DateTimeOriginal ?? exif?.DateTimeDigitized ?? exif?.DateTime;
  if (typeof raw !== 'string') return undefined;
  const m = raw.match(/^(\d{4}):(\d{2}):(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : undefined;
}

/**
 * Open the camera (one photo) or the library (up to `limit` photos), then
 * copy each image into the app's own folder so it survives even if the
 * original is deleted. Returns [] if the user cancels or declines permission.
 */
export async function pickImages(source: 'camera' | 'library', limit = 1): Promise<PickedImage[]> {
  if (Platform.OS === 'web' && source === 'camera') source = 'library';

  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return [];

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.8,
    exif: true,
    allowsMultipleSelection: source === 'library' && limit > 1,
    selectionLimit: limit,
    orderedSelection: true,
  };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return [];

  const out: PickedImage[] = [];
  for (const asset of result.assets.slice(0, limit)) {
    const takenOn = dateFromExif(asset.exif) ?? (source === 'camera' ? todayKey() : undefined);
    if (Platform.OS === 'web') {
      out.push({ file: asset.uri, takenOn });
      continue;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = (asset.fileName?.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const file = `${id}.${ext}`;
    await new File(asset.uri).copy(new File(photosDir(), file));
    out.push({ file, takenOn });
  }
  return out;
}

export function deletePhotoFile(photo: Pick<Photo, 'file'>): void {
  if (Platform.OS === 'web') return;
  try {
    const f = new File(photosDir(), photo.file);
    if (f.exists) f.delete();
  } catch {
    // Already gone; nothing to do
  }
}

export function newPhotoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
