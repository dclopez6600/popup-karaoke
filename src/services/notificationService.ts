// ─────────────────────────────────────────────
//  notificationService — Push + local notifications
//
//  HOW NOTIFICATIONS WORK:
//  Add items to the "announcements" array in home-data.json.
//  Each item needs a unique "id". When the app launches or
//  comes to foreground, it checks if there's a new id it
//  hasn't shown yet. If so, it fires a local notification.
//
//  Example home-data.json entry:
//  "announcements": [
//    { "id": "jun-2026-1", "title": "New Show Added!", "body": "We're now at Moods every Thursday 8–11 PM." }
//  ]
// ─────────────────────────────────────────────

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SHOWN_IDS_KEY = '@puk_shown_notification_ids';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ── Request permission and get push token ─────
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null; // simulators can't receive push

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  // Android channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'PopUp Karaoke',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7c3aed',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

// ── Fire a local notification immediately ─────
export async function showLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null, // fire immediately
  });
}

// ── Check announcements from home-data.json ───
export interface Announcement {
  id: string;
  title: string;
  body: string;
}

export async function checkAndShowAnnouncements(announcements: Announcement[]) {
  if (!announcements?.length) return;

  try {
    const raw = await AsyncStorage.getItem(SHOWN_IDS_KEY);
    const shownIds: string[] = raw ? JSON.parse(raw) : [];
    let newCount = 0;

    for (const ann of announcements) {
      if (!shownIds.includes(ann.id)) {
        await showLocalNotification(ann.title, ann.body);
        shownIds.push(ann.id);
        newCount++;
      }
    }

    await AsyncStorage.setItem(SHOWN_IDS_KEY, JSON.stringify(shownIds));

    // Update app icon badge count
    await Notifications.setBadgeCountAsync(newCount > 0 ? newCount : 0);
  } catch (e) {
    // silently ignore storage errors
  }
}
