// ─────────────────────────────────────────────
//  catalogService — fetches live song catalog
//  from popupkaraoke.net/catalog-data.js
//  Falls back to bundled assets/songs.json
// ─────────────────────────────────────────────

const CATALOG_URL = 'https://popupkaraoke.net/catalog-data.js';
const LAST_COUNT_KEY = '@puk_last_catalog_count';

// ── New-song push notification ────────────────
async function maybeNotifyNewSongs(newCount: number): Promise<void> {
  try {
    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    const raw = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem(LAST_COUNT_KEY));
    const lastCount = raw ? parseInt(raw, 10) : 0;

    if (lastCount > 0 && newCount > lastCount) {
      const added = newCount - lastCount;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✨ New Karaoke Songs Added!',
          body: `${added.toLocaleString()} new song${added === 1 ? '' : 's'} just added to the catalog. Check them out!`,
          data: { screen: 'Songs' },
        },
        trigger: null, // fire immediately
      });
    }

    await import('@react-native-async-storage/async-storage').then(m => m.default.setItem(LAST_COUNT_KEY, String(newCount)));
  } catch { /* notifications optional */ }
}

// App's internal song row: [title, artist, genre, language, duo]
export type SongRow = [string, string, string, string, number];

// Language code → full name (matches filter chips in SongCatalogScreen)
const LANG_MAP: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
};

function convertWebSong(s: { t: string; a: string; g?: string; l?: string; d?: number }): SongRow {
  return [
    s.t,
    s.a,
    s.g || '',
    LANG_MAP[s.l || 'en'] || 'English',
    s.d ? 1 : 0,
  ];
}

// ── Module-level state ────────────────────────
let _cache: SongRow[] | null = null;
// Single shared promise — all callers share one network request per session
let _liveFetchPromise: Promise<SongRow[]> | null = null;
// Listeners notified when live data arrives
const _listeners: Set<(songs: SongRow[]) => void> = new Set();

// ── Fetch live catalog from website ──────────
function startLiveFetch(): Promise<SongRow[]> {
  if (_liveFetchPromise) return _liveFetchPromise;

  _liveFetchPromise = fetch(CATALOG_URL, {
    headers: { Accept: 'application/javascript' },
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(js => {
      // File format: var CATALOG_DATA=[{t,a,g,l,d?}...]
      const startIdx = js.indexOf('[');
      const endIdx = js.lastIndexOf(']');
      if (startIdx === -1 || endIdx === -1) throw new Error('Could not locate JSON array');
      const raw: { t: string; a: string; g?: string; l?: string; d?: number }[] =
        JSON.parse(js.slice(startIdx, endIdx + 1));
      const songs = raw.map(convertWebSong);
      _cache = songs;
      // Notify all subscribers
      _listeners.forEach(cb => cb(songs));
      _listeners.clear();
      // Fire push notification if song count grew
      maybeNotifyNewSongs(songs.length).catch(() => {});
      return songs;
    })
    .catch(err => {
      // Reset so next refreshCatalog() can retry
      _liveFetchPromise = null;
      _listeners.clear();
      throw err;
    });

  return _liveFetchPromise;
}

// ── Load bundled fallback ─────────────────────
function loadBundled(): SongRow[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../../assets/songs.json') as SongRow[];
}

// ── Public API ────────────────────────────────

/**
 * Get the full catalog. Returns bundled data immediately while fetching
 * the live version in the background. Subsequent calls return cached data.
 */
export async function getCatalog(): Promise<SongRow[]> {
  if (_cache) return _cache;
  // Seed with bundled data so the caller can render immediately
  _cache = loadBundled();
  // Fire-and-forget live fetch (shared — won't double-fetch)
  startLiveFetch().catch(() => {/* keep bundled on error */});
  return _cache;
}

/**
 * Synchronously return the current in-memory cache.
 * Returns null if getCatalog() hasn't been called yet.
 */
export function getCachedCatalog(): SongRow[] | null {
  return _cache;
}

/**
 * Subscribe to the live catalog update. Callback fires once when the
 * network fetch completes. If data is already live, fires immediately.
 * Returns an unsubscribe function.
 */
export function onCatalogReady(callback: (songs: SongRow[]) => void): () => void {
  // If live fetch already completed, call immediately
  if (_liveFetchPromise && _cache && _listeners.size === 0) {
    callback(_cache);
    return () => {};
  }
  _listeners.add(callback);
  startLiveFetch().catch(() => {/* ignore */});
  return () => { _listeners.delete(callback); };
}

/**
 * Force a fresh fetch from the website, replacing the cache.
 * Use this for a manual "Refresh" action.
 */
export async function refreshCatalog(): Promise<SongRow[]> {
  _liveFetchPromise = null;
  _cache = null;
  try {
    return await startLiveFetch();
  } catch {
    _cache = loadBundled();
    return _cache;
  }
}
