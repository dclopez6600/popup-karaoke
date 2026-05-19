// ─────────────────────────────────────────────
//  Song Catalog Screen — Browse & search songs
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, FlatList,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLiveData } from '../hooks/useLiveData';
import { Song } from '../services/api';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';

const GENRES = ['All', 'Pop', 'Rock', 'R&B', 'Hip-Hop', 'Country', '80s', '90s', '2000s', '2010s', '2020s'];

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function SongCard({ song, onFavorite }: { song: Song; onFavorite: (id: string) => void }) {
  return (
    <View style={styles.songCard}>
      {/* Album art placeholder */}
      <LinearGradient
        colors={[Colors.primary + '55', Colors.accent + '33']}
        style={styles.albumArt}
      >
        <Ionicons name="musical-note" size={22} color="rgba(255,255,255,0.6)" />
      </LinearGradient>

      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
        <View style={styles.songMeta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{song.key}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{song.bpm} BPM</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{song.decade}</Text>
          </View>
        </View>
      </View>

      <View style={styles.songRight}>
        <TouchableOpacity onPress={() => onFavorite(song.id)} style={styles.favoriteBtn}>
          <Ionicons
            name={song.isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={song.isFavorite ? Colors.accent : Colors.textMuted}
          />
        </TouchableOpacity>
        <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
        <View style={styles.playCount}>
          <Ionicons name="play-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.playCountText}>{song.playCount.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

export default function SongCatalogScreen() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'popularity' | 'title' | 'artist'>('popularity');

  const { songs, lastUpdated, isConnected } = useLiveData({
    songQuery: query,
    songGenre: genre,
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sortedSongs = [...songs].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
    return b.playCount - a.playCount; // popularity
  }).map(s => ({ ...s, isFavorite: favorites.has(s.id) }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0F0A20', Colors.bg]} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Song Catalog</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerCount}>{songs.length} songs</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs or artists..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Genre filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.genreScroll}
          contentContainerStyle={styles.genreContent}
        >
          {GENRES.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.genrePill, genre === g && styles.genrePillActive]}
              onPress={() => setGenre(g)}
            >
              <Text style={[styles.genrePillText, genre === g && styles.genrePillTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {(['popularity', 'title', 'artist'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
            onPress={() => setSortBy(s)}
          >
            <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            {isConnected ? '🟢' : '🔴'} Live
          </Text>
        )}
      </View>

      {/* Songs */}
      <FlatList
        data={sortedSongs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SongCard song={item} onFavorite={toggleFavorite} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No songs found</Text>
            <Text style={styles.emptySubtext}>Try a different search or genre</Text>
          </View>
        )}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerTitle: { fontSize: FontSize.xxl, color: Colors.textPrimary, fontWeight: FontWeight.black },
  headerBadge: { backgroundColor: Colors.primary + '33', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  headerCount: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: FontWeight.bold },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgInput, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },

  genreScroll: { maxHeight: 40 },
  genreContent: { gap: Spacing.sm, paddingRight: Spacing.md },
  genrePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  genrePillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  genrePillText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  genrePillTextActive: { color: '#fff', fontWeight: FontWeight.semibold },

  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 10, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  sortBtnActive: { backgroundColor: Colors.bgElevated },
  sortBtnText: { fontSize: FontSize.sm, color: Colors.textMuted },
  sortBtnTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  lastUpdated: { fontSize: FontSize.xs, color: Colors.textMuted },

  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  songCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, marginBottom: Spacing.sm, padding: Spacing.md, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  albumArt: { width: 52, height: 52, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  songInfo: { flex: 1 },
  songTitle: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  songArtist: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  songMeta: { flexDirection: 'row', gap: 4, marginTop: 6 },
  metaBadge: { backgroundColor: Colors.bgElevated, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  metaText: { fontSize: 10, color: Colors.textMuted },

  songRight: { alignItems: 'center', gap: 4 },
  favoriteBtn: { padding: 4 },
  duration: { fontSize: FontSize.xs, color: Colors.textMuted },
  playCount: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  playCountText: { fontSize: 10, color: Colors.textMuted },

  empty: { alignItems: 'center', padding: Spacing.xxxl, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textMuted },
});
