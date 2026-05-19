// ─────────────────────────────────────────────
//  PopUp Karaoke · Design System
//  Dark neon-club aesthetic — premium & energetic
// ─────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg: '#0D0D14',          // deep near-black
  bgCard: '#14141F',      // card surface
  bgElevated: '#1C1C2E',  // modals, sheets
  bgInput: '#1E1E2E',     // input fields

  // Brand
  primary: '#7B2FFF',     // vivid purple
  primaryLight: '#9B5FFF',
  primaryDark: '#5B0FDF',
  accent: '#FF2D8B',      // hot pink
  accentLight: '#FF5DA8',
  cyan: '#00E5FF',        // electric cyan
  gold: '#FFD700',        // for stars/ratings

  // Semantic
  success: '#00E096',
  warning: '#FFAA00',
  error: '#FF4D6A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#60607A',
  textInverse: '#0D0D14',

  // Borders
  border: '#2A2A3E',
  borderLight: '#3A3A5A',

  // Overlays
  overlay: 'rgba(13,13,20,0.85)',
  overlayLight: 'rgba(13,13,20,0.5)',

  // Gradients (arrays for LinearGradient)
  gradientPrimary: ['#7B2FFF', '#FF2D8B'] as const,
  gradientDark: ['#0D0D14', '#1C1C2E'] as const,
  gradientCard: ['#1C1C2E', '#14141F'] as const,
  gradientNow: ['#7B2FFF', '#00E5FF'] as const,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 48,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const Shadow = {
  card: {
    shadowColor: '#7B2FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#7B2FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  accentGlow: {
    shadowColor: '#FF2D8B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

export const Animation = {
  fast: 150,
  medium: 300,
  slow: 500,
} as const;
