import { MD3LightTheme, MD3Theme } from 'react-native-paper';

export const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    cardPink: '#F3E5EC',
    cardPinkBorder: '#DFC5D3',
    border: '#CBD5E1',
    borderStrong: '#334155',
    tabActiveBg: '#E2E8F0',
    tabInactiveBg: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: '#4F46E5',
    primaryLight: '#EEF2FF',
    progressTrack: '#E2E8F0',
    progressFill: '#38BDF8',
    favoriteActive: '#F59E0B',
    cacheBadgeBg: '#DCFCE7',
    cacheBadgeText: '#166534',
    apiBadgeBg: '#DBEAFE',
    apiBadgeText: '#1E40AF',
    danger: '#DC2626',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: theme.colors.primary,
    primaryContainer: theme.colors.primaryLight,
    secondary: '#7C3AED',
    secondaryContainer: theme.colors.cardPink,
    background: theme.colors.background,
    surface: theme.colors.surface,
    surfaceVariant: '#F1F5F9',
    outline: theme.colors.border,
    error: theme.colors.danger,
  },
};
