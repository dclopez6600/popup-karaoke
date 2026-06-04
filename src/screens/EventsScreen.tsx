// ─────────────────────────────────────────────
//  EventsScreen — Calendar + Queue + Venues
// ─────────────────────────────────────────────

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';
import { getHomeData, DEFAULT_HOME_DATA } from '../services/homeContentService';
import type { HomeVenue } from '../services/homeContentService';
import QRScannerModal from '../components/QRScannerModal';

const haptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
};

const KARAFUN_URL = 'https://www.karafun.com/062552/';

// ── Color map ─────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  primary: Colors.primary,
  accent: Colors.accent,
  cyan: Colors.cyan,
};

type Venue = HomeVenue;

interface CalendarEvent {
  date: Date;
  venue: Venue;
}

// ── Calendar helpers ──────────────────────────

function getNthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, n: number): Date | null {
  let count = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (date.getDay() === dayOfWeek) {
      count++;
      if (count === n) return date;
    }
  }
  return null;
}

function getEventsForMonth(year: number, month: number, venues: Venue[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (const venue of venues) {
    if (!venue.rule) continue;
    if (venue.rule.type === 'weekly') {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        if (date.getDay() === venue.rule.dayOfWeek) {
          events.push({ date, venue });
        }
      }
    } else if (venue.rule.type === 'nthWeekday' && venue.rule.weeks) {
      for (const week of venue.rule.weeks) {
        const date = getNthWeekdayOfMonth(year, month, venue.rule.dayOfWeek, week);
        if (date) events.push({ date, venue });
      }
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function formatDateShort(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

// ── Parse show start time from "7:00 PM – 10:00 PM" ─
function parseShowTime(date: Date, timeStr: string): Date | null {
  try {
    const start = timeStr.split('–')[0].trim(); // "7:00 PM"
    const [time, meridiem] = start.split(' ');
    const [h, m] = time.split(':').map(Number);
    const hours = meridiem === 'PM' && h !== 12 ? h + 12 : meridiem === 'AM' && h === 12 ? 0 : h;
    const d = new Date(date);
    d.setHours(hours, m ?? 0, 0, 0);
    return d;
  } catch { return null; }
}

async function scheduleShowReminder(ev: CalendarEvent) {
  const showTime = parseShowTime(ev.date, ev.venue.time);
  if (!showTime) return false;

  const reminderTime = new Date(showTime.getTime() - 60 * 60 * 1000); // 1 hour before
  if (reminderTime <= new Date()) {
    Alert.alert('Too late!', 'This show starts in less than an hour.');
    return false;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Notifications off', 'Enable notifications in Settings to get show reminders.');
    return false;
  }

  const id = `show-${ev.venue.name}-${ev.date.toDateString()}`;
  // Cancel any existing reminder for this show
  const existing = await AsyncStorage.getItem(`@reminder_${id}`);
  if (existing) await Notifications.cancelScheduledNotificationAsync(existing);

  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🎤 Show tonight at ${ev.venue.shortName ?? ev.venue.name}!`,
      body: `Karaoke starts at ${ev.venue.time.split('–')[0].trim()} — get ready to sing!`,
      sound: true,
    },
    trigger: { date: reminderTime },
  });

  await AsyncStorage.setItem(`@reminder_${id}`, notifId);
  return true;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// ── Mini calendar grid ────────────────────────

function MiniCalendar({
  year, month, events, selectedDay, onSelectDay,
}: {
  year: number;
  month: number;
  events: CalendarEvent[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}) {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventDays = new Set(events.map(e => e.date.getDate()));

  return (
    <View style={calStyles.grid}>
      {/* Day headers */}
      <View style={calStyles.headerRow}>
        {DAY_NAMES.map(d => (
          <Text key={d} style={calStyles.dayHeader}>{d}</Text>
        ))}
      </View>
      {/* Weeks */}
      {Array.from({ length: Math.ceil(cells.length / 7) }, (_, wi) => (
        <View key={wi} style={calStyles.weekRow}>
          {cells.slice(wi * 7, wi * 7 + 7).map((day, di) => {
            if (!day) return <View key={di} style={calStyles.dayCell} />;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasEvent = eventDays.has(day);
            const isSelected = day === selectedDay;
            return (
              <TouchableOpacity
                key={di}
                style={[
                  calStyles.dayCell,
                  isSelected && calStyles.dayCellSelected,
                  isToday && !isSelected && calStyles.dayCellToday,
                ]}
                onPress={() => { haptic(); onSelectDay(day); }}
                activeOpacity={0.7}
              >
                <Text style={[
                  calStyles.dayNum,
                  isSelected && calStyles.dayNumSelected,
                  isToday && !isSelected && calStyles.dayNumToday,
                ]}>
                  {day}
                </Text>
                {hasEvent && (
                  <View style={[calStyles.dot, isSelected && calStyles.dotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── Main Screen ───────────────────────────────

export default function EventsScreen() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [venues, setVenues] = useState<Venue[]>(DEFAULT_HOME_DATA.venues);
  const [showQR, setShowQR] = useState(false);

  // Determine if there's a show tonight
  const tonightShow = useMemo(() => {
    const todayEvents = getEventsForMonth(today.getFullYear(), today.getMonth(), venues)
      .filter(e => isSameDay(e.date, today));
    return todayEvents[0] ?? null;
  }, [venues]);

  // Load live venue data from popupkaraoke.net/home-data.json
  useEffect(() => {
    getHomeData(live => {
      if (live.venues?.length) setVenues(live.venues);
    });
  }, []);

  const monthEvents = useMemo(
    () => getEventsForMonth(viewYear, viewMonth, venues),
    [viewYear, viewMonth, venues]
  );

  const selectedEvents = useMemo(() => {
    if (!selectedDay) return monthEvents;
    const sel = new Date(viewYear, viewMonth, selectedDay);
    return monthEvents.filter(e => isSameDay(e.date, sel));
  }, [selectedDay, monthEvents, viewYear, viewMonth]);

  const eventsToShow = selectedDay ? selectedEvents : monthEvents;

  function prevMonth() {
    haptic();
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    haptic();
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ─── Live Show Shortcuts ─── */}
        <View style={styles.liveShortcuts}>
          {tonightShow && (
            <TouchableOpacity
              style={styles.hereBtn}
              onPress={() => { haptic(); Linking.openURL(KARAFUN_URL); }}
              activeOpacity={0.85}
            >
              <View style={styles.herePulse} />
              <Text style={styles.hereBtnText}>
                🎤 I'm at {tonightShow.venue.shortName ?? tonightShow.venue.name} Tonight — Join Queue →
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => { haptic(); setShowQR(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={18} color={Colors.primary} />
            <Text style={styles.qrBtnText}>Scan Venue QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Join the Queue Hero ─── */}
        <LinearGradient
          colors={['#1a0a3c', '#0D0D14']}
          style={styles.queueHero}
        >
          <View style={styles.liveRow}>
            <View style={styles.livePulse}>
              <View style={styles.liveDotOuter}>
                <View style={styles.liveDot} />
              </View>
              <Text style={styles.liveLabel}>LIVE</Text>
            </View>
            <Text style={styles.onStageLabel}>ON STAGE</Text>
          </View>

          <Text style={styles.heroTitle}>🎵 Join the Queue</Text>
          <Text style={styles.heroSub}>
            Pick your song, add your name to the live queue, and get ready for your moment.
          </Text>

          <TouchableOpacity
            style={styles.queueBtn}
            onPress={() => { haptic(); Linking.openURL(KARAFUN_URL); }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.primary, '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.queueBtnGradient}
            >
              <Ionicons name="musical-notes" size={20} color="#fff" />
              <Text style={styles.queueBtnText}>Open Live Queue →</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.heroHint}>Powered by KaraFun · 75,000+ songs</Text>
        </LinearGradient>

        {/* ─── How It Works ─── */}
        <View style={styles.howRow}>
          {[
            { icon: 'search-outline', label: 'Find your song' },
            { icon: 'person-add-outline', label: 'Add your name' },
            { icon: 'mic-outline', label: 'Get on the mic' },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <View style={styles.howStep}>
                <View style={styles.howIconCircle}>
                  <Ionicons name={step.icon as any} size={18} color={Colors.primary} />
                </View>
                <Text style={styles.howLabel}>{step.label}</Text>
              </View>
              {i < 2 && <Ionicons name="chevron-forward" size={14} color={Colors.border} style={{ marginTop: 14 }} />}
            </React.Fragment>
          ))}
        </View>

        {/* ─── Calendar Section ─── */}
        <View style={styles.calendarSection}>
          <View style={styles.calHeader}>
            <View>
              <Text style={styles.calOver}>WHERE TO FIND US</Text>
              <Text style={styles.calTitle}>Upcoming Events</Text>
            </View>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <MiniCalendar
            year={viewYear}
            month={viewMonth}
            events={monthEvents}
            selectedDay={selectedDay}
            onSelectDay={day => setSelectedDay(prev => prev === day ? null : day)}
          />

          <View style={styles.eventList}>
            {selectedDay && eventsToShow.length === 0 && (
              <Text style={styles.noEvents}>No shows on {MONTH_NAMES[viewMonth]} {selectedDay}</Text>
            )}
            {eventsToShow.map((ev, i) => {
              const c = COLOR_MAP[ev.venue.color] ?? Colors.primary;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${ev.venue.mapsQuery}`;
              return (
                <View key={i} style={[styles.eventRow, { borderLeftColor: c }]}>
                  <View style={styles.eventDateCol}>
                    <Text style={styles.eventDayName}>{DAY_NAMES[ev.date.getDay()]}</Text>
                    <Text style={[styles.eventDayNum, { color: c }]}>{ev.date.getDate()}</Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventVenue}>{ev.venue.emoji ?? '🎤'} {ev.venue.shortName ?? ev.venue.name}</Text>
                    <Text style={styles.eventTime}>{ev.venue.time}</Text>
                    <Text style={styles.eventAddress}>{ev.venue.address}</Text>
                  </View>
                  <View style={styles.eventActions}>
                    <TouchableOpacity
                      onPress={() => { haptic(); Linking.openURL(KARAFUN_URL); }}
                      style={[styles.eventQueueBtn, { borderColor: c, backgroundColor: `${c}18` }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.eventQueueBtnText, { color: c }]}>Queue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(mapsUrl)}
                      style={styles.eventMapBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="navigate-outline" size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        haptic();
                        const ok = await scheduleShowReminder(ev);
                        if (ok) Alert.alert('Reminder Set! 🔔', `We'll remind you 1 hour before the show at ${ev.venue.shortName ?? ev.venue.name}.`);
                      }}
                      style={styles.eventMapBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="notifications-outline" size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.calNote}>All shows free to attend · Tap a date to filter</Text>
        </View>

        {/* ─── Weekly Residencies ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionOver}>REGULAR SHOWS</Text>
            <Text style={styles.sectionTitle}>Weekly Residencies</Text>
            <Text style={styles.sectionSub}>Free to attend — all are welcome.</Text>
          </View>

          {venues.map(v => {
            const color = COLOR_MAP[v.color] ?? Colors.primary;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${v.mapsQuery}`;
            return (
              <View key={v.name} style={styles.venueCard}>
                <LinearGradient
                  colors={[`${color}18`, Colors.bgCard]}
                  style={styles.venueGradient}
                >
                  <View style={styles.venueTop}>
                    <Text style={styles.venueEmoji}>{v.emoji ?? '🎤'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.venueName}>{v.name}</Text>
                      <View style={[styles.dayBadge, { backgroundColor: `${color}18`, borderColor: color }]}>
                        <Text style={[styles.dayBadgeText, { color }]}>{v.schedule}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.venueDetails}>
                    <View style={styles.venueDetailRow}>
                      <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.venueDetailText}>{v.time}</Text>
                    </View>
                    <View style={styles.venueDetailRow}>
                      <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.venueDetailText}>{v.address}</Text>
                    </View>
                  </View>
                  <View style={styles.venueBtns}>
                    <TouchableOpacity
                      style={[styles.queueAtVenueBtn, { borderColor: color, backgroundColor: `${color}18` }]}
                      onPress={() => { haptic(); Linking.openURL(KARAFUN_URL); }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="musical-notes-outline" size={14} color={color} />
                      <Text style={[styles.queueAtVenueBtnText, { color }]}>Join Queue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.mapsBtn}
                      onPress={() => Linking.openURL(mapsUrl)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="navigate-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.mapsBtnText}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            );
          })}
        </View>

        {/* ─── Book Private Event ─── */}
        <LinearGradient colors={['#1a0a3c', '#0D0D14']} style={styles.bookSection}>
          <Text style={styles.bookTitle}>🎉 Book Your Own Event</Text>
          <Text style={styles.bookSub}>
            Weddings, birthdays, corporate events, bars — we bring the full show to you.
          </Text>
          <View style={styles.bookBtns}>
            <TouchableOpacity
              style={styles.bookPrimary}
              onPress={() => Linking.openURL('https://popupkaraoke.net/#contact')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary, '#6d28d9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookPrimaryGradient}
              >
                <Text style={styles.bookPrimaryText}>Get a Free Quote →</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookSecondary}
              onPress={() => Linking.openURL('tel:+12197581313')}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={16} color={Colors.primary} />
              <Text style={styles.bookSecondaryText}>219.758.1313</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bookChecks}>
            {['✓ Free quotes', '✓ No obligation', '★ 5★ rated', '🇺🇸 Veteran-owned'].map(t => (
              <Text key={t} style={styles.bookCheck}>{t}</Text>
            ))}
          </View>
        </LinearGradient>

      </ScrollView>
      <QRScannerModal visible={showQR} onClose={() => setShowQR(false)} />
    </SafeAreaView>
  );
}

