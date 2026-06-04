// ─────────────────────────────────────────────
//  PopUp Karaoke · App Entry Point v2.2
// ─────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { Colors } from './src/theme';
import { api } from './src/services/api';
import { refreshHomeData } from './src/services/homeContentService';
import {
  registerForPushNotifications,
  checkAndShowAnnouncements,
} from './src/services/notificationService';
import { trackOpenAndMaybePrompt } from './src/services/ratingService';

const ONBOARDED_KEY = '@puk_onboarded';

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null); // null = loading
  const appState = React.useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Check onboarding status
    AsyncStorage.getItem(ONBOARDED_KEY).then(val => {
      setOnboarded(val === 'true');
    });

    // Backend check
    api.checkBackendCapabilities().catch(() => {});

    // Push notifications
    registerForPushNotifications().catch(() => {});

    // Rating prompt (tracks opens)
    trackOpenAndMaybePrompt();

    // Initial data fetch + announcements
    refreshHomeData().then(data => {
      if (data.announcements?.length) {
        checkAndShowAnnouncements(data.announcements);
      }
    }).catch(() => {});

    // Auto-refresh on foreground
    const sub = AppState.addEventListener('change', async (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        const data = await refreshHomeData().catch(() => null);
        if (data?.announcements?.length) {
          checkAndShowAnnouncements(data.announcements);
        }
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    setOnboarded(true);
  };

  // Still checking — show nothing (splash handles this)
  if (onboarded === null) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar style="light" />
          {onboarded ? (
            <AppNavigator />
          ) : (
            <OnboardingScreen onDone={completeOnboarding} />
          )}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
});
