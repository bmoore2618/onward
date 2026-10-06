import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { todayKey } from '@/data/storage';

export type Photo = {
  id: string;
  /** Local date the photo was added, YYYY-MM-DD */
  date: string;
  /** File name inside the app's photos folder */
  file: string;
};

function photosDir(): Directory {
  const dir = new Directory(Paths.document, 'photos');
  if (!dir.exists) dir.create();
  return dir;
}

/** Full URI for displaying a stored photo */
export function photoUri(photo: Photo): string {
  return new File(photosDir(), photo.file).uri;
}

/**
 * Open the camera or photo library, then copy the chosen image into the
 * app's own folder so it survives even if the original is deleted.
 * Returns null if the user cancels or declines permission.
 */
export async function pickPhoto(source: 'camera' | 'library'): Promise<Photo | null> {
  if (Platform.OS === 'web' && source === 'camera') source = 'library';

  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, allowsEditing: false };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ext = (asset.fileName?.split('.').pop() ?? asset.uri.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const file = `${id}.${ext}`;

  if (Platform.OS === 'web') {
    // No file system on web; keep the blob/data URI the picker gave us
    return { id, date: todayKey(), file: asset.uri };
  }

  const dest = new File(photosDir(), file);
  await new File(asset.uri).copy(dest);
  return { id, date: todayKey(), file };
}

export function deletePhotoFile(photo: Photo): void {
  if (Platform.OS === 'web') return;
  try {
    const f = new File(photosDir(), photo.file);
    if (f.exists) f.delete();
  } catch {
    // Already gone; nothing to do
  }
}

/** On web the "file" is already a full URI */
export function displayUri(photo: Photo): string {
  return Platform.OS === 'web' ? photo.file : photoUri(photo);
}
