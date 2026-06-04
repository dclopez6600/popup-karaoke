// ─────────────────────────────────────────────
//  HomeScreen — fully live from popupkaraoke.net
//  Content fetched from /home-data.json on launch.
//  Song count + Top 10 from /catalog-data.js.
//  All sections fall back to defaults if offline.
// ─────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
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
import { getHomeData, refreshHomeData, DEFAULT_HOME_DATA, isOffline } from '../services/homeContentService';
import type { HomeData, HomeVenue, HomeService, HomeReview, HomeSong, HomeFaq } from '../services/homeContentService';
import SongRequestModal from '../components/SongRequestModal';
import BookingModal from '../components/BookingModal';
import { Share } from 'react-native';
import { getCatalog, onCatalogReady } from '../services/catalogService';
import type { SongRow } from '../services/catalogService';

// ── Emoji map for service cards (stored as strings in JSON) ─
const EMOJI_MAP: Record<string, string> = {
  birthday: '🎂', wedding: '💒', corporate: '🏢', bar: '🍺',
};
function resolveEmoji(raw: string) {
  return raw.length <= 2 ? raw : EMOJI_MAP[raw] ?? '🎤';
}

// ── Color map for venue accent bars ─────────
const COLOR_MAP: Record<string, string> = {
  primary: Colors.primary,
  accent: Colors.accent,
  cyan: Colors.cyan,
};

// ── Sub-Components ────────────────────────────────────

function SectionLabel({ over, title }: { over: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionOver}>{over}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ServiceCard({ emoji, title, desc, bullets }: HomeService) {
  return (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceEmoji}>{resolveEmoji(emoji)}</Text>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceDesc}>{desc}</Text>
      {bullets.map(b => (
        <View key={b} style={styles.bulletRow}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.primary} style={{ marginTop: 1 }} />
          <Text style={styles.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function VenueCard({ venue, onMap }: { venue: HomeVenue; onMap: () => void }) {
  const color = COLOR_MAP[venue.color] ?? Colors.primary;
  return (
    <View style={styles.venueCard}>
      <View style={[styles.venueAccent, { backgroundColor: color }]} />
      <View style={styles.venueBody}>
        <Text style={styles.venueName}>{venue.name}</Text>
        <View style={styles.venueRow}>
          <Ionicons name="calendar-outline" size={13} color={color} />
          <Text style={[styles.venueDay, { color }]}>{venue.schedule}</Text>
        </View>
        <View style={styles.venueRow}>
          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.venueTime}>{venue.time}</Text>
        </View>
        <View style={styles.venueRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.venueAddress}>{venue.address}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.mapBtn} onPress={onMap} activeOpacity={0.7}>
        <Ionicons name="navigate-outline" size={16} color="#fff" />
        <Text style={styles.mapBtnText}>Map</Text>
      </TouchableOpacity>
    </View>
  );
}

function FaqItem({ item }: { item: HomeFaq }) {
  const [open, setOpen] = React.useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen(o => !o)}
      activeOpacity={0.8}
    >
      <View style={styles.faqRow}>
        <Text style={styles.faqQ}>{item.q}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.textMuted}
        />
      </View>
      {open && <Text style={styles.faqA}>{item.a}</Text>}
    </TouchableOpacity>
  );
}

function ReviewCard({ review }: { review: HomeReview }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewName}>{review.name}</Text>
          <Text style={styles.reviewType}>{review.type}</Text>
        </View>
        <Text style={styles.reviewStars}>★★★★★</Text>
      </View>
      <Text style={styles.reviewText} numberOfLines={4}>"{review.text}"</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────

