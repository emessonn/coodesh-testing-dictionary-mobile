import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';
import { theme } from '../theme/theme';

interface WordGridItemProps {
  word: string;
  isFavorite: boolean;
  isViewed: boolean;
  onPress: (word: string) => void;
}

export const WordGridItem = memo(function WordGridItem({
  word,
  isFavorite,
  isViewed,
  onPress,
}: WordGridItemProps) {
  return (
    <View style={styles.cellWrapper}>
      <Surface style={styles.surface} elevation={0}>
        <TouchableRipple
          testID={`word-cell-${word}`}
          accessibilityRole="button"
          accessibilityLabel={`Word ${word}`}
          rippleColor="rgba(79, 70, 229, 0.1)"
          style={styles.touchable}
          onPress={() => onPress(word)}>
          <View style={styles.inner}>
            {isFavorite && (
              <View style={styles.badgeTopRight}>
                <Text style={styles.starIcon}>★</Text>
              </View>
            )}
            {!isFavorite && isViewed && <View style={styles.viewedDot} />}
            <Text
              variant="titleMedium"
              style={styles.wordText}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {word}
            </Text>
          </View>
        </TouchableRipple>
      </Surface>
    </View>
  );
});

const styles = StyleSheet.create({
  cellWrapper: {
    width: '33.3333%',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  touchable: {
    minHeight: 92,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    position: 'relative',
  },
  wordText: {
    color: theme.colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
  badgeTopRight: {
    position: 'absolute',
    top: 6,
    right: 8,
  },
  starIcon: {
    fontSize: 13,
    color: theme.colors.favoriteActive,
  },
  viewedDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    opacity: 0.45,
  },
});
