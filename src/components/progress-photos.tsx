import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { displayUri, type Photo } from '@/data/photos';
import { dateFromKey } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

function label(date: string) {
  return dateFromKey(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Progress photos: before/after pair, thumbnail grid, add and delete */
export function ProgressPhotos() {
  const theme = useTheme();
  const onward = useOnward();
  const { photos, programDayFor } = onward;
  const [open, setOpen] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const { width } = useWindowDimensions();

  const first = photos[0];
  const latest = photos.length > 1 ? photos[photos.length - 1] : undefined;

  const add = async (source: 'camera' | 'library') => {
    if (busy) return;
    setBusy(true);
    try {
      await onward.addPhoto(source);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (photo: Photo) =>
    Alert.alert('Delete this photo?', 'This only removes it from Onward.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onward.removePhoto(photo.id);
          setOpen(null);
        },
      },
    ]);

  const dayLabel = (p: Photo) => {
    const d = programDayFor(p.date);
    return d >= 1 ? `Day ${d} · ${label(p.date)}` : label(p.date);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      {first && latest && (
        <View style={styles.pair}>
          <PairSide photo={first} caption={dayLabel(first)} onPress={() => setOpen(first)} />
          <PairSide photo={latest} caption={dayLabel(latest)} onPress={() => setOpen(latest)} />
        </View>
      )}

      {photos.length > 0 && (
        <View style={styles.grid}>
          {[...photos].reverse().map((p) => (
            <Pressable key={p.id} onPress={() => setOpen(p)} style={styles.thumbWrap} accessibilityRole="imagebutton" accessibilityLabel={`Photo from ${label(p.date)}`}>
              <Image source={{ uri: displayUri(p) }} style={styles.thumb} contentFit="cover" />
              <ThemedText type="small" themeColor="textSecondary" style={styles.thumbCaption}>
                {label(p.date)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      {photos.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
          Same spot, same light, same time of day. Once a week is plenty. The first one is the one you&apos;ll be glad you took.
        </ThemedText>
      )}

      <View style={styles.actions}>
        <Pressable onPress={() => add('camera')} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.button, { backgroundColor: theme.accent }, pressed && { opacity: 0.8 }]}>
          <ThemedText style={{ color: theme.accentText, fontWeight: 700 }}>Take photo</ThemedText>
        </Pressable>
        <Pressable onPress={() => add('library')} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.button, styles.buttonOutline, { borderColor: theme.accent }, pressed && { opacity: 0.6 }]}>
          <ThemedText style={{ color: theme.accent, fontWeight: 700 }}>Choose photo</ThemedText>
        </Pressable>
      </View>

      <Modal visible={!!open} animationType="fade" onRequestClose={() => setOpen(null)}>
        <SafeAreaView style={[styles.viewer, { backgroundColor: '#000' }]}>
          {open && (
            <>
              <Image source={{ uri: displayUri(open) }} style={{ width, flex: 1 }} contentFit="contain" />
              <View style={styles.viewerBar}>
                <Pressable onPress={() => confirmDelete(open)} hitSlop={12} accessibilityRole="button">
                  <ThemedText style={styles.viewerDelete}>Delete</ThemedText>
                </Pressable>
                <ThemedText style={styles.viewerCaption}>{dayLabel(open)}</ThemedText>
                <Pressable onPress={() => setOpen(null)} hitSlop={12} accessibilityRole="button">
                  <ThemedText style={styles.viewerClose}>Close</ThemedText>
                </Pressable>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function PairSide({ photo, caption, onPress }: { photo: Photo; caption: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.pairSide} accessibilityRole="imagebutton" accessibilityLabel={caption}>
      <Image source={{ uri: displayUri(photo) }} style={styles.pairImage} contentFit="cover" />
      <ThemedText type="small" themeColor="textSecondary" style={styles.thumbCaption}>
        {caption}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, marginTop: Spacing.three, gap: Spacing.three },
  pair: { flexDirection: 'row', gap: Spacing.two },
  pairSide: { flex: 1, gap: Spacing.one },
  pairImage: { width: '100%', aspectRatio: 3 / 4, borderRadius: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  thumbWrap: { width: '31%', gap: Spacing.half },
  thumb: { width: '100%', aspectRatio: 3 / 4, borderRadius: 10 },
  thumbCaption: { textAlign: 'center' },
  empty: { lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing.two },
  button: { flex: 1, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5 },
  viewer: { flex: 1 },
  viewerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.three },
  viewerDelete: { color: '#FF6B6B', fontWeight: 600 },
  viewerCaption: { color: '#fff' },
  viewerClose: { color: '#fff', fontWeight: 600 },
});
