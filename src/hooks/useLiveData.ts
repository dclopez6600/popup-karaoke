// ─────────────────────────────────────────────
//  PopUp Karaoke · Live Update Hook
//
//  This hook powers ALL real-time features:
//  - Polls the website every N seconds
//  - Opens a WebSocket for instant push updates
//  - Auto-reconnects on network loss
//  - Returns latest data + connection status
// ─────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { api, LiveStatus, Event, NowPlaying, Song, Review, SocialPost } from '../services/api';

// ── Config ─────────────────────────────────────
const POLL_INTERVAL_ACTIVE = 15_000;   // 15s when app is foregrounded
const POLL_INTERVAL_BG     = 60_000;   // 60s when app is backgrounded
const WS_URL = 'wss://karaoke-connect-dclopez6600.replit.app/ws';

// ── Types ──────────────────────────────────────

interface LiveDataState {
  liveStatus: LiveStatus | null;
  events: Event[];
  songs: Song[];
  reviews: Review[];
  socialFeed: SocialPost[];
  isConnected: boolean;
  isLive: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

interface UseLiveDataOptions {
  songQuery?: string;
  songGenre?: string;
  autoRefresh?: boolean;
}

// ── Hook ───────────────────────────────────────

export function useLiveData(options: UseLiveDataOptions = {}) {
  const { songQuery, songGenre, autoRefresh = true } = options;

  const [state, setState] = useState<LiveDataState>({
    liveStatus: null,
    events: [],
    songs: [],
    reviews: [],
    socialFeed: [],
    isConnected: false,
    isLive: false,
    lastUpdated: null,
    error: null,
  });

  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');

  // ── Fetch all data ─────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [liveStatus, events, songs, reviews, socialFeed] = await Promise.all([
        api.getLiveStatus(),
        api.getEvents(),
        api.getSongs(songQuery, songGenre),
        api.getReviews(),
        api.getSocialFeed(),
      ]);

      setState(prev => ({
        ...prev,
        liveStatus,
        events,
        songs,
        reviews,
        socialFeed,
        isLive: liveStatus.isLive,
        isConnected: true,
        lastUpdated: new Date(),
        error: null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: 'Could not reach server. Showing cached data.',
      }));
    } finally {
      setLoading(false);
    }
  }, [songQuery, songGenre]);

  // ── WebSocket connection ───────────────────────
  const connectWebSocket = useCallback(() => {
    // Skip WS in mock mode — polling is sufficient
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to live feed');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'now_playing_update':
              setState(prev => ({
                ...prev,
                liveStatus: prev.liveStatus
                  ? { ...prev.liveStatus, nowPlaying: msg.data }
                  : prev.liveStatus,
                lastUpdated: new Date(),
              }));
              break;

            case 'event_update':
              setState(prev => ({
                ...prev,
                events: prev.events.map(e => e.id === msg.data.id ? msg.data : e),
                lastUpdated: new Date(),
              }));
              break;

            case 'new_review':
              setState(prev => ({
                ...prev,
                reviews: [msg.data, ...prev.reviews],
                lastUpdated: new Date(),
              }));
              break;

            case 'social_post':
              setState(prev => ({
                ...prev,
                socialFeed: [msg.data, ...prev.socialFeed],
                lastUpdated: new Date(),
              }));
              break;

            case 'catalog_update':
              // Full song catalog refreshed — re-fetch
              api.getSongs(songQuery, songGenre).then(songs => {
                setState(prev => ({ ...prev, songs, lastUpdated: new Date() }));
              });
              break;

            case 'live_status':
              setState(prev => ({
                ...prev,
                liveStatus: msg.data,
                isLive: msg.data.isLive,
                lastUpdated: new Date(),
              }));
              break;
          }
        } catch {
          // Malformed message — ignore
        }
      };

      ws.onerror = () => {
        // WS unavailable — fall back to polling only
        ws.close();
      };

      ws.onclose = () => {
        wsRef.current = null;
        // Reconnect after 5s if app is active
        if (appStateRef.current === 'active' && autoRefresh) {
          setTimeout(connectWebSocket, 5000);
        }
      };
    } catch {
      // WebSocket not available (e.g., mock mode) — polling handles it
    }
  }, [songQuery, songGenre, autoRefresh]);

  // ── Polling loop ───────────────────────────────
  const startPolling = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    const interval = appStateRef.current === 'active'
      ? POLL_INTERVAL_ACTIVE
      : POLL_INTERVAL_BG;
    pollTimerRef.current = setInterval(fetchAll, interval);
  }, [fetchAll]);

  // ── App state changes (foreground/background) ──
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      appStateRef.current = nextState;
      if (nextState === 'active') {
        fetchAll();   // immediate refresh on foreground
        startPolling();
        connectWebSocket();
      } else {
        // Slow down polling in background
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(fetchAll, POLL_INTERVAL_BG);
      }
    });
    return () => sub.remove();
  }, [fetchAll, startPolling, connectWebSocket]);

  // ── Initial load ───────────────────────────────
  useEffect(() => {
    fetchAll();
    if (autoRefresh) {
      startPolling();
      connectWebSocket();
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      wsRef.current?.close();
    };
  }, [fetchAll, startPolling, connectWebSocket, autoRefresh]);

  // ── Re-fetch when search/genre changes ─────────
  useEffect(() => {
    api.getSongs(songQuery, songGenre).then(songs => {
      setState(prev => ({ ...prev, songs }));
    });
  }, [songQuery, songGenre]);

  return {
    ...state,
    loading,
    refresh: fetchAll,
  };
}

// ── Focused hooks (for individual screens) ──────

export function useNowPlaying(eventId?: string) {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    api.getNowPlaying(eventId).then(setNowPlaying);
    const fetchTimer = setInterval(() => {
      api.getNowPlaying(eventId).then(setNowPlaying);
    }, 10_000); // update every 10s

    return () => clearInterval(fetchTimer);
  }, [eventId]);

  // Local progress timer (runs every second)
  useEffect(() => {
    if (!nowPlaying) return;
    const start = new Date(nowPlaying.startedAt).getTime();
    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [nowPlaying]);

  const progress = nowPlaying
    ? Math.min(elapsed / nowPlaying.durationSeconds, 1)
    : 0;

  return { nowPlaying, elapsed, progress };
}
