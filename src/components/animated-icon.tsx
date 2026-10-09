import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/** Matches the native splash background in app.json */
const SPLASH_BG = '#E9F3EA';
const DURATION = 500;

/**
 * Covers the screen with the brand splash (same green and mark as the native
 * splash) until the first layout, then fades out. Keeps the launch seamless.
 */
export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  // Web has no native splash to blend with, and hideAsync never resolves there
  if (Platform.OS === 'web' || !visible) return null;

  const fadeOut = new Keyframe({
    0: { opacity: 1 },
    100: { opacity: 0, easing: Easing.out(Easing.quad) },
  });

  const mark = <Image style={styles.mark} source={require('@/assets/images/splash-icon.png')} contentFit="contain" />;

  return animate ? (
    <Animated.View
      entering={fadeOut.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) scheduleOnRN(setVisible, false);
      })}
      style={styles.overlay}>
      {mark}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
          // Belt and braces: the animation callback doesn't always fire on web
          setTimeout(() => setVisible(false), DURATION + 100);
        });
      }}
      style={styles.overlay}>
      {mark}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  mark: { width: 140, height: 140 },
});