// ── Calendar Styles ───────────────────────────

const calStyles = StyleSheet.create({
  grid: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekRow: { flexDirection: 'row', marginBottom: 2 },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    maxHeight: 42,
  },
  dayCellSelected: { backgroundColor: Colors.primary },
  dayCellToday: { backgroundColor: 'rgba(123,47,255,0.15)', borderWidth: 1, borderColor: Colors.primary },
  dayNum: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  dayNumSelected: { color: '#fff', fontWeight: FontWeight.bold },
  dayNumToday: { color: Colors.primary, fontWeight: FontWeight.bold },
  dot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  dotSelected: { backgroundColor: '#fff' },
});

// ── Screen Styles ─────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  liveShortcuts: { padding: Spacing.md, gap: 10, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  hereBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,224,150,0.12)', borderWidth: 1.5,
    borderColor: Colors.success, borderRadius: Radius.lg, paddingVertical: 14, paddingHorizontal: 16,
  },
  herePulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  hereBtnText: { color: Colors.success, fontSize: FontSize.sm, fontWeight: FontWeight.bold, flex: 1 },
  qrBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
    paddingVertical: 11, backgroundColor: Colors.bg,
  },
  qrBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // ── Calendar Section ──────────────────────
  calendarSection: {
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingRight: Spacing.lg,
    marginBottom: Spacing.md,
  },
  calOver: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  calTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    minWidth: 90,
    textAlign: 'center',
  },

  // ── Event List ────────────────────────────
  eventList: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  noEvents: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    fontStyle: 'italic',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  eventDateCol: { alignItems: 'center', minWidth: 32 },
  eventDayName: { color: Colors.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  eventDayNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, lineHeight: 24 },
  eventInfo: { flex: 1 },
  eventVenue: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  eventTime: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 1 },
  eventAddress: { color: Colors.textMuted, fontSize: 10, marginTop: 1 },
  eventActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventQueueBtn: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eventQueueBtnText: { fontSize: 11, fontWeight: FontWeight.bold },
  eventMapBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNote: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: Spacing.md,
  },

  // ── Queue Hero ────────────────────────────
  queueHero: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  livePulse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,224,150,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,224,150,0.3)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDotOuter: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: 'rgba(0,224,150,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  liveLabel: { color: Colors.success, fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1.5 },
  onStageLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 2, textTransform: 'uppercase' },
  heroTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.black, marginBottom: 8, letterSpacing: -0.3 },
  heroSub: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 22, marginBottom: Spacing.lg },
  queueBtn: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: 12 },
  queueBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 24 },
  queueBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  heroHint: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', letterSpacing: 0.3 },

  // ── How It Works ──────────────────────────
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  howStep: { alignItems: 'center', gap: 6, flex: 1 },
  howIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  howLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, textAlign: 'center', lineHeight: 16 },

  // ── Sections ──────────────────────────────
  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xl },
  sectionHeader: { marginBottom: Spacing.lg },
  sectionOver: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: 6 },
  sectionSub: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 },

  // ── Venue Cards ───────────────────────────
  venueCard: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  venueGradient: { padding: Spacing.md },
  venueTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  venueEmoji: { fontSize: 28, marginTop: 2 },
  venueName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 6 },
  dayBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  dayBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  venueDetails: { gap: 4, marginBottom: 12 },
  venueDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  venueDetailText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  venueBtns: { flexDirection: 'row', gap: 8 },
  queueAtVenueBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: 9 },
  queueAtVenueBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  mapsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: 'rgba(0,0,0,0.2)' },
  mapsBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },

  // ── Book Section ──────────────────────────
  bookSection: { padding: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl, marginTop: Spacing.xl },
  bookTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.black, textAlign: 'center', marginBottom: 8 },
  bookSub: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  bookBtns: { gap: 10 },
  bookPrimary: { borderRadius: Radius.lg, overflow: 'hidden' },
  bookPrimaryGradient: { paddingVertical: 15, alignItems: 'center' },
  bookPrimaryText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  bookSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 12, backgroundColor: 'rgba(124,58,237,0.08)' },
  bookSecondaryText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  bookChecks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: Spacing.lg },
  bookCheck: { color: Colors.textMuted, fontSize: FontSize.xs },
});
