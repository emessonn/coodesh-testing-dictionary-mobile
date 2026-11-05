import React, { useCallback } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { TopTabs } from '../components/TopTabs';
import { WordGridItem } from '../components/WordGridItem';
import { useAuth } from '../context/AuthContext';
import { DictionaryTab, useDictionary } from '../context/DictionaryContext';
import { theme } from '../theme/theme';
import { WordDetailModal } from './WordDetailModal';

const SECTION_LABELS: Record<DictionaryTab, string> = {
  wordlist: 'Word list',
  history: 'History',
  favorites: 'Favorites',
};

export function HomeScreen() {
  const { user, logout } = useAuth();
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    displayedWords,
    isLoadingWords,
    loadMoreWords,
    favoriteWordsSet,
    historyWordsSet,
    openWordDetails,
  } = useDictionary();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<string>) => (
      <WordGridItem
        word={item}
        isFavorite={favoriteWordsSet.has(item)}
        isViewed={historyWordsSet.has(item)}
        onPress={openWordDetails}
      />
    ),
    [favoriteWordsSet, historyWordsSet, openWordDetails],
  );

  const keyExtractor = useCallback((item: string) => item, []);

  return (
    <View style={styles.container} testID="home-screen">
      <View style={styles.userBar}>
        <Chip compact mode="outlined" style={styles.userChip}>
          Olá, {user?.displayName || user?.username}
        </Chip>
        <Button
          testID="logout-button"
          mode="outlined"
          compact
          onPress={logout}
          style={styles.logoutBtn}>
          Sair
        </Button>
      </View>

      <TopTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      <View style={styles.sectionHeaderRow}>
        <Text
          testID="active-section-title"
          variant="titleLarge"
          style={styles.sectionTitle}>
          {SECTION_LABELS[activeTab]}
        </Text>
        <TextInput
          testID="word-search-input"
          mode="outlined"
          dense
          placeholder="Filtrar..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchInput}
        />
      </View>

      <Surface style={styles.gridWrapper} elevation={1}>
        <View style={styles.gridInner}>
          <FlatList
            testID="words-grid-list"
            data={displayedWords}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            numColumns={3}
            showsVerticalScrollIndicator={true}
            onEndReached={loadMoreWords}
            onEndReachedThreshold={0.4}
            initialNumToRender={24}
            maxToRenderPerBatch={24}
            windowSize={7}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {activeTab === 'favorites'
                    ? 'Nenhuma palavra favoritada ainda.'
                    : activeTab === 'history'
                    ? 'Nenhuma palavra visualizada ainda.'
                    : 'Nenhuma palavra encontrada.'}
                </Text>
              </View>
            }
            ListFooterComponent={
              isLoadingWords && activeTab === 'wordlist' ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator
                    animating
                    size="small"
                    color={theme.colors.primary}
                  />
                </View>
              ) : undefined
            }
          />
        </View>
      </Surface>

      <WordDetailModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userChip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  logoutBtn: {
    borderRadius: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  searchInput: {
    flex: 1,
    maxWidth: 190,
    backgroundColor: theme.colors.surface,
    fontSize: 14,
  },
  gridWrapper: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  gridInner: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
