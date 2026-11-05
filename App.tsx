import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { appContainer, DIContainer } from './src/di/container';
import { AuthProvider, useAuth } from './src/presentation/context/AuthContext';
import { DictionaryProvider } from './src/presentation/context/DictionaryContext';
import { ServiceProvider } from './src/presentation/context/ServiceContext';
import { AuthScreen } from './src/presentation/screens/AuthScreen';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { paperTheme, theme } from './src/presentation/theme/theme';

const ICON_GLYPHS: Record<string, string> = {
  magnify: '⌕',
  close: '✕',
  star: '★',
  'star-outline': '☆',
  play: '▶',
  stop: '■',
  pause: '❚❚',
  'arrow-left': '←',
  'arrow-right': '→',
  logout: '↪',
  account: '●',
};

function renderIcon({
  name,
  size = 16,
  color = theme.colors.textPrimary,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const glyph = ICON_GLYPHS[name] || '•';
  return (
    <Text style={{ fontSize: size * 0.85, color, lineHeight: size }}>
      {glyph}
    </Text>
  );
}

function RootNavigation() {
  const { user, isInitializing } = useAuth();
  const insets = useSafeAreaInsets();

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 58 : 12);
  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === 'ios' ? 24 : 10,
  );

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer} testID="app-initializing">
        <ActivityIndicator
          animating
          size="large"
          color={theme.colors.primary}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.safeArea,
        { paddingTop: topPadding, paddingBottom: bottomPadding },
      ]}>
      {!user ? (
        <AuthScreen />
      ) : (
        <DictionaryProvider>
          <HomeScreen />
        </DictionaryProvider>
      )}
    </View>
  );
}

interface AppProps {
  container?: DIContainer;
}

export function App({ container = appContainer }: AppProps) {
  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={paperTheme}
        settings={{
          icon: props => renderIcon(props),
        }}>
        <ServiceProvider container={container}>
          <AuthProvider>
            <StatusBar barStyle="dark-content" />
            <RootNavigation />
          </AuthProvider>
        </ServiceProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default App;
