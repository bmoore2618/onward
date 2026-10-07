import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { displayUri, newPhotoId, pickImages, POSE_LABELS, POSES, type Photo, type Pose } from '@/data/photos';
import { dateFromKey, isValidDateKey, todayKey } from '@/data/storage';
import { useOnward } from '@/hooks/use-onward';
import { useTheme } from '@/hooks/use-theme';

type Session = { date: string; byPose: Partial<Record<Pose, Photo>> };

function label(date: string) {
  return dateFromKey(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Progress photos: sessions of front/side/back, first-vs-latest compare, add and edit */
export function ProgressPhotos() {
  const theme = useTheme();
  const onward = useOnward();
  const { photos, programDayFor } = onward;
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [viewing, setViewing] = useState<Photo | null>(null);

  const sessions = useMemo<Session[]>(() => {
    const map = new Map<string, Session>();
    for (const p of photos) {
      const s = map.get(p.date) ?? { date: p.date, byPose: {} };
      s.byPose[p.pose] = p;
      map.set(p.date, s);
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [photos]);

  const first = sessions[0];
  const latest = sessions.length > 1 ? sessions[sessions.length - 1] : undefined;

  const dayLabel = (date: string) => {
    const d = programDayFor(date);
    return d >= 1 ? `Day ${d} · ${label(date)}` : label(date);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      {first && latest && (
        <View style={styles.compare}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
            FIRST VS LATEST
          </ThemedText>
          <View style={styles.compareHeader}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.compareCol}>{dayLabel(first.date)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.compareCol}>{dayLabel(latest.date)}</ThemedText>
          </View>
          {POSES.filter((pose) => first.byPose[pose] || latest.byPose[pose]).map((pose) => (
            <View key={pose} style={styles.compareRow}>
              <Thumb photo={first.byPose[pose]} caption={POSE_LABELS[pose]} onPress={() => first.byPose[pose] && setViewing(first.byPose[pose]!)} />
              <Thumb photo={latest.byPose[pose]} caption={POSE_LABELS[pose]} onPress={() => latest.byPose[pose] && setViewing(latest.byPose[pose]!)} />
            </View>
          ))}
        </View>
      )}

      {sessions.length > 0 && (
        <View style={styles.sessions}>
          {[...sessions].reverse().map((s) => (
            <View key={s.date} style={styles.session}>
              <View style={styles.sessionHeader}>
                <ThemedText type="smallBold">{dayLabel(s.date)}</ThemedText>
                <Pressable onPress={() => setEditing(s.date)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Edit photos from ${label(s.date)}`}>
                  <ThemedText type="small" style={{ color: theme.accent }}>Edit</ThemedText>
                </Pressable>
              </View>
              <View style={styles.row}>
                {POSES.map((pose) => (
                  <Thumb key={pose} photo={s.byPose[pose]} caption={POSE_LABELS[pose]} onPress={() => (s.byPose[pose] ? setViewing(s.byPose[pose]!) : setEditing(s.date))} />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {sessions.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
          Front, side and back. Same spot, same light, same time of day. Once a week is plenty, and the first set is the one you&apos;ll be glad you took.
        </ThemedText>
      )}

      <Pressable onPress={() => setEditing('new')} accessibilityRole="button" style={({ pressed }) => [styles.button, { backgroundColor: theme.accent }, pressed && { opacity: 0.8 }]}>
        <ThemedText style={{ color: theme.accentText, fontWeight: 700 }}>Add photos</ThemedText>
      </Pressable>

      {editing && (
        <SessionEditor
          date={editing === 'new' ? null : editing}
          existing={editing === 'new' ? {} : (sessions.find((s) => s.date === editing)?.byPose ?? {})}
          onClose={() => setEditing(null)}
        />
      )}

      <Modal visible={!!viewing} animationType="fade" onRequestClose={() => setViewing(null)}>
        <Viewer photo={viewing} caption={viewing ? `${dayLabel(viewing.date)} · ${POSE_LABELS[viewing.pose]}` : ''} onClose={() => setViewing(null)} />
      </Modal>
    </View>
  );
}

function Thumb({ photo, caption, onPress }: { photo?: Photo; caption: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.thumbWrap} accessibilityRole="imagebutton" accessibilityLabel={photo ? `${caption} photo` : `Add ${caption.toLowerCase()} photo`}>
      {photo ? (
        <Image source={{ uri: displayUri(photo) }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty, { borderColor: theme.border }]}>
          <ThemedText themeColor="textSecondary">+</ThemedText>
        </View>
      )}
      <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
        {caption}
      </ThemedText>
    </Pressable>
  );
}

/**
 * Add or edit one session: a date (from the photo's own timestamp when we
 * have it, editable) and up to three poses.
 */
function SessionEditor({ date, existing, onClose }: { date: string | null; existing: Partial<Record<Pose, Photo>>; onClose: () => void }) {
  const theme = useTheme();
  const onward = useOnward();
  const [dateDraft, setDateDraft] = useState(date ?? '');
  const [slots, setSlots] = useState<Partial<Record<Pose, Photo>>>(existing);
  const [busy, setBusy] = useState(false);
  const isNew = date === null;
  const dateValid = isValidDateKey(dateDraft);

  const fill = async (source: 'camera' | 'library', pose?: Pose) => {
    if (busy) return;
    setBusy(true);
    try {
      const wanted = pose ? [pose] : POSES.filter((p) => !slots[p]);
      if (wanted.length === 0) return;
      const picked = await pickImages(source, pose ? 1 : wanted.length);
      if (picked.length === 0) return;
      const next = { ...slots };
      let taken: string | undefined;
      picked.forEach((img, i) => {
        const p = wanted[i];
        if (!p) return;
        next[p] = { id: next[p]?.id ?? newPhotoId(), date: dateDraft || todayKey(), pose: p, file: img.file, takenOn: img.takenOn };
        taken ??= img.takenOn;
      });
      setSlots(next);
      // First photo's own date fills the session date if none is set yet
      if (!dateDraft && taken) setDateDraft(taken);
      else if (!dateDraft) setDateDraft(todayKey());
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!dateValid) {
      Alert.alert('Check the date', 'Use the form 2026-10-05.');
      return;
    }
    const photos = POSES.flatMap((p) => (slots[p] ? [{ ...slots[p]!, date: dateDraft }] : []));
    if (date && date !== dateDraft) onward.moveSession(date, dateDraft);
    // Photos removed from a slot
    for (const p of POSES) if (existing[p] && !slots[p]) onward.removePhoto(existing[p]!.id);
    if (photos.length) onward.savePhotos(photos);
    onClose();
  };

  const removeAll = () =>
    Alert.alert('Delete this session?', 'Removes all three photos from Onward.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          for (const p of POSES) if (existing[p]) onward.removePhoto(existing[p]!.id);
          onClose();
        },
      },
    ]);

  const empty = POSES.filter((p) => !slots[p]).length;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.fill, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.editor} keyboardShouldPersistTaps="handled">
          <ThemedText style={styles.editorTitle}>{isNew ? 'New photo session' : 'Edit photo session'}</ThemedText>

          <View style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.fieldText}>
              <ThemedText>Date</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {dateDraft ? (dateValid ? 'Filled from the photo when it has one. Change it if needed.' : 'Use the form 2026-10-05.') : 'Set when you add a photo, or type it.'}
              </ThemedText>
            </View>
            <TextInput
              value={dateDraft}
              onChangeText={setDateDraft}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              maxLength={10}
              style={[styles.dateInput, { color: dateDraft && !dateValid ? '#C0392B' : theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              accessibilityLabel="Session date"
            />
          </View>

          <View style={styles.row}>
            {POSES.map((pose) => (
              <View key={pose} style={styles.slot}>
                <Thumb photo={slots[pose]} caption={POSE_LABELS[pose]} onPress={() => fill('camera', pose)} />
                <View style={styles.slotActions}>
                  <Pressable onPress={() => fill('camera', pose)} disabled={busy} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Take ${pose} photo`}>
                    <ThemedText type="small" style={{ color: theme.accent }}>Camera</ThemedText>
                  </Pressable>
                  <Pressable onPress={() => fill('library', pose)} disabled={busy} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Choose ${pose} photo`}>
                    <ThemedText type="small" style={{ color: theme.accent }}>Library</ThemedText>
                  </Pressable>
                  {slots[pose] && (
                    <Pressable onPress={() => setSlots({ ...slots, [pose]: undefined })} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Remove ${pose} photo`}>
                      <ThemedText type="small" themeColor="textSecondary">Remove</ThemedText>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>

          {empty > 1 && (
            <Pressable onPress={() => fill('library')} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.button, styles.buttonOutline, { borderColor: theme.accent }, pressed && { opacity: 0.6 }]}>
              <ThemedText style={{ color: theme.accent, fontWeight: 700 }}>Choose {empty} from library (front, side, back order)</ThemedText>
            </Pressable>
          )}

          <Pressable onPress={save} disabled={busy} accessibilityRole="button" style={({ pressed }) => [styles.button, { backgroundColor: theme.accent }, pressed && { opacity: 0.8 }]}>
            <ThemedText style={{ color: theme.accentText, fontWeight: 700 }}>Save</ThemedText>
          </Pressable>
          <Pressable onPress={onClose} accessibilityRole="button" style={styles.cancel}>
            <ThemedText themeColor="textSecondary">Cancel</ThemedText>
          </Pressable>
          {!isNew && (
            <Pressable onPress={removeAll} accessibilityRole="button" style={styles.cancel}>
              <ThemedText style={{ color: '#C0392B' }}>Delete session</ThemedText>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Viewer({ photo, caption, onClose }: { photo: Photo | null; caption: string; onClose: () => void }) {
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: '#000' }]}>
      {photo && (
        <>
          <Image source={{ uri: displayUri(photo) }} style={{ width, flex: 1 }} contentFit="contain" />
          <View style={styles.viewerBar}>
            <ThemedText style={styles.viewerCaption}>{caption}</ThemedText>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
              <ThemedText style={styles.viewerClose}>Close</ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  card: { borderRadius: 16, padding: Spacing.three, marginTop: Spacing.three, gap: Spacing.three },
  eyebrow: { letterSpacing: 1 },
  compare: { gap: Spacing.two },
  compareHeader: { flexDirection: 'row', gap: Spacing.two },
  compareCol: { flex: 1, textAlign: 'center' },
  compareRow: { flexDirection: 'row', gap: Spacing.two },
  sessions: { gap: Spacing.three },
  session: { gap: Spacing.one },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: Spacing.two },
  thumbWrap: { flex: 1, gap: Spacing.half },
  thumb: { width: '100%', aspectRatio: 3 / 4, borderRadius: 10 },
  thumbEmpty: { borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  caption: { textAlign: 'center' },
  empty: { lineHeight: 20 },
  button: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5 },
  cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  editor: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  editorTitle: { fontSize: 28, lineHeight: 34, fontWeight: 700 },
  field: { borderRadius: 16, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  fieldText: { flex: 1, gap: 2 },
  dateInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.two, height: 44, width: 132, fontSize: 16, fontWeight: 600, textAlign: 'center' },
  slot: { flex: 1, gap: Spacing.one },
  slotActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.two },
  viewerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.three },
  viewerCaption: { color: '#fff' },
  viewerClose: { color: '#fff', fontWeight: 600 },
});
