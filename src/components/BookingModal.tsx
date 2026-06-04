// ─────────────────────────────────────────────
//  BookingModal — In-app event booking form
//  Smart date picker shows availability urgency.
// ─────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const EVENT_TYPES = ['Birthday Party', 'Wedding', 'Bar / Brewery', 'Private Party', 'Corporate Event', 'Other'];
const GUEST_RANGES = ['Under 25', '25–50', '50–75', '75–100', '100–150', '150+'];
const HOURS = ['1 hour', '2 hours', '3 hours', '4 hours', '5+ hours', 'Not sure yet'];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES = ['S','M','T','W','T','F','S'];

// ── Date availability logic ───────────────────
function getDateStatus(date: Date): 'past' | 'hot' | 'busy' | 'available' {
  const now = new Date();
  now.setHours(0,0,0,0);
  if (date < now) return 'past';
  const day = date.getDay();
  const isWeekend = day === 5 || day === 6; // Fri/Sat
  const month = date.getMonth();
  const isSummer = month >= 5 && month <= 7; // Jun–Aug
  const weeksOut = (date.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000);
  if (isWeekend && isSummer) return 'hot';
  if (isWeekend && weeksOut <= 4) return 'busy';
  return 'available';
}

function DatePicker({
  selectedDate, onSelect,
}: { selectedDate: string; onSelect: (d: string) => void }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const selectedKey = selectedDate;

  return (
    <View style={dp.wrap}>
      {/* Month nav */}
      <View style={dp.nav}>
        <TouchableOpacity onPress={prevMonth} style={dp.navBtn}>
          <Ionicons name="chevron-back" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={dp.navLabel}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={dp.navBtn}>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      {/* Day headers */}
      <View style={dp.headerRow}>
        {DAY_NAMES.map((d,i) => <Text key={i} style={dp.dayHeader}>{d}</Text>)}
      </View>
      {/* Weeks */}
      {Array.from({ length: Math.ceil(cells.length / 7) }, (_, wi) => (
        <View key={wi} style={dp.weekRow}>
          {cells.slice(wi * 7, wi * 7 + 7).map((day, di) => {
            if (!day) return <View key={di} style={dp.dayCell} />;
            const date = new Date(viewYear, viewMonth, day);
            const status = getDateStatus(date);
            const key = `${viewYear}-${viewMonth+1}-${day}`;
            const isSelected = key === selectedKey;
            const isPast = status === 'past';
            return (
              <TouchableOpacity
                key={di}
                style={[
                  dp.dayCell,
                  isSelected && dp.dayCellSelected,
                  !isSelected && status === 'hot' && dp.dayCellHot,
                  !isSelected && status === 'busy' && dp.dayCellBusy,
                  isPast && dp.dayCellPast,
                ]}
                onPress={() => !isPast && onSelect(key)}
                activeOpacity={isPast ? 1 : 0.7}
                disabled={isPast}
              >
                <Text style={[
                  dp.dayNum,
                  isSelected && dp.dayNumSelected,
                  isPast && dp.dayNumPast,
                  !isSelected && status === 'hot' && dp.dayNumHot,
                  !isSelected && status === 'busy' && dp.dayNumBusy,
                ]}>{day}</Text>
                {!isPast && status !== 'available' && !isSelected && (
                  <View style={[dp.urgencyDot, status === 'hot' ? dp.dotHot : dp.dotBusy]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      {/* Legend */}
      <View style={dp.legend}>
        <View style={dp.legendItem}><View style={[dp.legendDot, { backgroundColor: '#F59E0B' }]} /><Text style={dp.legendText}>Filling fast</Text></View>
        <View style={dp.legendItem}><View style={[dp.legendDot, { backgroundColor: Colors.accent }]} /><Text style={dp.legendText}>In demand</Text></View>
        <View style={dp.legendItem}><View style={[dp.legendDot, { backgroundColor: Colors.success }]} /><Text style={dp.legendText}>Available</Text></View>
      </View>
    </View>
  );
}

const dp = StyleSheet.create({
  wrap: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  navLabel: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  headerRow: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', color: Colors.textMuted, fontSize: 10, fontWeight: FontWeight.semibold },
  weekRow: { flexDirection: 'row', marginBottom: 2 },
  dayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, maxHeight: 38 },
  dayCellSelected: { backgroundColor: Colors.primary },
  dayCellHot: { backgroundColor: 'rgba(245,158,11,0.18)', borderWidth: 1, borderColor: '#F59E0B' },
  dayCellBusy: { backgroundColor: 'rgba(255,45,139,0.1)', borderWidth: 1, borderColor: Colors.accent },
  dayCellPast: { opacity: 0.25 },
  dayNum: { color: Colors.textSecondary, fontSize: 12, fontWeight: FontWeight.medium },
  dayNumSelected: { color: '#fff', fontWeight: FontWeight.bold },
  dayNumPast: { color: Colors.textMuted },
  dayNumHot: { color: '#F59E0B', fontWeight: FontWeight.bold },
  dayNumBusy: { color: Colors.accent, fontWeight: FontWeight.bold },
  urgencyDot: { width: 3, height: 3, borderRadius: 2, marginTop: 1 },
  dotHot: { backgroundColor: '#F59E0B' },
  dotBusy: { backgroundColor: Colors.accent },
  legend: { flexDirection: 'row', gap: 12, marginTop: 8, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: Colors.textMuted, fontSize: 10 },
});

// ── Main Modal ────────────────────────────────

export default function BookingModal({ visible, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState('');
  const [hours, setHours]   = useState('');
  const [city, setCity]     = useState('');
  const [notes, setNotes]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const reset = () => {
    setStep(1); setName(''); setEmail(''); setPhone('');
    setEventType(''); setSelectedDate(''); setGuests('');
    setHours(''); setCity(''); setNotes('');
    setSubmitting(false); setSubmitted(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const step1Valid = name.trim() && email.trim();
  const step2Valid = eventType && selectedDate;

  const submit = async () => {
    setSubmitting(true);
    const payload = { name, email, phone, eventType, date: selectedDate, guests, hours, city, notes, submittedAt: new Date().toISOString() };

    try {
      const res = await fetch('https://karaoke-connect-dclopez6600.replit.app/api/booking-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('no confirmation');
    } catch {
      // Fallback: open email so booking never gets lost
      const subject = encodeURIComponent(`Booking Request: ${eventType} — ${selectedDate}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nEvent Type: ${eventType}\nDate: ${selectedDate}\nGuests: ${guests || 'N/A'}\nHours: ${hours || 'N/A'}\nCity: ${city || 'N/A'}\nNotes: ${notes || 'N/A'}`
      );
      Linking.openURL(`mailto:booking@popupkaraoke.net?subject=${subject}&body=${body}`);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎉 Book Your Event</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        {!submitted && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPct}%` }]} />
          </View>
        )}

        {submitted ? (
          <View style={styles.successWrap}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Request Sent!</Text>
            <Text style={styles.successSub}>
              Thanks {name.split(' ')[0]}! We'll review your details and send a custom quote within a few hours.
            </Text>
            <Text style={styles.successNote}>No obligation · Free quote · Usually within 24 hrs</Text>
            <TouchableOpacity style={styles.submitBtn} onPress={handleClose}>
              <Text style={styles.submitBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

            {/* Step indicator */}
            <Text style={styles.stepLabel}>Step {step} of 3</Text>

            {/* ── Step 1: Your Info ── */}
            {step === 1 && (
              <>
                <Text style={styles.stepTitle}>Your Info</Text>
                <Text style={styles.label}>Your Name *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
                <Text style={styles.label}>Email Address *</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" />
                <Text style={styles.label}>Phone (optional)</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="219-555-0100" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />
                <TouchableOpacity
                  style={[styles.submitBtn, !step1Valid && styles.submitBtnDisabled]}
                  onPress={() => step1Valid && setStep(2)}
                  disabled={!step1Valid}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitBtnText}>Next — Event Details →</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Step 2: Event Details ── */}
            {step === 2 && (
              <>
                <Text style={styles.stepTitle}>Event Details</Text>
                <Text style={styles.label}>Event Type *</Text>
                <View style={styles.chipGrid}>
                  {EVENT_TYPES.map(t => (
                    <TouchableOpacity key={t} style={[styles.chip, eventType === t && styles.chipActive]} onPress={() => setEventType(t)} activeOpacity={0.7}>
                      <Text style={[styles.chipText, eventType === t && styles.chipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Event Date *</Text>
                <DatePicker selectedDate={selectedDate} onSelect={setSelectedDate} />
                {selectedDate && (
                  <View style={styles.selectedDateRow}>
                    <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                    <Text style={styles.selectedDateText}>Selected: {selectedDate}</Text>
                  </View>
                )}
                <Text style={styles.label}>Expected Guests</Text>
                <View style={styles.chipGrid}>
                  {GUEST_RANGES.map(g => (
                    <TouchableOpacity key={g} style={[styles.chip, guests === g && styles.chipActive]} onPress={() => setGuests(g)} activeOpacity={0.7}>
                      <Text style={[styles.chipText, guests === g && styles.chipTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={[styles.submitBtn, { flex: 1, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border }]} onPress={() => setStep(1)} activeOpacity={0.8}>
                    <Text style={[styles.submitBtnText, { color: Colors.textSecondary }]}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.submitBtn, { flex: 2 }, !step2Valid && styles.submitBtnDisabled]} onPress={() => step2Valid && setStep(3)} disabled={!step2Valid} activeOpacity={0.85}>
                    <Text style={styles.submitBtnText}>Next →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── Step 3: Final Details ── */}
            {step === 3 && (
              <>
                <Text style={styles.stepTitle}>Almost Done</Text>
                <Text style={styles.label}>Hours Needed</Text>
                <View style={styles.chipGrid}>
                  {HOURS.map(h => (
                    <TouchableOpacity key={h} style={[styles.chip, hours === h && styles.chipActive]} onPress={() => setHours(h)} activeOpacity={0.7}>
                      <Text style={[styles.chipText, hours === h && styles.chipTextActive]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.label}>Venue City / Zip</Text>
                <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. Hammond, IN 46320" placeholderTextColor={Colors.textMuted} />
                <Text style={styles.label}>Anything else we should know?</Text>
                <TextInput style={[styles.input, styles.inputMulti]} value={notes} onChangeText={setNotes} placeholder="Theme, special requests, venue name…" placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} />
                <Text style={styles.disclaimer}>Free quote · No obligation · We usually respond within a few hours.</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={[styles.submitBtn, { flex: 1, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border }]} onPress={() => setStep(2)} activeOpacity={0.8}>
                    <Text style={[styles.submitBtnText, { color: Colors.textSecondary }]}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.submitBtn, { flex: 2 }, submitting && styles.submitBtnDisabled]} onPress={submit} disabled={submitting} activeOpacity={0.85}>
                    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>🎉 Send My Quote Request</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.bgCard },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 3, backgroundColor: Colors.border },
  progressBar: { height: 3, backgroundColor: Colors.primary },
  form: { padding: Spacing.md, paddingBottom: 60 },
  stepLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  stepTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, color: Colors.textPrimary, fontSize: FontSize.md },
  inputMulti: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.bgCard },
  chipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(123,47,255,0.15)' },
  chipText: { color: Colors.textMuted, fontSize: FontSize.sm },
  chipTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  selectedDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  selectedDateText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  disclaimer: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginVertical: 10 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 14 },
  successEmoji: { fontSize: 64 },
  successTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  successSub: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  successNote: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center' },
});
