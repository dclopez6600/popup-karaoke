// ─────────────────────────────────────────────
//  Social Screen — Activity feed & community
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLiveData } from '../hooks/useLiveData';
import { SocialPost } from '../services/api';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';
import { formatDistanceToNow } from 'date-fns';

function PostTypeIcon({ type }: { type: SocialPost['type'] }) {
  const config = {
    event_checkin: { icon: 'location' as const, color: Colors.accent, bg: Colors.accent + '22', label: 'Checked In' },
    review: { icon: 'star' as const, color: Colors.gold, bg: Colors.gold + '22', label: 'Left a Review' },
    song_request: { icon: 'musical-notes' as const, color: Colors.primary, bg: Colors.primary + '22', label: 'Singing Next' },
    achievement: { icon: 'trophy' as const, color: Colors.cyan, bg: Colors.cyan + '22', label: 'Achievement' },
  };
  const c = config[type];
  return (
    <View style={[postStyles.typeIcon, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={14} color={c.color} />
    </View>
  );
}

function PostCard({ post }: { post: SocialPost }) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const typeLabels: Record<SocialPost['type'], string> = {
    event_checkin: 'checked in',
    review: 'reviewed',
    song_request: 'is singing',
    achievement: 'unlocked',
  };

  return (
    <View style={postStyles.card}>
      {/* Header */}
      <View style={postStyles.header}>
        <View style={postStyles.avatar}>
          <Text style={postStyles.avatarText}>{post.authorName[0]}</Text>
        </View>
        <View style={postStyles.meta}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={postStyles.authorName}>{post.authorName}</Text>
            <PostTypeIcon type={post.type} />
            <Text style={postStyles.action}>{typeLabels[post.type]}</Text>
          </View>
          <Text style={postStyles.time}>
            {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
          </Text>
        </View>
      </View>

      {/* Event tag */}
      {post.eventTitle && (
        <View style={postStyles.eventTag}>
          <Ionicons name="mic-outline" size={12} color={Colors.primary} />
          <Text style={postStyles.eventTagText}>{post.eventTitle}</Text>
        </View>
      )}

      {/* Content */}
      <Text style={postStyles.content}>{post.content}</Text>

      {/* Actions */}
      <View style={postStyles.actions}>
        <TouchableOpacity style={postStyles.actionBtn} onPress={toggleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={18}
            color={liked ? Colors.accent : Colors.textMuted}
          />
          <Text style={[postStyles.actionCount, liked && { color: Colors.accent }]}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={postStyles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color={Colors.textMuted} />
          <Text style={postStyles.actionCount}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={postStyles.actionBtn}>
          <Ionicons name="share-social-outline" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AchievementBanner() {
  return (
    <LinearGradient
      colors={[Colors.cyan + '33', Colors.primary + '33']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={achievStyles.banner}
    >
      <Ionicons name="trophy" size={28} color={Colors.cyan} />
      <View style={{ flex: 1 }}>
        <Text style={achievStyles.title}>🎉 Crowd Pleaser</Text>
        <Text style={achievStyles.sub}>Sing to 50+ people in one session</Text>
      </View>
      <View style={achievStyles.badge}>
        <Text style={achievStyles.badgeText}>NEW</Text>
      </View>
    </LinearGradient>
  );
}

const TABS = ['All', 'Check-ins', 'Achievements', 'Reviews'];

export default function SocialScreen() {
  const { socialFeed, refresh } = useLiveData();
  const [tab, setTab] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filtered = socialFeed.filter(post => {
    if (tab === 'All') return true;
    if (tab === 'Check-ins') return post.type === 'event_checkin';
    if (tab === 'Achievements') return post.type === 'achievement';
    if (tab === 'Reviews') return post.type === 'review';
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#140A2A', Colors.bg]} style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSub}>See what's happening at karaoke nights</Text>
      </LinearGradient>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabRow}
        contentContainerStyle={styles.tabContent}
      >
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Achievement banner (demo) */}
        {tab === 'All' && <AchievementBanner />}

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Nothing here yet</Text>
            <Text style={styles.emptySubtext}>Check back when events are happening!</Text>
          </View>
        ) : (
          filtered.map(post => <PostCard key={post.id} post={post} />)
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: 4 },
  headerTitle: { fontSize: FontSize.xxl, color: Colors.textPrimary, fontWeight: FontWeight.black },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tabRow: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabContent: { paddingHorizontal: Spacing.lg, paddingVertical: 10, gap: Spacing.sm },
  tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.pill },
  tabActive: { backgroundColor: Colors.primary + '22' },
  tabText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  tabTextActive: { color: Colors.primaryLight, fontWeight: FontWeight.semibold },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textMuted },
});

const postStyles = StyleSheet.create({
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '33', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.lg, color: Colors.primaryLight, fontWeight: FontWeight.bold },
  meta: { flex: 1, gap: 3 },
  authorName: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  typeIcon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  action: { fontSize: FontSize.sm, color: Colors.textSecondary },
  time: { fontSize: FontSize.xs, color: Colors.textMuted },
  eventTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.bgElevated, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  eventTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  content: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: Spacing.lg, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: FontSize.sm, color: Colors.textMuted },
});

const achievStyles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.md, borderWidth: 1, borderColor: Colors.cyan + '33' },
  title: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.bold },
  sub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  badge: { backgroundColor: Colors.cyan, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, color: Colors.bg, fontWeight: FontWeight.black, letterSpacing: 0.5 },
});
