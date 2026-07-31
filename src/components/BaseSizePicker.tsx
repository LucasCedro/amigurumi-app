import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeContext';
import { font, radius, space, typeface } from '@/theme/tokens';

interface BaseSizePickerProps {
  sizesCm: number[];
  value: number;
  onChange: (sizeCm: number) => void;
  disabled?: boolean;
}

export function BaseSizePicker({ sizesCm, value, onChange, disabled }: BaseSizePickerProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.text }]}>{t('recipe.size')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
      >
        {sizesCm.map((size) => {
          const active = size === value;
          return (
            <Pressable
              key={size}
              disabled={disabled}
              onPress={() => onChange(size)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.primary : theme.surface,
                  borderColor: active ? theme.primary : theme.border,
                  opacity: disabled ? 0.55 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? theme.primaryText : theme.text },
                ]}
              >
                {size} cm
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {disabled && (
        <Text style={[styles.hint, { color: theme.textMuted }]}>{t('recipe.sizeLocked')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { fontSize: font.h2, fontFamily: typeface.displaySemi },
  scroll: { flexGrow: 0 },
  row: { gap: space.sm, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    minWidth: 72,
    alignItems: 'center',
  },
  chipText: { fontSize: font.body, fontFamily: typeface.bodyBold },
  hint: { fontSize: font.small, fontFamily: typeface.bodySemi },
});
