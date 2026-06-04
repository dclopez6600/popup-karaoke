// ─────────────────────────────────────────────
//  OnboardingScreen — 3-slide first-run walkthrough
// ─────────────────────────────────────────────

import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'musical-notes' as const,
    color: Colors.primary,
    title: 'Check 75,000+ Songs',
    subtitle: 'Search our full catalog by title or artist. Found your song? Great. If not, request it right in the app.',
    cta: 'Next',
  },
  {
    icon: 'calendar' as const,
    color: Colors.accent,
    title: 'Never Miss a Show',
    subtitle: 'See every upcoming karaoke night on an interactive calendar. Tap a date, get directions, and join the live queue.',
    cta: 'Next',
  },
  {
    icon: 'mic' as const,
    color: Colors.cyan,
    title: 'Request Songs Live',
    subtitle: 'At a show? Send your song request directly to the host from the app — no paper slips needed.',
    cta: "Let's Go 🎤",
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goTo = (i: number) => {
    setIndex(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  const next = () => {
    if (index < SLIDES.length - 1) goTo(index + 1);
    else onDone();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient colors={['#0D0D14', '#1a0a3c']} style={StyleSheet.absoluteFill} />

      {/* Skip */}
      <TouchableOpacity style={styles.skip} onPress={onDone} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: `${slide.color}20`, borderColor: slide.color }]}>
              <Ionicons name={slide.icon} size={56} color={slide.color} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.btn} onPress={next} activeOpacity={0.85}>
        <LinearGradient
          colors={[Colors.primary, '#6d28d9']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.btnGradient}
        >
          <Text style={styles.btnText}>{SLIDES[index].cta}</Text>
          {index < SLIDES.length - 1 && (
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 8 },
  skipText: { color: Colors.textMuted, fontSize: FontSize.sm },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: 24 },
  iconWrap: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  btn: { marginHorizontal: Spacing.lg, marginBottom: Platform.OS === 'ios' ? 8 : 24, borderRadius: Radius.lg, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  btnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
