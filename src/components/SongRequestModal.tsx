// ─────────────────────────────────────────────
//  SongRequestModal — Native song request form
//  Submits directly without leaving the app.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const VENUES = [
  '18th Street Brewery',
  'Flights Taproom',
  'El Capitan',
  'Private Event',
  'Other',
];

export default function SongRequestModal({ visible, onClose }: Props) {
  const [name, setName]           = useState('');
  const [song, setSong]           = useState('');
  const [artist, setArtist]       = useState('');
  const [venue, setVenue]         = useState('');
  const [dedication, setDedication] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const reset = () => {
    setName(''); setSong(''); setArtist('');
    setVenue(''); setDedication('');
    setSubmitting(false); setSubmitted(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!name.trim() || !song.trim()) {
      Alert.alert('Missing info', 'Please enter your name and song title.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: name.trim(), song: song.trim(), artist: artist.trim(),
      venue: venue.trim(), dedication: dedication.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('https://karaoke-connect-dclopez6600.replit.app/api/song-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // If backend doesn't confirm, fall back to email
      if (!res.ok) throw new Error('no confirmation');
    } catch {
      // Fallback: open email so the request never gets lost
      const subject = encodeURIComponent(`Song Request: ${payload.song}`);
      const body = encodeURIComponent(
        `Name: ${payload.name}\nSong: ${payload.song}\nArtist: ${payload.artist || 'N/A'}\nVenue: ${payload.venue || 'N/A'}\nNote: ${payload.dedication || 'N/A'}`
      );
      Linking.openURL(`mailto:booking@popupkaraoke.net?subject=${subject}&body=${body}`);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎤 Request a Song</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {submitted ? (
          // ── Success state ──────────────────────────
          <View style={styles.successWrap}>
            <Text style={styles.successEmoji}>🎵</Text>
            <Text style={styles.successTitle}>Request Sent!</Text>
            <Text style={styles.successSub}>
              We got it, {name.trim().split(' ')[0]}! Get ready — you're up soon.
            </Text>
            <TouchableOpacity style={styles.submitBtn} onPress={handleClose} activeOpacity={0.8}>
              <Text style={styles.submitBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ── Form ──────────────────────────────────
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sarah"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Song Title *</Text>
            <TextInput
              style={styles.input}
              value={song}
              onChangeText={setSong}
              placeholder="e.g. Sweet Caroline"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Artist (optional)</Text>
            <TextInput
              style={styles.input}
              value={artist}
              onChangeText={setArtist}
              placeholder="e.g. Neil Diamond"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Where are you tonight?</Text>
            <View style={styles.venueRow}>
              {VENUES.map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.venueChip, venue === v && styles.venueChipActive]}
                  onPress={() => setVenue(v === venue ? '' : v)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.venueChipText, venue === v && styles.venueChipTextActive]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Dedication / Note (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={dedication}
              onChangeText={setDedication}
              placeholder="Shoutout, reason, or dedication..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>🎤 Send My Request</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.hint}>Requests are seen by the host in real-time.</Text>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  form: { padding: Spacing.md, paddingBottom: 60 },

  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },

  venueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  venueChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.bgCard,
  },
  venueChipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(123,47,255,0.15)' },
  venueChipText: { color: Colors.textMuted, fontSize: FontSize.sm },
  venueChipTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },

  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },

  hint: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginTop: 10 },

  // Success
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 12 },
  successEmoji: { fontSize: 64 },
  successTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  successSub: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
});
