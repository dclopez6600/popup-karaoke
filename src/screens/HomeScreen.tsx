// ─────────────────────────────────────────────
//  Home Screen — Live dashboard overview
// ─────────────────────────────────────────────

import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLiveData, useNowPlaying } from '../hooks/useLiveData';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';
import { formatDistanceToNow } from 'date-fns';

function LiveBadge() {
  const pulse = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.liveBadge}>
      <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
      <Text style={styles.liveBadgeText}>LIVE</Text>
    </View>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { liveStatus, events, isConnected, lastUpdated } = useLiveData();
  const { nowPlaying, progress } = useNowPlaying();

  const upcomingEvents = events.filter(e => !e.isLive).slice(0, 2);
  const liveEvent = events.find(e => e.isLive);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient
        colors={['#1C1230', Colors.bg]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good evening 👋</Text>
            <Text style={styles.headerTitle}>PopUp Karaoke</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.connectionDot,
              { backgroundColor: isConnected ? Colors.success : Colors.error }
            ]} />
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </Text>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── LIVE EVENT BANNER ── */}
        {liveEvent && (
          <TouchableOpacity
            style={styles.liveBanner}
            onPress={() => navigation.navigate('NowPlaying')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#7B2FFF', '#FF2D8B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.liveBannerGradient}
            >
              <LiveBadge />
              <View style={styles.liveBannerContent}>
                <Text style={styles.liveBannerTitle}>{liveEvent.title}</Text>
                <Text style={styles.liveBannerVenue}>
                  📍 {liveEvent.venue}
                </Text>
                {nowPlaying && (
                  <Text style={styles.liveBannerSong} numberOfLines={1}>
                    🎤 {nowPlaying.singerName} · {nowPlaying.songTitle}
                  </Text>
                )}
              </View>
              <View style={styles.liveBannerAction}>
                <Ionicons name="chevron-forward" size={22} color="#fff" />
              </View>
            </LinearGradient>

            {/* Progress bar */}
            {nowPlaying && (
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* ── STATS ── */}
        <Text style={styles.sectionTitle}>Tonight at a Glance</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="people"
            label="Attending"
            value={liveEvent ? String(liveEvent.attendeeCount) : '—'}
            color={Colors.primary}
          />
          <StatCard
            icon="musical-notes"
            label="In Rotation"
            value={nowPlaying ? String(nowPlaying.nextUp.length + 1) : '—'}
            color={Colors.accent}
          />
          <StatCard
            icon="star"
            label="Avg Rating"
            value={liveEvent ? liveEvent.rating.toFixed(1) : '—'}
            color={Colors.gold}
          />
        </View>

        {/* ── SINGER ROTATION ── */}
        {nowPlaying && nowPlaying.nextUp.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Singer Rotation</Text>
            <View style={styles.rotationCard}>
              {/* Now up */}
              <View style={styles.rotationNow}>
                <View style={styles.rotationBadge}>
                  <Text style={styles.rotationBadgeText}>NOW</Text>
                </View>
                <View style={styles.rotationInfo}>
                  <Text style={styles.rotationName}>{nowPlaying.singerName}</Text>
                  <Text style={styles.rotationSong}>{nowPlaying.songTitle} · {nowPlaying.artist}</Text>
                </View>
                <View style={[styles.rotationIcon, { backgroundColor: Colors.primary + '33' }]}>
                  <Ionicons name="mic" size={18} color={Colors.primary} />
                </View>
              </View>

              {/* Next up */}
              {nowPlaying.nextUp.map((slot, i) => (
                <View key={i} style={styles.rotationNext}>
                  <View style={[styles.rotationBadge, styles.rotationBadgeNext]}>
                    <Text style={styles.rotationBadgeNextText}>{i + 1}</Text>
                  </View>
                  <View style={styles.rotationInfo}>
                    <Text style={[styles.rotationName, { color: Colors.textSecondary, fontSize: FontSize.md }]}>
                      {slot.singerName}
                    </Text>
                    <Text style={styles.rotationSong}>{slot.songTitle} · {slot.artist}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── UPCOMING EVENTS ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Events')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {upcomingEvents.map(event => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => navigation.navigate('Events', { eventId: event.id })}
            activeOpacity={0.8}
          >
            <View style={styles.eventCardLeft}>
              <View style={styles.eventDateBox}>
                <Text style={styles.eventMonth}>
                  {new Date(event.date).toLocaleString('en', { month: 'short' }).toUpperCase()}
                </Text>
                <Text style={styles.eventDay}>
                  {new Date(event.date).getDate()}
                </Text>
              </View>
            </View>
            <View style={styles.eventCardMid}>
              <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
              <Text style={styles.eventVenue} numberOfLines={1}>📍 {event.venue}</Text>
              <View style={styles.eventTags}>
                {event.genre.slice(0, 2).map((g, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.eventCardRight}>
              <View style={styles.attendeeCount}>
                <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.attendeeText}>{event.attendeeCount}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))}

        {/* ── QUICK ACTIONS ── */}
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.quickActions}>
          {[
            { icon: 'musical-notes-outline' as const, label: 'Song Catalog', screen: 'Songs', color: Colors.primary },
            { icon: 'star-outline' as const, label: 'Reviews', screen: 'Reviews', color: Colors.gold },
            { icon: 'people-outline' as const, label: 'Social Feed', screen: 'Social', color: Colors.accent },
            { icon: 'calendar-outline' as const, label: 'All Events', screen: 'Events', color: Colors.cyan },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickAction}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '22' }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  headerTitle: { fontSize: FontSize.xxl, color: Colors.textPrimary, fontWeight: FontWeight.black, marginTop: 2 },
  connectionDot: { width: 8, height: 8, borderRadius: 4 },
  notifBtn: { padding: 4 },
  lastUpdated: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xs },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  // Live banner
  liveBanner: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg, ...Shadow.glow },
  liveBannerGradient: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  liveBannerContent: { flex: 1 },
  liveBannerTitle: { fontSize: FontSize.md, color: '#fff', fontWeight: FontWeight.bold },
  liveBannerVenue: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  liveBannerSong: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  liveBannerAction: { padding: 4 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveBadgeText: { fontSize: 10, color: '#fff', fontWeight: FontWeight.black, letterSpacing: 1 },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressFill: { height: 3, backgroundColor: '#fff', maxWidth: '100%' },

  // Stats
  sectionTitle: { fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: FontWeight.bold, marginBottom: Spacing.md, marginTop: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  statValue: { fontSize: FontSize.xl, color: Colors.textPrimary, fontWeight: FontWeight.black },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  // Rotation
  rotationCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Spacing.lg },
  rotationNow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.primary + '11', borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.sm },
  rotationNext: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.sm },
  rotationBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  rotationBadgeText: { fontSize: 10, color: '#fff', fontWeight: FontWeight.black, letterSpacing: 0.5 },
  rotationBadgeNext: { backgroundColor: Colors.bgElevated },
  rotationBadgeNextText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  rotationInfo: { flex: 1 },
  rotationName: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  rotationSong: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 1 },
  rotationIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  // Events
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.sm },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  eventCard: { flexDirection: 'row', backgroundColor: Colors.bgCard, borderRadius: Radius.md, marginBottom: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md, alignItems: 'center' },
  eventCardLeft: {},
  eventDateBox: { width: 44, alignItems: 'center', backgroundColor: Colors.bgElevated, borderRadius: Radius.sm, padding: Spacing.xs },
  eventMonth: { fontSize: 10, color: Colors.accent, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  eventDay: { fontSize: FontSize.xl, color: Colors.textPrimary, fontWeight: FontWeight.black, lineHeight: 28 },
  eventCardMid: { flex: 1 },
  eventTitle: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  eventVenue: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  eventTags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  tag: { backgroundColor: Colors.primary + '22', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 11, color: Colors.primaryLight, fontWeight: FontWeight.medium },
  eventCardRight: { alignItems: 'center', gap: 4 },
  attendeeCount: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  attendeeText: { fontSize: FontSize.xs, color: Colors.textMuted },

  // Quick actions
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickAction: { width: '47%', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  quickActionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, textAlign: 'center' },
});
