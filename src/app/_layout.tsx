import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { OnwardProvider } from '@/hooks/use-onward';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <OnwardProvider>
        <AnimatedSplashOverlay />
        <NativeTabs tintColor={colors.accent} labelStyle={{ selected: { color: colors.accent } }}>
          <NativeTabs.Trigger name="index">
            <NativeTabs.Trigger.Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} md="today" />
            <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="progress">
            <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} md="calendar_month" />
            <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        </NativeTabs>
      </OnwardProvider>
    </ThemeProvider>
  );
}
