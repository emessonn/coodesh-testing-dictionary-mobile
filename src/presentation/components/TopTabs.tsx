import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';
import { DictionaryTab } from '../context/DictionaryContext';
import { theme } from '../theme/theme';

interface TopTabsProps {
  activeTab: DictionaryTab;
  onSelectTab: (tab: DictionaryTab) => void;
}

const TABS: { key: DictionaryTab; label: string; testID: string }[] = [
  { key: 'wordlist', label: 'Word list', testID: 'tab-wordlist' },
  { key: 'history', label: 'History', testID: 'tab-history' },
  { key: 'favorites', label: 'Favorites', testID: 'tab-favorites' },
];

export function TopTabs({ activeTab, onSelectTab }: TopTabsProps) {
  return (
    <Surface style={styles.container} elevation={1} accessibilityRole="tablist">
      <View style={styles.innerRow}>
        {TABS.map((tab, idx) => {
          const selected = activeTab === tab.key;
          const isLast = idx === TABS.length - 1;
          return (
            <TouchableRipple
              key={tab.key}
              testID={tab.testID}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              rippleColor="rgba(79, 70, 229, 0.12)"
              style={[
                styles.tabButton,
                selected ? styles.tabActive : styles.tabInactive,
                !isLast && styles.tabDivider,
              ]}
              onPress={() => onSelectTab(tab.key)}>
              <View style={styles.tabContent}>
                <Text
                  variant="labelLarge"
                  style={[styles.tabText, selected && styles.tabTextSelected]}
                  numberOfLines={1}>
                  {tab.label}
                </Text>
                {selected && <View style={styles.activeIndicator} />}
              </View>
            </TouchableRipple>
          );
        })}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  innerRow: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabDivider: {
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.tabActiveBg,
  },
  tabInactive: {
    backgroundColor: theme.colors.tabInactiveBg,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  activeIndicator: {
    marginTop: 4,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});
