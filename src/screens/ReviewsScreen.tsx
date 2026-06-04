// ─────────────────────────────────────────────
//  ReviewsScreen — Live from home-data.json
//  Reviews update when website is updated.
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';
import { getHomeData, DEFAULT_HOME_DATA } from '../services/homeContentService';
import type { HomeReview } from '../services/homeContentService';

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/k6X7ETF24b8YAou7A';

// ── Derive initials and color from review data ─
const COLORS = [Colors.primary, Colors.accent, Colors.cyan, '#FF6B6B', '#FFB347', '#A78BFA', '#F59E0B'];

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

// ── Sub-Components ────────────────────────────

function ReviewCard({ review }: { review: HomeReview }) {
  const initials = getInitials(review.name);
  const color    = getColor(review.name);
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View style={[styles.avatar, { backgroundColor: `${color}22`, borderColor: color }]}>
          <Text style={[styles.avatarText, { color }]}>{initials}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewName}>{review.name}</Text>
          <Text style={styles.reviewType}>{review.type}</Text>
        </View>
        <View style={styles.reviewRating}>
          <Text style={styles.reviewStars}>★★★★★</Text>
          <Text style={styles.reviewRatingNum}>5.0</Text>
        </View>
      </View>
      <Text style={styles.reviewText}>"{review.text}"</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState<HomeReview[]>(DEFAULT_HOME_DATA.reviews);
  const [stats, setStats]     = useState(DEFAULT_HOME_DATA.stats);
  const [social, setSocial]   = useState(DEFAULT_HOME_DATA.social);

  useEffect(() => {
    getHomeData(live => {
      if (live.reviews?.length) setReviews(live.reviews);
      if (live.stats) setStats(live.stats);
      if (live.social) setSocial(live.social);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Rating Hero ─── */}
        <LinearGradient colors={['#1A0533', '#0D0D14']} style={styles.hero}>
          <View style={styles.heroRating}>
            <Text style={styles.heroScore}>{stats.googleRating.replace(' ★', '')}</Text>
            <View style={styles.heroRight}>
              <Text style={styles.heroStars}>★★★★★</Text>
              <Text style={styles.heroCount}>{stats.reviewCount} Reviews on Google</Text>
              <View style={styles.heroBadge}>
                <Ionicons name="shield-checkmark" size={13} color={Colors.success} />
                <Text style={styles.heroBadgeText}>Verified Google Reviews</Text>
              </View>
            </View>
          </View>
          <View style={styles.badges}>
            {['🇺🇸 Veteran-Owned', '🎤 Pro Host', '🔊 75K+ Songs'].map(b => (
              <View key={b} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
          <View style={styles.heroBtns}>
            <TouchableOpacity style={styles.readBtn} onPress={() => Linking.openURL(GOOGLE_MAPS_URL)} activeOpacity={0.8}>
              <Ionicons name="star" size={16} color="#000" />
              <Text style={styles.readBtnText}>Read All Reviews</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.writeBtn} onPress={() => Linking.openURL(GOOGLE_MAPS_URL)} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.writeBtnText}>Leave a Review</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ─── Stats strip ─── */}
        <View style={styles.statsStrip}>
          {[
            { emoji: '⭐', label: stats.googleRating, sub: 'Average rating' },
            { emoji: '📝', label: stats.reviewCount, sub: 'Google reviews' },
            { emoji: '🎤', label: stats.events, sub: 'Events hosted' },
            { emoji: '📅', label: stats.established, sub: 'In business' },
          ].map((s, i) => (
            <React.Fragment key={s.label + i}>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
              {i < 3 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ─── Reviews List ─── */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>What People Are Saying</Text>
          {reviews.map((r, i) => <ReviewCard key={`${r.name}-${i}`} review={r} />)}
        </View>

        {/* ─── CTA ─── */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.readBtn} onPress={() => Linking.openURL(GOOGLE_MAPS_URL)} activeOpacity={0.8}>
            <Ionicons name="open-outline" size={16} color="#000" />
            <Text style={styles.readBtnText}>Read All {stats.reviewCount} Reviews on Google →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.writeBtn} onPress={() => Linking.openURL(GOOGLE_MAPS_URL)} activeOpacity={0.8}>
            <Ionicons name="star-outline" size={16} color={Colors.primary} />
            <Text style={styles.writeBtnText}>Had a great experience? Leave a Review</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Social Links ─── */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Along</Text>
          <Text style={styles.socialSub}>Live clips, crowd moments & song request videos</Text>
          <View style={styles.socialBtns}>
            <TouchableOpacity style={[styles.socialBtn, { borderColor: '#1877F2' }]} onPress={() => Linking.openURL(social.facebook)} activeOpacity={0.8}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text style={[styles.socialBtnText, { color: '#1877F2' }]}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, { borderColor: '#E1306C' }]} onPress={() => Linking.openURL(social.instagram)} activeOpacity={0.8}>
              <Ionicons name="logo-instagram" size={20} color="#E1306C" />
              <Text style={[styles.socialBtnText, { color: '#E1306C' }]}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, { borderColor: '#69C9D0' }]} onPress={() => Linking.openURL(social.tiktok)} activeOpacity={0.8}>
              <Ionicons name="logo-tiktok" size={20} color="#69C9D0" />
              <Text style={[styles.socialBtnText, { color: '#69C9D0' }]}>TikTok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  hero: { padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.lg },
  heroScore: { fontSize: 72, fontWeight: FontWeight.black, color: Colors.gold, lineHeight: 80 },
  heroRight: { flex: 1 },
  heroStars: { color: Colors.gold, fontSize: 28, letterSpacing: 2 },
  heroCount: { color: Colors.textSecondary, fontSize: FontSize.md, marginTop: 4 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  heroBadgeText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  badge: { backgroundColor: 'rgba(123,47,255,0.15)', borderWidth: 1, borderColor: Colors.primary, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  heroBtns: { flexDirection: 'row', gap: 10 },
  readBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: Colors.gold, borderRadius: Radius.lg, paddingVertical: 13 },
  readBtnText: { color: '#000', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  writeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 13, backgroundColor: 'rgba(123,47,255,0.08)' },
  writeBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  statsStrip: { flexDirection: 'row', backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 14, paddingHorizontal: Spacing.md, alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statEmoji: { fontSize: 18, marginBottom: 2 },
  statLabel: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  statSub: { color: Colors.textMuted, fontSize: 10, marginTop: 1, textAlign: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  reviewsSection: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xl },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.lg },
  reviewCard: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  reviewTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  reviewMeta: { flex: 1 },
  reviewName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  reviewType: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  reviewRating: { alignItems: 'flex-end' },
  reviewStars: { color: Colors.gold, fontSize: FontSize.sm },
  reviewRatingNum: { color: Colors.gold, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  reviewText: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, fontStyle: 'italic' },

  ctaSection: { padding: Spacing.md, paddingTop: 4, gap: 10 },

  socialSection: { padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  socialTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: 4 },
  socialSub: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.lg },
  socialBtns: { gap: 10 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderRadius: Radius.lg, paddingVertical: 13, backgroundColor: Colors.bgCard },
  socialBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