export default function HomeScreen() {
  const [data, setData] = useState<HomeData>(DEFAULT_HOME_DATA);
  const [songCountLabel, setSongCountLabel] = useState('75K+');
  const [topSongs, setTopSongs] = useState<{ title: string; artist: string }[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [offline, setOffline] = useState(isOffline);

  const shareApp = async () => {
    try {
      await Share.share({
        message: '🎤 Check out PopUp Karaoke — NW Indiana & Chicagoland\'s premier mobile karaoke service!\n\niOS: https://apps.apple.com/app/id6745000492\nAndroid: https://play.google.com/store/apps/details?id=app.replit.popupkaraoke',
        url: 'https://apps.apple.com/app/id6745000492',
      });
    } catch { /* ignore */ }
  };

  // Load home content and catalog in parallel on mount
  useEffect(() => {
    // Home content — defaults shown immediately, live data updates state
    const initial = getHomeData(live => setData(live));
    setData(initial);

    // Song catalog — top 10 + live count
    getCatalog().then(songs => {
      if (songs.length > 0) {
        setSongCountLabel(
          songs.length >= 1000
            ? `${songs.length.toLocaleString()}`
            : String(songs.length)
        );
        setTopSongs(songs.slice(0, 10).map(([title, artist]: SongRow) => ({ title, artist })));
      }
    });

    const unsub = onCatalogReady(live => {
      setSongCountLabel(live.length.toLocaleString());
      setTopSongs(live.slice(0, 10).map(([title, artist]: SongRow) => ({ title, artist })));
    });

    return unsub;
  }, []);

  // Convenience link handlers derived from live contact data
  const callUs    = useCallback(() => Linking.openURL(data.contact.phoneUrl), [data]);
  const textUs    = useCallback(() => Linking.openURL(data.contact.textUrl), [data]);
  const bookNow   = useCallback(() => Linking.openURL(data.contact.bookUrl), [data]);
  const readReviews = useCallback(() => Linking.openURL(data.contact.googleReviewsUrl), [data]);
  const leaveReview = useCallback(() => Linking.openURL(data.contact.googleReviewsUrl), [data]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Offline banner */}
      {offline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#92400e" />
          <Text style={styles.offlineBannerText}>Showing cached content — connect to refresh</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero ─── */}
        <LinearGradient colors={['#1A0533', '#0D0D14']} style={styles.hero}>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>🇺🇸 {data.hero.tag}</Text>
          </View>
          <Text style={styles.heroStars}>★★★★★ {data.hero.stars}</Text>
          <Text style={styles.heroTitle}>{data.hero.title.replace('\\n', '\n')}</Text>
          <Text style={styles.heroSubtitle}>{data.hero.subtitle}</Text>
          <View style={styles.heroBtns}>
            <TouchableOpacity style={styles.primaryBtn} onPress={bookNow} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>🎤 Book Your Event</Text>
            </TouchableOpacity>
            <View style={styles.heroSecondaryRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={callUs} activeOpacity={0.8}>
                <Ionicons name="call-outline" size={16} color={Colors.primary} />
                <Text style={styles.secondaryBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={textUs} activeOpacity={0.8}>
                <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
                <Text style={styles.secondaryBtnText}>Text Us</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={readReviews} activeOpacity={0.7}>
            <Text style={styles.heroReviewLink}>
              ★★★★★ {data.stats.googleRating} Google · {data.stats.reviewCount} Reviews ↗
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ─── Stats Bar ─── */}
        <View style={styles.statsBar}>
          {[
            { value: songCountLabel, label: 'Songs' },
            { value: data.stats.events, label: 'Events' },
            { value: data.stats.established, label: 'Est.' },
            { value: data.stats.googleRating, label: 'Google' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < 3 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ─── Services ─── */}
        <View style={styles.section}>
          <SectionLabel over="What We Do" title="Events We Rock" />
          {data.services.map(s => <ServiceCard key={s.title} {...s} />)}
        </View>

        {/* ─── Everything Included ─── */}
        <LinearGradient colors={['#13001F', '#0D0D14']} style={styles.includedSection}>
          <SectionLabel over="Every Booking" title="Everything Included" />
          <Text style={styles.includedNote}>One flat package. No à-la-carte add-ons. No surprise charges.</Text>
          <View style={styles.includedGrid}>
            {data.included.map(item => (
              <View key={item.label} style={styles.includedItem}>
                <View style={styles.includedIconWrap}>
                  <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.includedLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.checkRow}>
            {['Full setup & teardown', 'Social media content', 'Zero hidden fees'].map(t => (
              <View key={t} style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.checkText}>{t}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ─── Weekly Venues ─── */}
        <View style={styles.section}>
          <SectionLabel over="Where To Find Us" title="Catch Us Live Every Week" />
          <Text style={styles.venueNote}>Free to attend — all are welcome.</Text>
          {data.venues.map(v => (
            <VenueCard
              key={v.name}
              venue={v}
              onMap={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${v.mapsQuery}`)}
            />
          ))}
          <TouchableOpacity style={styles.outlineBtn} onPress={bookNow} activeOpacity={0.8}>
            <Text style={styles.outlineBtnText}>🎉 Book PopUp Karaoke For Your Event</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Reviews ─── */}
        <View style={styles.section}>
          <SectionLabel over="What Our Customers Say" title={`★★★★★ ${data.stats.googleRating} on Google`} />
          {data.reviews.map(r => <ReviewCard key={r.name} review={r} />)}
          <View style={styles.reviewBtns}>
            <TouchableOpacity style={styles.reviewBtn} onPress={readReviews} activeOpacity={0.8}>
              <Ionicons name="star" size={15} color="#000" />
              <Text style={styles.reviewBtnText}>Read All Reviews</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.reviewBtn, styles.reviewBtnOutline]} onPress={leaveReview} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={15} color={Colors.primary} />
              <Text style={[styles.reviewBtnText, { color: Colors.primary }]}>Leave a Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Blog / Tips ─── */}
        {data.blog?.length > 0 && (
          <View style={styles.section}>
            <SectionLabel over="Tips & Ideas" title="📖 From the Blog" />
            {data.blog.map((post, i) => (
              <TouchableOpacity
                key={i}
                style={styles.blogCard}
                onPress={() => Linking.openURL(post.url)}
                activeOpacity={0.8}
              >
                <View style={styles.blogCategoryBadge}>
                  <Text style={styles.blogCategoryText}>{post.category}</Text>
                </View>
                <Text style={styles.blogTitle}>{post.title}</Text>
                <Text style={styles.blogExcerpt}>{post.excerpt}</Text>
                <View style={styles.blogReadMore}>
                  <Text style={styles.blogReadMoreText}>Read article</Text>
                  <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ─── FAQ ─── */}
        {data.faq?.length > 0 && (
          <View style={styles.section}>
            <SectionLabel over="Got Questions?" title="Frequently Asked" />
            {data.faq.map((item, i) => (
              <FaqItem key={i} item={item} />
            ))}
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={bookNow}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineBtnText}>🎤 Still have questions? Get a free quote →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Service Areas ─── */}
        {data.serviceAreas?.length > 0 && (
          <View style={styles.section}>
            <SectionLabel over="Coverage Area" title="📍 Where We Show Up" />
            <View style={styles.areasWrap}>
              {data.serviceAreas.map((area, i) => (
                <View key={i} style={styles.areaChip}>
                  <Text style={styles.areaChipText}>{area}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── Social Links ─── */}
        {data.social && (
          <View style={styles.section}>
            <SectionLabel over="Follow Along" title="Find Us on Social" />
            <View style={styles.socialRow}>
              {[
                { label: '👍 Facebook', url: data.social.facebook, color: '#1877F2' },
                { label: '📸 Instagram', url: data.social.instagram, color: '#E1306C' },
                { label: '🎵 TikTok', url: data.social.tiktok, color: '#00F2EA' },
              ].map(s => (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.socialBtn, { borderColor: s.color }]}
                  onPress={() => Linking.openURL(s.url)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.socialBtnText, { color: s.color }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ─── CTA ─── */}
        <LinearGradient colors={['#1A0533', '#0D0D14']} style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Book?</Text>
          <Text style={styles.ctaSubtitle}>{data.hero.ctaSubtitle}</Text>
          <TouchableOpacity style={[styles.primaryBtn, { width: '100%' }]} onPress={() => setShowBookingModal(true)} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>🎉 Book Your Event</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, { width: '100%', backgroundColor: '#28a745' }]}
            onPress={() => Linking.openURL('https://square.link/u/CmsBTgrE')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>💳 Pay Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineBtn, { width: '100%' }]}
            onPress={() => setShowRequestModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>🎤 Request a Song</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineBtn, { width: '100%' }]}
            onPress={shareApp}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>📲 Share the App</Text>
          </TouchableOpacity>
          <View style={styles.ctaLinks}>
            <TouchableOpacity style={styles.ctaLink} onPress={callUs}>
              <Ionicons name="call" size={16} color={Colors.primary} />
              <Text style={styles.ctaLinkText}>{data.contact.phone}</Text>
            </TouchableOpacity>
            <Text style={styles.ctaDot}>·</Text>
            <TouchableOpacity style={styles.ctaLink} onPress={textUs}>
              <Ionicons name="chatbubble" size={16} color={Colors.primary} />
              <Text style={styles.ctaLinkText}>Text Us</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.ctaFooter}>
            🇺🇸 Veteran-Owned & Operated · NW Indiana & Chicagoland · Since {data.stats.established}
          </Text>
        </LinearGradient>
      </ScrollView>

      <SongRequestModal visible={showRequestModal} onClose={() => setShowRequestModal(false)} />
      <BookingModal visible={showBookingModal} onClose={() => setShowBookingModal(false)} />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'center' },
  offlineBannerText: { color: '#92400e', fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  hero: { padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(123,47,255,0.2)',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  heroTagText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  heroStars: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: 8 },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 44,
    fontWeight: FontWeight.black,
    lineHeight: 50,
    marginBottom: 12,
  },
  heroSubtitle: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 22, marginBottom: Spacing.lg },
  heroBtns: { marginBottom: 16 },
  heroSecondaryRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  heroReviewLink: {
    color: Colors.gold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textDecorationLine: 'underline',
  },

  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 11,
    backgroundColor: 'rgba(123,47,255,0.08)',
  },
  secondaryBtnText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(123,47,255,0.08)',
  },
  outlineBtnText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },

  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  sectionHeader: { marginBottom: Spacing.lg },
  sectionOver: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },

  serviceCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  serviceEmoji: { fontSize: 32, marginBottom: 8 },
  serviceTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: 4 },
  serviceDesc: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 18, marginBottom: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  bulletText: { color: Colors.textSecondary, fontSize: FontSize.sm, flex: 1, lineHeight: 18 },

  includedSection: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  includedNote: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.lg, marginTop: -Spacing.md },
  includedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.lg },
  includedItem: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 12,
  },
  includedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(123,47,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  includedLabel: { color: Colors.textSecondary, fontSize: 11, textAlign: 'center', lineHeight: 14 },
  checkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkText: { color: Colors.textSecondary, fontSize: FontSize.xs },

  venueNote: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.md, marginTop: -Spacing.md },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  venueAccent: { width: 4 },
  venueBody: { flex: 1, padding: Spacing.md },
  venueName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 6 },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  venueDay: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  venueTime: { color: Colors.textSecondary, fontSize: FontSize.sm },
  venueAddress: { color: Colors.textMuted, fontSize: FontSize.xs, flex: 1 },
  mapBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 58,
  },
  mapBtnText: { color: '#fff', fontSize: 11, fontWeight: FontWeight.semibold },

  songColumn: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  columnTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  songRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  songNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  songNumText: { color: '#fff', fontSize: 11, fontWeight: FontWeight.bold },
  songInfo: { flex: 1 },
  songTitle: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  songArtist: { color: Colors.textMuted, fontSize: 10, marginTop: 1 },
  newBadge: {
    backgroundColor: Colors.cyan,
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  newBadgeText: { color: '#000', fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5 },

  reviewCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  reviewName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  reviewType: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  reviewStars: { color: Colors.gold, fontSize: FontSize.md },
  reviewText: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, fontStyle: 'italic' },
  reviewBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  reviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: 12,
  },
  reviewBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  reviewBtnText: { color: '#000', fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  // ── Crowd Favorites ───────────────────────────
  crowdCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  crowdCategory: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 2 },
  crowdDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 10 },
  crowdSongRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  crowdSongBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  crowdSongInfo: { flex: 1 },
  crowdSongTitle: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  crowdSongArtist: { color: Colors.textMuted, fontSize: FontSize.xs },

  // ── Blog ──────────────────────────────────────
  blogCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  blogCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(123,47,255,0.15)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  blogCategoryText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  blogTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 4, lineHeight: 22 },
  blogExcerpt: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 18, marginBottom: 10 },
  blogReadMore: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  blogReadMoreText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  // ── FAQ ───────────────────────────────────────
  faqItem: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: 8,
  },
  faqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  faqQ: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, flex: 1, lineHeight: 20 },
  faqA: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginTop: 10 },

  // ── Service Areas ─────────────────────────────
  areasWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  areaChip: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  areaChipText: { color: Colors.textSecondary, fontSize: FontSize.xs },

  // ── Social ────────────────────────────────────
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  socialBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  ctaSection: { padding: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl, gap: 10 },
  ctaTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.black, textAlign: 'center', marginBottom: 8 },
  ctaSubtitle: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 22 },
  ctaLinks: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: Spacing.md },
  ctaLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ctaLinkText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  ctaDot: { color: Colors.textMuted, fontSize: FontSize.lg },
  ctaFooter: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 18 },
});
