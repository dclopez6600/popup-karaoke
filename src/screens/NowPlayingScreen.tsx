// ─────────────────────────────────────────────
//  Now Playing Screen — Live song & rotation
// ─────────────────────────────────────────────

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  StatusBar, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNowPlaying } from '../hooks/useLiveData';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function VinylRecord({ spinning }: { spinning: boolean }) {
  const rotation = React.useRef(new Animated.Value(0)).current;
  const anim = React.useRef<Animated.CompositeAnimation | null>(null);

  React.useEffect(() => {
    if (spinning) {
      anim.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      anim.current.start();
    } else {
      anim.current?.stop();
    }
  }, [spinning]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[styles.vinyl, { transform: [{ rotate: spin }] }]}>
      <LinearGradient
        colors={['#2A0A5E', '#7B2FFF', '#1C1C2E', '#FF2D8B', '#1C1C2E']}
        style={styles.vinylInner}
      >
        <View style={styles.vinylCenter}>
          <Ionicons name="mic" size={24} color="#fff" />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function ReactionBar() {
  const reactions = ['🔥', '❤️', '🎉', '👏', '⭐'];
  return (
    <View style={styles.reactionBar}>
      {reactions.map((emoji, i) => (
        <Animated.Text key={i} style={styles.reaction}>{emoji}</Animated.Text>
      ))}
    </View>
  );
}

export default function NowPlayingScreen() {
  const { nowPlaying, elapsed, progress } = useNowPlaying();

  if (!nowPlaying) {
    return (
      <View style={[styles.container, styles.empty]}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="musical-notes-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>No live event right now</Text>
        <Text style={styles.emptySubtitle}>Check back when a karaoke night is happening!</Text>
      </View>
    );
  }

  const remaining = nowPlaying.durationSeconds - elapsed;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Hero gradient ── */}
      <LinearGradient
        colors={['#2A0A5E', '#0D0D14']}
        style={styles.hero}
      >
        {/* Live indicator */}
        <View style={styles.liveRow}>
          <View style={styles.liveIndicator}>
            <View style={styles.livePulse} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.viewerCount}>
            <Ionicons name="eye-outline" size={14} color={Colors.textMuted} /> 61 watching
          </Text>
        </View>

        {/* Vinyl */}
        <VinylRecord spinning={true} />

        {/* Song info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{nowPlaying.songTitle}</Text>
          <Text style={styles.songArtist}>{nowPlaying.artist}</Text>
          <View style={styles.singerRow}>
            <View style={styles.singerAvatar}>
              <Text style={styles.singerInitial}>{nowPlaying.singerName[0]}</Text>
            </View>
            <Text style={styles.singerName}>Sung by {nowPlaying.singerName}</Text>
          </View>
        </View>

        {/* Reactions */}
        <ReactionBar />
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Progress ── */}
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressTimes}>
            <Text style={styles.progressTime}>{formatTime(elapsed)}</Text>
            <View style={styles.songMeta}>
              <Text style={styles.songMetaText}>
                <Ionicons name="musical-note" size={12} color={Colors.textMuted} /> {nowPlaying.key}
              </Text>
              {nowPlaying.bpm && (
                <Text style={styles.songMetaText}>{nowPlaying.bpm} BPM</Text>
              )}
            </View>
            <Text style={styles.progressTime}>-{formatTime(Math.max(0, remaining))}</Text>
          </View>
        </View>

        {/* ── Next Up ── */}
        {nowPlaying.nextUp.length > 0 && (
          <View style={styles.nextSection}>
            <Text style={styles.nextTitle}>Up Next</Text>
            {nowPlaying.nextUp.map((slot, i) => (
              <View key={i} style={styles.nextCard}>
                <LinearGradient
                  colors={i === 0
                    ? [Colors.primary + '33', Colors.bgCard]
                    : [Colors.bgCard, Colors.bgCard]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextCardInner}
                >
                  <View style={[styles.nextPosition,
                    i === 0 ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.bgElevated }
                  ]}>
                    <Text style={[styles.nextPositionText,
                      i !== 0 && { color: Colors.textSecondary }
                    ]}>{slot.position}</Text>
                  </View>
                  <View style={styles.nextAvatar}>
                    <Text style={styles.nextInitial}>{slot.singerName[0]}</Text>
                  </View>
                  <View style={styles.nextInfo}>
                    <Text style={styles.nextSingerName}>{slot.singerName}</Text>
                    <Text style={styles.nextSong} numberOfLines={1}>
                      {slot.songTitle} · {slot.artist}
                    </Text>
                  </View>
                  {i === 0 && (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextBadgeText}>NEXT</Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  empty: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, color: Colors.textPrimary, fontWeight: FontWeight.bold },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },

  hero: { paddingTop: 60, paddingBottom: Spacing.xl, alignItems: 'center', gap: Spacing.lg },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, width: '100%', paddingHorizontal: Spacing.xl },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.error + '33', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  livePulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.error },
  liveText: { fontSize: 11, color: Colors.error, fontWeight: FontWeight.black, letterSpacing: 1 },
  viewerCount: { fontSize: FontSize.sm, color: Colors.textMuted },

  vinyl: { width: 180, height: 180, borderRadius: 90, ...Shadow.glow },
  vinylInner: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center' },
  vinylCenter: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },

  songInfo: { alignItems: 'center', paddingHorizontal: Spacing.xl },
  songTitle: { fontSize: FontSize.xxl, color: Colors.textPrimary, fontWeight: FontWeight.black, textAlign: 'center' },
  songArtist: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  singerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  singerAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  singerInitial: { fontSize: FontSize.sm, color: '#fff', fontWeight: FontWeight.bold },
  singerName: { fontSize: FontSize.md, color: Colors.textSecondary },

  reactionBar: { flexDirection: 'row', gap: Spacing.md },
  reaction: { fontSize: 28 },

  scroll: { flex: 1 },

  progressSection: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  progressTrack: { height: 5, backgroundColor: Colors.border, borderRadius: Radius.pill, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: Radius.pill, backgroundColor: Colors.primary },
  progressTimes: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  progressTime: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  songMeta: { flexDirection: 'row', gap: Spacing.sm },
  songMetaText: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.bgElevated, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },

  nextSection: { paddingHorizontal: Spacing.lg },
  nextTitle: { fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  nextCard: { marginBottom: Spacing.sm, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  nextCardInner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  nextPosition: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextPositionText: { fontSize: FontSize.sm, color: '#fff', fontWeight: FontWeight.bold },
  nextAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  nextInitial: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  nextInfo: { flex: 1 },
  nextSingerName: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  nextSong: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  nextBadge: { backgroundColor: Colors.primary + '33', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  nextBadgeText: { fontSize: 10, color: Colors.primaryLight, fontWeight: FontWeight.black, letterSpacing: 0.5 },
});
