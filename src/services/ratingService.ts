// ─────────────────────────────────────────────
//  ratingService — App Store rating prompt
//  Prompts after 3 app opens, only once ever.
// ─────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const OPENS_KEY  = '@puk_app_opens';
const RATED_KEY  = '@puk_has_rated';
const PROMPT_AFTER = 3;

export async function trackOpenAndMaybePrompt() {
  try {
    const hasRated = await AsyncStorage.getItem(RATED_KEY);
    if (hasRated) return;

    const raw = await AsyncStorage.getItem(OPENS_KEY);
    const opens = raw ? parseInt(raw, 10) : 0;
    const newOpens = opens + 1;
    await AsyncStorage.setItem(OPENS_KEY, String(newOpens));

    if (newOpens >= PROMPT_AFTER && await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(RATED_KEY, 'true');
    }
  } catch {
    // ignore — never crash over rating logic
  }
}
