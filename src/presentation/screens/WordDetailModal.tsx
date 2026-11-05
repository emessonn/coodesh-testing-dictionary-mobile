import React, { useMemo } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Chip,
  Divider,
  Surface,
  Text,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioPlayerBar } from '../components/AudioPlayerBar';
import { useDictionary } from '../context/DictionaryContext';
import { theme } from '../theme/theme';

function capitalize(value: string): string {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function WordDetailModal() {
  const insets = useSafeAreaInsets();
  const {
    selectedWord,
    wordDetails,
    isLoadingDetails,
    detailsError,
    closeWordDetails,
    toggleFavorite,
    isWordFavorite,
    hasPreviousWord,
    hasNextWord,
    goToPreviousWord,
    goToNextWord,
  } = useDictionary();

  const visible = Boolean(selectedWord);
  const entry = wordDetails?.entry;
  const isFav = selectedWord ? isWordFavorite(selectedWord) : false;

  const topSafePadding = Math.max(
    insets.top + 8,
    Platform.OS === 'ios' ? 58 : 20,
  );
  const bottomSafePadding = Math.max(
    insets.bottom + 8,
    Platform.OS === 'ios' ? 28 : 20,
  );

  const phoneticsAudioUrls = useMemo(() => {
    if (!entry?.phonetics) {
      return [];
    }
    return entry.phonetics
      .map(p => p.audio)
      .filter((u): u is string => Boolean(u && u.trim().length > 0));
  }, [entry]);

  if (!visible || !selectedWord) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={closeWordDetails}>
      <View
        style={[
          styles.root,
          { paddingTop: topSafePadding, paddingBottom: bottomSafePadding },
        ]}
        testID="word-detail-modal">
        <View style={styles.topBar}>
          <TouchableOpacity
            testID="close-detail-button"
            accessibilityRole="button"
            activeOpacity={0.7}
            style={styles.closeButton}
            onPress={closeWordDetails}>
            <Text variant="headlineSmall" style={styles.closeButtonText}>
              ✕
            </Text>
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            {wordDetails && (
              <Chip
                testID="source-cache-badge"
                compact
                style={[
                  styles.sourceChip,
                  wordDetails.fromCache ? styles.cacheChip : styles.apiChip,
                ]}
                textStyle={[
                  styles.sourceChipText,
                  wordDetails.fromCache
                    ? styles.cacheChipText
                    : styles.apiChipText,
                ]}>
                {wordDetails.fromCache ? 'CACHE' : 'API'}
              </Chip>
            )}

            <TouchableOpacity
              testID="toggle-favorite-button"
              accessibilityRole="button"
              activeOpacity={0.7}
              onPress={() => toggleFavorite(selectedWord)}
              style={[
                styles.favoriteButton,
                isFav && styles.favoriteButtonActive,
              ]}>
              <Text style={styles.favoriteButtonText}>
                {isFav ? '★ Favorito' : '☆ Favoritar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Surface style={styles.wordHeroBox} elevation={1}>
            <Text
              testID="detail-word-title"
              variant="headlineMedium"
              style={styles.wordTitle}>
              {entry?.word || selectedWord}
            </Text>
            <Text
              testID="detail-word-phonetic"
              variant="titleLarge"
              style={styles.phoneticText}>
              {entry?.phonetic || `/${selectedWord}/`}
            </Text>
          </Surface>

          <AudioPlayerBar
            word={entry?.word || selectedWord}
            phoneticsAudioUrls={phoneticsAudioUrls}
          />

          {entry?.origin ? (
            <Surface style={styles.originCard} elevation={0}>
              <Text variant="labelMedium" style={styles.originLabel}>
                Origin / Etymology
              </Text>
              <Text variant="bodyMedium" style={styles.originText}>
                {entry.origin}
              </Text>
            </Surface>
          ) : null}

          <Text variant="headlineSmall" style={styles.meaningsHeading}>
            Meanings
          </Text>
          <Divider style={styles.divider} />

          {isLoadingDetails ? (
            <View style={styles.centerBox}>
              <ActivityIndicator
                animating
                size="large"
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Carregando...
              </Text>
            </View>
          ) : detailsError ? (
            <Surface style={styles.errorBox} elevation={0}>
              <Text variant="bodyMedium" style={styles.errorText}>
                {detailsError}
              </Text>
            </Surface>
          ) : entry && entry.meanings.length > 0 ? (
            <View style={styles.meaningsList}>
              {entry.meanings.map((meaning, mIdx) => {
                const combinedSynonyms = Array.from(
                  new Set([
                    ...(meaning.synonyms || []),
                    ...meaning.definitions.flatMap(d => d.synonyms || []),
                  ]),
                ).slice(0, 6);

                const combinedAntonyms = Array.from(
                  new Set([
                    ...(meaning.antonyms || []),
                    ...meaning.definitions.flatMap(d => d.antonyms || []),
                  ]),
                ).slice(0, 6);

                return (
                  <Surface
                    key={`${meaning.partOfSpeech}-${mIdx}`}
                    style={styles.meaningCard}
                    elevation={0}>
                    {meaning.definitions.map((def, dIdx) => (
                      <View key={dIdx} style={styles.definitionItem}>
                        <Text variant="bodyLarge" style={styles.definitionLine}>
                          <Text style={styles.partOfSpeechText}>
                            {capitalize(meaning.partOfSpeech)} -{' '}
                          </Text>
                          {def.definition}
                        </Text>
                        {def.example ? (
                          <Text variant="bodyMedium" style={styles.exampleText}>
                            "{def.example}"
                          </Text>
                        ) : null}
                      </View>
                    ))}

                    {combinedSynonyms.length > 0 ? (
                      <View style={styles.relationsBlock}>
                        <Text variant="labelSmall" style={styles.relationLabel}>
                          Synonyms:
                        </Text>
                        <View style={styles.synonymsRow}>
                          {combinedSynonyms.map(syn => (
                            <Chip
                              key={syn}
                              compact
                              mode="outlined"
                              style={styles.synonymChip}>
                              {syn}
                            </Chip>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {combinedAntonyms.length > 0 ? (
                      <View style={styles.relationsBlock}>
                        <Text variant="labelSmall" style={styles.relationLabel}>
                          Antonyms:
                        </Text>
                        <View style={styles.synonymsRow}>
                          {combinedAntonyms.map(ant => (
                            <Chip
                              key={ant}
                              compact
                              mode="outlined"
                              style={styles.synonymChip}>
                              {ant}
                            </Chip>
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </Surface>
                );
              })}
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.emptyMeaningText}>
              Nenhum significado encontrado.
            </Text>
          )}
        </ScrollView>

        <View style={styles.bottomNavRow}>
          <TouchableOpacity
            testID="prev-word-button"
            accessibilityRole="button"
            activeOpacity={0.75}
            disabled={!hasPreviousWord}
            style={[
              styles.navButton,
              styles.navButtonOutlined,
              !hasPreviousWord && styles.navButtonDisabled,
            ]}
            onPress={() => {
              if (hasPreviousWord) {
                goToPreviousWord();
              }
            }}>
            <Text
              style={[
                styles.navButtonText,
                styles.navButtonOutlinedText,
                !hasPreviousWord && styles.navButtonTextDisabled,
              ]}>
              Voltar
            </Text>
          </TouchableOpacity>

          <View style={styles.navButtonsGap} />

          <TouchableOpacity
            testID="next-word-button"
            accessibilityRole="button"
            activeOpacity={0.75}
            disabled={!hasNextWord}
            style={[
              styles.navButton,
              styles.navButtonContained,
              !hasNextWord && styles.navButtonDisabled,
            ]}
            onPress={() => {
              if (hasNextWord) {
                goToNextWord();
              }
            }}>
            <Text
              style={[
                styles.navButtonText,
                styles.navButtonContainedText,
                !hasNextWord && styles.navButtonTextDisabled,
              ]}>
              Próximo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceChip: {
    marginRight: 10,
  },
  cacheChip: {
    backgroundColor: theme.colors.cacheBadgeBg,
  },
  apiChip: {
    backgroundColor: theme.colors.apiBadgeBg,
  },
  sourceChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cacheChipText: {
    color: theme.colors.cacheBadgeText,
  },
  apiChipText: {
    color: theme.colors.apiBadgeText,
  },
  favoriteButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  favoriteButtonActive: {
    backgroundColor: '#FEF3C7',
    borderColor: theme.colors.favoriteActive,
  },
  favoriteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  wordHeroBox: {
    backgroundColor: theme.colors.cardPink,
    borderWidth: 1,
    borderColor: theme.colors.cardPinkBorder,
    borderRadius: 16,
    minHeight: 185,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  wordTitle: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 14,
    textAlign: 'center',
  },
  phoneticText: {
    fontWeight: '400',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  originCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  originLabel: {
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  originText: {
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  meaningsHeading: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 14,
  },
  centerBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textSecondary,
  },
  errorBox: {
    borderWidth: 1,
    borderColor: theme.colors.danger,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: theme.colors.danger,
  },
  meaningsList: {
    gap: 12,
  },
  meaningCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  definitionItem: {
    marginBottom: 8,
  },
  definitionLine: {
    lineHeight: 22,
    color: theme.colors.textPrimary,
  },
  partOfSpeechText: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  exampleText: {
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  relationsBlock: {
    marginTop: 8,
  },
  relationLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  synonymsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  synonymChip: {
    backgroundColor: theme.colors.background,
  },
  emptyMeaningText: {
    color: theme.colors.textMuted,
  },
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  navButtonsGap: {
    width: 14,
  },
  navButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonOutlined: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  navButtonContained: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  navButtonOutlinedText: {
    color: theme.colors.textPrimary,
  },
  navButtonContainedText: {
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
});
