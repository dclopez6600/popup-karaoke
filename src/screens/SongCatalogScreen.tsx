// ─────────────────────────────────────────────
//  SongsScreen — Search live karaoke catalog
//  Data: fetched live from popupkaraoke.net/catalog-data.js
//  Falls back to bundled assets/songs.json on failure
// ─────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCatalog, getCachedCatalog, onCatalogReady, refreshCatalog } from '../services/catalogService';
import type { SongRow } from '../services/catalogService';
import { getHomeData, DEFAULT_HOME_DATA } from '../services/homeContentService';
import type { HomeSong, HomeCrowdCategory } from '../services/homeContentService';
import SongRequestModal from '../components/SongRequestModal';

// ── Genre / Language filters ───────────────────────────
const GENRES = ['All', 'Pop', 'Rock', 'Country', 'Hip-Hop', 'R&B', 'Latin', 'Electronic', 'Jazz', 'Blues', 'Soundtrack', 'Classical'];
const LANGUAGES = ['All', 'English', 'Spanish', 'French', 'German'];
const FAVORITES_KEY = '@puk_favorite_songs';

function songKey(title: string, artist: string) { return `${title}|||${artist}`; }

// ── Sub-Components ────────────────────────────────────

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SongItem({ item, index, isFav, onToggleFav }: {
  item: SongRow; index: number;
  isFav: boolean; onToggleFav: () => void;
}) {
  const [title, artist, styles_str, language, duo] = item;
  const genres = styles_str ? styles_str.split(',').slice(0, 2) : [];

  return (
    <View style={[songStyles.row, index === 0 && songStyles.rowFirst]}>
      <View style={songStyles.icon}>
        <Ionicons name="musical-note" size={16} color={Colors.primary} />
      </View>
      <View style={songStyles.info}>
        <Text style={songStyles.title} numberOfLines={1}>{title}</Text>
        <Text style={songStyles.artist} numberOfLines={1}>{artist}</Text>
        <View style={songStyles.badges}>
          {genres.map(g => (
            <View key={g} style={songStyles.badge}>
              <Text style={songStyles.badgeText}>{g.trim()}</Text>
            </View>
          ))}
          {language !== 'English' && language ? (
            <View style={[songStyles.badge, songStyles.badgeLang]}>
              <Text style={[songStyles.badgeText, { color: Colors.cyan }]}>{language}</Text>
            </View>
          ) : null}
          {duo === 1 && (
            <View style={[songStyles.badge, songStyles.badgeDuo]}>
              <Text style={[songStyles.badgeText, { color: Colors.accent }]}>🎤🎤 Duet</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={onToggleFav} activeOpacity={0.7} style={{ padding: 6 }}>
        <Ionicons name={isFav ? 'star' : 'star-outline'} size={20} color={isFav ? Colors.gold : Colors.border} />
      </TouchableOpacity>
    </View>
  );
}

const songStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rowFirst: { borderTopWidth: 0 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(123,47,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginBottom: 2 },
  artist: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  badge: {
    backgroundColor: 'rgba(123,47,255,0.12)',
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeLang: { backgroundColor: 'rgba(0,229,255,0.1)' },
  badgeDuo: { backgroundColor: 'rgba(255,45,139,0.1)' },
  badgeText: { color: Colors.primary, fontSize: 10, fontWeight: FontWeight.medium },
});

// ── Main Screen ───────────────────────────────────────

export default function SongsScreen() {
  const [loading, setLoading] = useState(true);
  const [songCount, setSongCount] = useState<number>(0);
  const [liveUpdated, setLiveUpdated] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [language, setLanguage] = useState('All');
  const [duetOnly, setDuetOnly] = useState(false);
  const [results, setResults] = useState<SongRow[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [top100, setTop100] = useState<HomeSong[]>(DEFAULT_HOME_DATA.top100);
  const [newAdditions, setNewAdditions] = useState<HomeSong[]>(DEFAULT_HOME_DATA.newAdditions);
  const [crowdFavorites, setCrowdFavorites] = useState<HomeCrowdCategory[]>(DEFAULT_HOME_DATA.crowdFavorites);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load favorites from storage
  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then(raw => {
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    });
  }, []);

  const toggleFavorite = useCallback(async (title: string, artist: string) => {
    const key = songKey(title, artist);
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Load live data from website
  useEffect(() => {
    getHomeData(live => {
      if (live.top100?.length) setTop100(live.top100);
      if (live.newAdditions?.length) setNewAdditions(live.newAdditions);
      if (live.crowdFavorites?.length) setCrowdFavorites(live.crowdFavorites);
    });
  }, []);

  // Load catalog on mount
  useEffect(() => {
    const timer = setTimeout(async () => {
      const songs = await getCatalog();
      setSongCount(songs.length);
      setLoading(false);

      // Subscribe to live update — re-render with count when it arrives
      const unsub = onCatalogReady(live => {
        setSongCount(live.length);
        setLiveUpdated(true);
        // Re-run current search if active
        setDebouncedQuery(prev => prev); // trigger search effect
      });
      return unsub;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(query), 350);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query]);

  // Run search whenever filters change
  useEffect(() => {
    const catalog = getCachedCatalog();
    if (!catalog) return;

    const q = debouncedQuery.trim().toLowerCase();
    const isFiltered = q.length > 0 || genre !== 'All' || language !== 'All' || duetOnly;

    if (!isFiltered) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);

    const filtered = catalog.filter(([title, artist, styles_str, lang, duo]: SongRow) => {
      if (showFavOnly && !favorites.has(songKey(title, artist))) return false;
      if (q && !title.toLowerCase().includes(q) && !artist.toLowerCase().includes(q)) return false;
      if (genre !== 'All' && !styles_str.toLowerCase().includes(genre.toLowerCase())) return false;
      if (language !== 'All' && lang !== language) return false;
      if (duetOnly && duo !== 1) return false;
      return true;
    });

    setResults(filtered.slice(0, 100));
  }, [debouncedQuery, genre, language, duetOnly, liveUpdated, showFavOnly, favorites]);

  const clearAll = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setGenre('All');
    setLanguage('All');
    setDuetOnly(false);
    setResults([]);
    setHasSearched(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const songs = await refreshCatalog();
    setSongCount(songs.length);
    setRefreshing(false);
    // Re-run search with fresh data
    setDebouncedQuery(q => q);
  }, []);

  const countLabel = songCount > 0 ? `${songCount.toLocaleString()} tracks` : 'Loading…';

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading catalog…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Sticky Search Header ─── */}
      <View style={styles.searchHeader}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>🎵 Song Checker</Text>
            <Text style={styles.headerSub}>{countLabel} — search by title or artist</Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshBtn, refreshing && styles.refreshBtnActive]}
            onPress={handleRefresh}
            activeOpacity={0.7}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by song title or artist…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 8 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Genre filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingRight: 16 }}>
          {GENRES.map(g => (
            <FilterChip key={g} label={g} active={genre === g} onPress={() => setGenre(g)} />
          ))}
        </ScrollView>

        {/* Language + Duet row */}
        <View style={styles.filterSecondRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 6, paddingRight: 8 }}>
            {LANGUAGES.map(l => (
              <FilterChip key={l} label={l} active={language === l} onPress={() => setLanguage(l)} />
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.duetToggle, duetOnly && styles.duetToggleActive]}
            onPress={() => setDuetOnly(d => !d)}
            activeOpacity={0.7}
          >
            <Text style={[styles.duetToggleText, duetOnly && styles.duetToggleTextActive]}>🎤🎤 Duets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.duetToggle, showFavOnly && { borderColor: Colors.gold, backgroundColor: 'rgba(255,215,0,0.12)' }]}
            onPress={() => { setShowFavOnly(f => !f); if (!showFavOnly) setHasSearched(true); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.duetToggleText, showFavOnly && { color: Colors.gold }]}>⭐ My Songs {favorites.size > 0 ? `(${favorites.size})` : ''}</Text>
          </TouchableOpacity>
        </View>

        {/* Request a Song — always visible under search */}
        <TouchableOpacity
          style={styles.requestCtaInline}
          onPress={() => setShowRequestModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="musical-notes-outline" size={15} color={Colors.primary} />
          <Text style={styles.requestCtaInlineText}>🎵 Don't see your song? Request it →</Text>
        </TouchableOpacity>

        {/* Result count + clear */}
        {hasSearched && (
          <View style={styles.resultMeta}>
            <Text style={styles.resultCount}>
              {results.length === 100 ? '100+ matches' : `${results.length} song${results.length !== 1 ? 's' : ''} found`}
            </Text>
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearBtn}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ─── Results / Default State ─── */}
      {!hasSearched ? (
        <ScrollView contentContainerStyle={styles.defaultContent}>
          {/* ── New Additions ── */}
          {newAdditions.length > 0 && (
            <>
              <Text style={styles.popularLabel}>✨ Latest Additions</Text>
              <View style={[styles.top100Card, { marginBottom: 16 }]}>
                {newAdditions.map((s, i) => (
                  <View key={i} style={[styles.top100Row, i > 0 && styles.top100RowBorder]}>
                    <View style={[styles.top100NumCircle, { backgroundColor: Colors.accent }]}>
                      <Text style={styles.top100NumText}>N</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.top100Title} numberOfLines={1}>{s.title}</Text>
                      <Text style={styles.top100Artist} numberOfLines={1}>{s.artist}</Text>
                    </View>
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── Crowd Favorites by Vibe ── */}
          {crowdFavorites.length > 0 && (
            <>
              <Text style={styles.popularLabel}>🎯 Favorites by Vibe</Text>
              {crowdFavorites.map((cat, ci) => (
                <View key={ci} style={[styles.top100Card, { marginBottom: 12 }]}>
                  <View style={styles.crowdHeader}>
                    <Text style={styles.crowdCat}>{cat.category}</Text>
                    <Text style={styles.crowdCatDesc}>{cat.desc}</Text>
                  </View>
                  {cat.songs.map((s, si) => (
                    <View key={si} style={[styles.top100Row, si > 0 && styles.top100RowBorder]}>
                      <Ionicons name="musical-note" size={14} color={Colors.primary} style={{ marginLeft: 4 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.top100Title}>{s.title}</Text>
                        <Text style={styles.top100Artist}>{s.artist}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}

          <Text style={styles.popularLabel}>🔥 Top 100 US</Text>
          <View style={styles.top100Card}>
            {top100.map((s, i) => (
              <View key={i} style={[styles.top100Row, i > 0 && styles.top100RowBorder]}>
                <View style={styles.top100NumCircle}>
                  <Text style={styles.top100NumText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.top100Title} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.top100Artist} numberOfLines={1}>{s.artist}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.requestNote}>We'll do our best to add it before your event</Text>
        </ScrollView>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No songs found</Text>
          <Text style={styles.emptySubtitle}>Try a different search term or clear your filters.</Text>
          <TouchableOpacity
            style={styles.requestCta}
            onPress={() => setShowRequestModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.requestCtaText}>🎵 Request This Song →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => (
            <SongItem
              item={item} index={index}
              isFav={favorites.has(songKey(item[0], item[1]))}
              onToggleFav={() => toggleFavorite(item[0], item[1])}
            />
          )}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            results.length === 100 ? (
              <Text style={styles.limitNote}>Showing top 100 matches — refine your search to narrow results.</Text>
            ) : null
          }
        />
      )}

      <SongRequestModal visible={showRequestModal} onClose={() => setShowRequestModal(false)} />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.md },

  // Header
  searchHeader: {
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: 2 },
  headerSub: { color: Colors.textSecondary, fontSize: FontSize.sm },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  refreshBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(123,47,255,0.1)' },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },

  // Filters
  filterRow: { marginBottom: 8 },
  filterSecondRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    backgroundColor: Colors.bgInput,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(123,47,255,0.15)' },
  chipText: { color: Colors.textMuted, fontSize: FontSize.sm },
  chipTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  duetToggle: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.bgInput,
    flexShrink: 0,
  },
  duetToggleActive: { borderColor: Colors.accent, backgroundColor: 'rgba(255,45,139,0.12)' },
  duetToggleText: { color: Colors.textMuted, fontSize: FontSize.sm },
  duetToggleTextActive: { color: Colors.accent, fontWeight: FontWeight.semibold },

  // Inline request CTA (under search bar)
  requestCtaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  requestCtaInlineText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // Result meta
  resultMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  resultCount: { color: Colors.textSecondary, fontSize: FontSize.sm },
  clearBtn: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  limitNote: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', paddingVertical: 8, paddingHorizontal: Spacing.md },

  // List
  listContent: { paddingBottom: 120 },

  // Default / empty
  defaultContent: { padding: Spacing.md, paddingBottom: 120 },
  popularLabel: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: 12 },
  top100Card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: 16,
  },
  top100Row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  top100RowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  top100NumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  top100NumText: { color: '#fff', fontSize: 12, fontWeight: FontWeight.bold },
  top100Title: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  top100Artist: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 1 },
  crowdHeader: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  crowdCat: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  crowdCatDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  newBadge: { backgroundColor: Colors.cyan, borderRadius: Radius.pill, paddingHorizontal: 6, paddingVertical: 2, flexShrink: 0 },
  newBadgeText: { color: '#000', fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 10 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  emptySubtitle: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' },

  // CTA
  requestCta: {
    backgroundColor: 'rgba(123,47,255,0.12)',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: 8,
    marginBottom: 4,
  },
  requestCtaText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  requestNote: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginTop: 4 },
});
