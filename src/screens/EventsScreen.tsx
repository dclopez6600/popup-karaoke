// ─────────────────────────────────────────────
//  Events / Calendar Screen — Live event listing
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLiveData } from '../hooks/useLiveData';
import { Event } from '../services/api';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';
import { format } from 'date-fns';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={12}
          color={Colors.gold}
        />
      ))}
      <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, marginLeft: 2 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

function CapacityBar({ current, max }: { current: number; max: number }) {
  const pct = current / max;
  const color = pct > 0.85 ? Colors.error : pct > 0.6 ? Colors.warning : Colors.success;
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted }}>
          {current} / {max} attending
        </Text>
        <Text style={{ fontSize: FontSize.xs, color }}>
          {pct > 0.85 ? 'Almost full' : pct > 0.6 ? 'Filling up' : 'Spots open'}
        </Text>
      </View>
      <View style={{ height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: 4, backgroundColor: color, borderRadius: 2 }} />
      </View>
    </View>
  );
}

function EventDetailModal({ event, visible, onClose }: {
  event: Event | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!event) return null;
  const eventDate = new Date(event.date);
  const eventEnd = new Date(event.endDate);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={detailStyles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <LinearGradient
          colors={event.isLive ? [Colors.accent, Colors.primary] : [Colors.bgElevated, Colors.bgCard]}
          style={detailStyles.header}
        >
          <TouchableOpacity style={detailStyles.closeBtn} onPress={onClose}>
            <Ionicons name="chevron-down" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          {event.isLive && (
            <View style={detailStyles.livePill}>
              <View style={detailStyles.liveDot} />
              <Text style={detailStyles.liveText}>LIVE NOW</Text>
            </View>
          )}

          <Text style={detailStyles.title}>{event.title}</Text>
          <Text style={detailStyles.venue}>📍 {event.venue}</Text>
        </LinearGradient>

        <ScrollView style={detailStyles.scroll}>
          {/* Date & Time */}
          <View style={detailStyles.section}>
            <View style={detailStyles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={detailStyles.infoLabel}>Date & Time</Text>
                <Text style={detailStyles.infoValue}>
                  {format(eventDate, 'EEEE, MMMM d, yyyy')}
                </Text>
                <Text style={detailStyles.infoSub}>
                  {format(eventDate, 'h:mm a')} – {format(eventEnd, 'h:mm a')}
                </Text>
              </View>
            </View>

            <View style={detailStyles.infoRow}>
              <Ionicons name="location-outline" size={20} color={Colors.accent} />
              <View>
                <Text style={detailStyles.infoLabel}>Location</Text>
                <Text style={detailStyles.infoValue}>{event.venue}</Text>
                <Text style={detailStyles.infoSub}>{event.address}</Text>
              </View>
            </View>

            <View style={detailStyles.infoRow}>
              <Ionicons name="person-outline" size={20} color={Colors.cyan} />
              <View>
                <Text style={detailStyles.infoLabel}>Host</Text>
                <Text style={detailStyles.infoValue}>{event.hostName}</Text>
              </View>
            </View>
          </View>

          {/* Capacity */}
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>Attendance</Text>
            <CapacityBar current={event.attendeeCount} max={event.capacity} />
          </View>

          {/* Rating */}
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>Rating</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Text style={{ fontSize: FontSize.xxxl, color: Colors.textPrimary, fontWeight: FontWeight.black }}>
                {event.rating.toFixed(1)}
              </Text>
              <View>
                <StarRating rating={event.rating} />
                <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 }}>
                  Based on attendee reviews
                </Text>
              </View>
            </View>
          </View>

          {/* Genres */}
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>Music Genres</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {event.genre.map((g, i) => (
                <View key={i} style={detailStyles.genreTag}>
                  <Text style={detailStyles.genreText}>{g}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={detailStyles.section}>
            <Text style={detailStyles.sectionTitle}>About</Text>
            <Text style={detailStyles.description}>{event.description}</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const FILTERS = ['All', 'Live Now', 'Tonight', 'This Week'];

export default function EventsScreen() {
  const { events, isConnected, lastUpdated, refresh } = useLiveData();
  const [filter, setFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents = events.filter(event => {
    if (filter === 'Live Now') return event.isLive;
    if (filter === 'Tonight') {
      const today = new Date();
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === today.toDateString();
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#1C1230', Colors.bg]} style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={styles.headerMeta}>
          <Text style={styles.headerSub}>
            {events.length} upcoming · {isConnected ? '🟢 Live' : '🔴 Offline'}
          </Text>
        </View>
      </LinearGradient>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.map(event => {
          const eventDate = new Date(event.date);
          return (
            <TouchableOpacity
              key={event.id}
              style={[styles.card, event.isLive && styles.cardLive]}
              onPress={() => setSelectedEvent(event)}
              activeOpacity={0.85}
            >
              {event.isLive && (
                <LinearGradient
                  colors={[Colors.accent + '22', Colors.primary + '11']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}

              <View style={styles.cardHeader}>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateMonth}>
                    {format(eventDate, 'MMM').toUpperCase()}
                  </Text>
                  <Text style={styles.dateDay}>{format(eventDate, 'd')}</Text>
                </View>

                <View style={styles.cardBody}>
                  {event.isLive && (
                    <View style={styles.livePill}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE NOW</Text>
                    </View>
                  )}
                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <Text style={styles.cardVenue}>📍 {event.venue}</Text>
                  <Text style={styles.cardTime}>
                    🕐 {format(eventDate, 'h:mm a')} – {format(new Date(event.endDate), 'h:mm a')}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <StarRating rating={event.rating} />
                <View style={styles.hostRow}>
                  <Ionicons name="person-circle-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.hostText}>{event.hostName}</Text>
                </View>
                <View style={styles.genreTags}>
                  {event.genre.slice(0, 2).map((g, i) => (
                    <View key={i} style={styles.genreTag}>
                      <Text style={styles.genreText}>{g}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ marginTop: Spacing.sm }}>
                <CapacityBar current={event.attendeeCount} max={event.capacity} />
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredEvents.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No events match this filter</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <EventDetailModal
        event={selectedEvent}
        visible={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, color: Colors.textPrimary, fontWeight: FontWeight.black },
  headerMeta: { flexDirection: 'row', gap: Spacing.md, marginTop: 4 },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted },
  filterRow: { maxHeight: 52 },
  filterContent: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filterPill: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterTextActive: { color: '#fff', fontWeight: FontWeight.semibold },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardLive: { borderColor: Colors.accent + '66' },
  cardHeader: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  dateBlock: { width: 48, alignItems: 'center', backgroundColor: Colors.bgElevated, borderRadius: Radius.sm, padding: Spacing.xs },
  dateMonth: { fontSize: 10, color: Colors.accent, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  dateDay: { fontSize: 26, color: Colors.textPrimary, fontWeight: FontWeight.black, lineHeight: 32 },
  cardBody: { flex: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.error + '22', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.error },
  liveText: { fontSize: 10, color: Colors.error, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  cardTitle: { fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: FontWeight.bold },
  cardVenue: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 3 },
  cardTime: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  hostText: { fontSize: FontSize.xs, color: Colors.textMuted },
  genreTags: { flexDirection: 'row', gap: 4 },
  genreTag: { backgroundColor: Colors.primary + '22', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  genreText: { fontSize: 11, color: Colors.primaryLight },
  empty: { alignItems: 'center', padding: Spacing.xxxl, gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 20, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  closeBtn: { alignSelf: 'center', marginBottom: Spacing.md, opacity: 0.7 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'center', marginBottom: Spacing.sm },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveText: { fontSize: 11, color: '#fff', fontWeight: FontWeight.black, letterSpacing: 1 },
  title: { fontSize: FontSize.xxl, color: Colors.textPrimary, fontWeight: FontWeight.black, textAlign: 'center' },
  venue: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 4 },
  scroll: { flex: 1 },
  section: { padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'flex-start' },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  infoSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  genreTag: { backgroundColor: Colors.primary + '22', borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  genreText: { fontSize: FontSize.sm, color: Colors.primaryLight, fontWeight: FontWeight.medium },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24 },
});
