// ─────────────────────────────────────────────
//  PopUp Karaoke · App Entry Point v2.0
//  Redesigned & rebuilt — Daniel Lopez
// ─────────────────────────────────────────────

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation';
import { Colors } from './src/theme';
import { api } from './src/services/api';

export default function App() {
  useEffect(() => {
    // On startup, check if real backend endpoints are live
    api.checkBackendCapabilities().then(hasAPI => {
      if (hasAPI) {
        console.log('[API] Real backend detected — live mode enabled');
      } else {
        console.log('[API] Using mock data — connect your backend to go live');
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar style="light" />
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
