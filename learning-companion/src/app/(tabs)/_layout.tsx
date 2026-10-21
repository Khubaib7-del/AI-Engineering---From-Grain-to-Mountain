import { Tabs } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Txt, tabs, usePalette, useWide } from '../../components/ui';

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/**
 * Mobile: a solid docked bar that takes its own space, so it never covers content
 * (no blur — the Android-safe pattern). Desktop web: the TopNav inside each Screen.
 */
function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const wide = useWide();
  if (Platform.OS === 'web' && wide) return null;
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: c.surface,
        borderTopWidth: 1,
        borderColor: c.line,
        paddingBottom: Math.max(insets.bottom, 6),
        paddingTop: 6,
        paddingHorizontal: 8,
      }}
    >
      {state.routes.map((route, i) => {
        const selected = i === state.index;
        const options = descriptors[route.key].options;
        const meta = tabs.find(t => t.route === `/${route.name}`);
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={options.title ?? route.name}
            accessibilityState={{ selected }}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!selected && !event.defaultPrevented) navigation.navigate(route.name, route.params);
            }}
            style={{ flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: selected ? c.soft : 'transparent',
              }}
            >
              <Icon name={meta?.icon ?? 'ellipse-outline'} color={selected ? c.ink : c.faint} size={20} />
            </View>
            <Txt size={11} weight={selected ? '700' : '500'} color={selected ? c.ink : c.faint}>
              {options.title}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
    </Tabs>
  );
}
