import { Pressable, View, useColorScheme } from 'react-native';
import { PALETTES } from '../lib/palettes';
import {
  THEME_HINT,
  THEME_LABEL,
  THEME_MODES,
  normalizeTheme,
  resolveTheme,
  type ThemeMode,
} from '../lib/theme';
import { useLearning } from '../lib/store';
import { Icon, Txt, fontFor, usePalette } from './ui';

/** Appearance picker: one card per colour mode with a live swatch of that mode. */
export function ThemePicker() {
  const c = usePalette();
  const system = useColorScheme();
  const { state, update } = useLearning();
  const current = normalizeTheme(state.settings.theme);
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Colour mode"
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}
    >
      {THEME_MODES.map((mode: ThemeMode) => {
        const p = PALETTES[resolveTheme(mode, system === 'light' ? 'light' : 'dark')];
        const selected = current === mode;
        return (
          <Pressable
            key={mode}
            testID={`theme-${mode}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${THEME_LABEL[mode]}. ${THEME_HINT[mode]}`}
            onPress={() => void update(s => ({ ...s, settings: { ...s.settings, theme: mode } }))}
            style={({ pressed }) => ({
              width: 156,
              flexGrow: 1,
              borderRadius: 16,
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? c.accent : c.line,
              backgroundColor: c.surface,
              padding: selected ? 7 : 8,
              gap: 10,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View
              style={{
                height: 72,
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: p.gradient[0],
                borderWidth: 1,
                borderColor: p.line,
                padding: 10,
                justifyContent: 'space-between',
                ...({
                  backgroundImage: `linear-gradient(180deg, ${p.gradient[0]}, ${p.gradient[1]})`,
                } as object),
              }}
            >
              <Txt raw size={20} color={p.ink} style={fontFor('600', mode === 'terminal')}>
                Aa
              </Txt>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <View style={{ width: 34, height: 10, borderRadius: 5, backgroundColor: p.accent }} />
                <View style={{ width: 22, height: 10, borderRadius: 5, backgroundColor: p.muted }} />
                <View style={{ width: 14, height: 10, borderRadius: 5, backgroundColor: p.line }} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 }}>
              <Txt size={16} weight="600" style={{ flex: 1 }}>
                {THEME_LABEL[mode]}
              </Txt>
              {selected && <Icon name="checkmark-circle" size={18} color={c.accentText} />}
            </View>
            <Txt size={14} raw color={c.muted} style={{ paddingHorizontal: 4, paddingBottom: 4 }}>
              {THEME_HINT[mode]}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
