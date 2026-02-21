// AI Medical App — Design System
// Soft blue/teal NHS-style theme

export const colors = {
  // Primary gradient (teal → aqua)
  primaryGradientStart: '#CFEFEF',
  primaryGradientEnd: '#A8DADC',
  primaryGradient: ['#CFEFEF', '#A8DADC'] as const,

  // Accent gradient (soft purple buttons)
  accentGradientStart: '#9B8EC4',
  accentGradientEnd: '#7B6BA8',
  accentGradient: ['#9B8EC4', '#7B6BA8'] as const,

  // Background gradient (light mint / light blue)
  backgroundGradientStart: '#F0FAFA',
  backgroundGradientEnd: '#E0F4F4',
  backgroundGradient: ['#F0FAFA', '#E0F4F4'] as const,

  // Header gradient
  headerGradientStart: '#D4F1F4',
  headerGradientEnd: '#B8E6E8',
  headerGradient: ['#D4F1F4', '#B8E6E8'] as const,

  // Teal accent
  teal: '#5DADE2',
  tealDark: '#3498DB',
  tealLight: '#AED6F1',
  tealGradient: ['#5DADE2', '#48C9B0'] as const,

  // Neutrals
  white: '#FFFFFF',
  card: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  border: '#DFE6E9',
  shadow: 'rgba(0, 0, 0, 0.06)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Semantic
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#E17055',
  info: '#74B9FF',

  // Chat
  userBubble: '#D4F1F4',
  aiBubble: '#FFFFFF',

  // Tab bar
  tabActive: '#5DADE2',
  tabInactive: '#B2BEC3',
};

export const gradients = {
  primary: ['#CFEFEF', '#A8DADC'] as const,
  accent: ['#9B8EC4', '#7B6BA8'] as const,
  background: ['#F0FAFA', '#E0F4F4'] as const,
  header: ['#D4F1F4', '#B8E6E8'] as const,
  teal: ['#5DADE2', '#48C9B0'] as const,
  send: ['#5DADE2', '#48C9B0'] as const,
  card: ['#FFFFFF', '#F8FCFC'] as const,
  subscription: ['#D4F1F4', '#A8DADC'] as const,
};

export const borderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
    // Generous line height so tall scripts like Burmese aren't clipped
    lineHeight: 44,
    // Extra padding so tall glyphs like Burmese have breathing room
    paddingTop: 8,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: 36,
    paddingTop: 8,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 30,
    paddingTop: 6,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.text,
    lineHeight: 26,
    paddingTop: 4,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
    paddingTop: 4,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: colors.textLight,
    lineHeight: 18,
    paddingTop: 4,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
    lineHeight: 24,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 18,
    paddingTop: 4,
  },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: '#5DADE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
};

export default {
  colors,
  gradients,
  borderRadius,
  spacing,
  typography,
  shadows,
};
