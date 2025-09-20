import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBackButton,
  onBack,
  rightSlot,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top + 12 },
        style,
      ]}
    >
      <View style={styles.row}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name='chevron.left' size={24} color={colors.text} />
          </TouchableOpacity>
        ) : <View style={styles.backPlaceholder} />}

        <View style={styles.titleWrapper}>
          <ThemedText type='title' style={styles.title}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>

        {rightSlot ? <View style={styles.right}>{rightSlot}</View> : <View style={styles.right} />}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -4,
  },
  backPlaceholder: {
    width: 32,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  right: {
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
