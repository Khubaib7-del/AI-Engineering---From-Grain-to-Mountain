import React, { useCallback, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
  type ColorValue,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router, useFocusEffect, usePathname } from 'expo-router';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Briefcase,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleDashed,
  ClipboardCheck,
  Clock,
  Cloud,
  CloudCheck,
  CloudOff,
  Code2,
  Compass,
  Bell,
  ExternalLink,
  FileText,
  Flag,
  Flame,
  FlaskConical,
  Footprints,
  GitBranch,
  GraduationCap,
  Hammer,
  Info,
  Layers,
  Lightbulb,
  Link,
  ListChecks,
  LockKeyhole,
  LogOut,
  Mail,
  Map,
  Maximize,
  MessageCircle,
  Minus,
  Mountain,
  PlayCircle,
  Plus,
  RefreshCw,
  Rocket,
  Route,
  Search,
  Server,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Square,
  SquareCheckBig,
  Sun,
  Target,
  Timer,
  TriangleAlert,
  Trophy,
  User,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import { BrandMark } from './brand';
import { MotionPress, MovingProgress } from './motion';
import { useLearning } from '../lib/store';
import { useAuth } from '../lib/auth';

export const APP_NAME = 'Grain to Mountain';

// ---------------------------------------------------------------------------
// Palette: true-black monochrome, charcoal surfaces, white/silver controls.
// `signal` is the one quiet tone for "current / next" (desaturated ice).
// ---------------------------------------------------------------------------
export const light = {
  bg: '#F3F3F3',
  surface: '#FFFFFF',
  raised: '#FAFAFA',
  ink: '#0E0E0E',
  muted: '#5E5E5E',
  faint: '#8A8A8A',
  line: '#DADADA',
  accent: '#111111',
  soft: '#EAEAEA',
  onAccent: '#FFFFFF',
  danger: '#B42335',
  signal: '#4F6478',
  glass: 'rgba(255,255,255,.86)',
  hero: '#ECECEC',
  heat: ['#E4E4E4', '#C2C2C2', '#8E8E8E', '#555555', '#111111'],
};
export const dark = {
  bg: '#000000',
  surface: '#0E0E0E',
  raised: '#151515',
  ink: '#F5F5F5',
  muted: '#A3A3A3',
  faint: '#6E6E6E',
  line: '#262626',
  accent: '#F2F2F2',
  soft: '#1B1B1B',
  onAccent: '#080808',
  danger: '#FF8D9C',
  signal: '#C9D6E3',
  glass: 'rgba(16,16,16,.88)',
  hero: '#121212',
  heat: ['#141414', '#2A2A2A', '#5A5A5A', '#9A9A9A', '#E6E6E6'],
};
export type Palette = typeof dark;

export function usePalette(): Palette {
  const { state } = useLearning();
  const system = useColorScheme();
  return (state.settings.theme === 'system' ? system : state.settings.theme) === 'light' ? light : dark;
}
export const useWide = () => useWindowDimensions().width >= 900;
export const isWeb = Platform.OS === 'web';
const webFont = isWeb
  ? { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", sans-serif' }
  : {};

/** Sets the browser tab title while a screen is focused (tabs stay mounted). */
export function usePageTitle(title?: string) {
  useFocusEffect(
    useCallback(() => {
      if (!isWeb || typeof document === 'undefined') return;
      document.title = title ? `${title} · ${APP_NAME}` : `${APP_NAME} — free path to AI engineering`;
    }, [title]),
  );
}

export function Txt({
  children,
  size = 16,
  weight = '400',
  color,
  style,
  ...rest
}: React.ComponentProps<typeof Text> & {
  size?: number;
  weight?: TextStyle['fontWeight'];
  color?: ColorValue;
}) {
  const c = usePalette();
  return (
    <Text
      {...rest}
      style={[
        {
          color: color ?? c.ink,
          fontSize: size,
          fontWeight: weight,
          lineHeight: Math.round(size * (size >= 32 ? 1.1 : size >= 20 ? 1.3 : 1.5)),
          letterSpacing: size >= 40 ? -1.6 : size >= 28 ? -0.9 : size >= 20 ? -0.4 : -0.1,
          fontVariant: ['tabular-nums'],
          ...webFont,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const iconMap: Record<string, typeof ArrowRight> = {
  'arrow-forward': ArrowRight,
  'arrow-up-outline': ArrowUpRight,
  'book-outline': BookOpen,
  book: BookOpen,
  brain: Brain,
  briefcase: Briefcase,
  calendar: CalendarDays,
  'layers-outline': Layers,
  'map-outline': Map,
  map: Map,
  'sunny-outline': Sun,
  'stats-chart-outline': ChartNoAxesColumnIncreasing,
  'options-outline': SlidersHorizontal,
  checkmark: Check,
  'checkmark-circle': CheckCircle2,
  'checkmark-circle-outline': CheckCircle2,
  'chevron-back': ChevronLeft,
  'chevron-forward': ChevronRight,
  'chevron-down': ChevronDown,
  'circle-dashed': CircleDashed,
  clipboard: ClipboardCheck,
  clock: Clock,
  cloud: Cloud,
  'cloud-check': CloudCheck,
  'cloud-off': CloudOff,
  'code-slash-outline': Code2,
  'compass-outline': Compass,
  'notifications-outline': Bell,
  'share-outline': Share2,
  'open-outline': ExternalLink,
  'search-outline': Search,
  'document-text-outline': FileText,
  flag: Flag,
  flame: Flame,
  footprints: Footprints,
  git: GitBranch,
  'school-outline': GraduationCap,
  hammer: Hammer,
  info: Info,
  'bulb-outline': Lightbulb,
  link: Link,
  list: ListChecks,
  'lock-closed-outline': LockKeyhole,
  logout: LogOut,
  mail: Mail,
  maximize: Maximize,
  'ellipse-outline': Circle,
  'chatbubble-outline': MessageCircle,
  mountain: Mountain,
  'play-circle-outline': PlayCircle,
  refresh: RefreshCw,
  rocket: Rocket,
  route: Route,
  server: Server,
  sparkles: Sparkles,
  square: Square,
  'square-check': SquareCheckBig,
  target: Target,
  plus: Plus,
  minus: Minus,
  timer: Timer,
  flask: FlaskConical,
  warning: TriangleAlert,
  trophy: Trophy,
  user: User,
  users: Users,
  close: X,
  'zoom-in': ZoomIn,
  'zoom-out': ZoomOut,
};
export function Icon({ name, color, size = 20 }: { name: string; color?: ColorValue; size?: number }) {
  const c = usePalette();
  const Glyph = iconMap[name] ?? Circle;
  return <Glyph size={size} color={typeof color === 'string' ? color : c.ink} strokeWidth={1.7} />;
}

export function Glass({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  const c = usePalette();
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void AccessibilityInfo.isReduceTransparencyEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduced);
    return () => sub.remove();
  }, []);
  const blur = !reduced && Platform.OS !== 'android';
  return (
    <View
      style={[
        {
          overflow: 'hidden',
          borderRadius: 20,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: blur ? c.glass : c.surface,
        },
        style,
      ]}
    >
      {blur && (
        <BlurView tint={c === dark ? 'dark' : 'light'} intensity={60} style={StyleSheet.absoluteFill} />
      )}
      {children}
    </View>
  );
}

/** The one card surface. Depth comes from a hairline highlight and a soft shadow. */
export function Panel({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}) {
  const c = usePalette();
  return (
    <View
      style={[
        {
          backgroundColor: c.surface,
          borderRadius: 20,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: c.line,
          padding: padded ? 22 : 0,
          gap: 14,
          boxShadow:
            c === dark
              ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 32px rgba(0,0,0,0.45)'
              : '0 1px 2px rgba(0,0,0,0.04), 0 10px 28px rgba(0,0,0,0.06)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Responsive columns that always fill the row exactly (no hard-coded percentages). */
export function Grid({
  children,
  min = 300,
  gap = 16,
}: {
  children: React.ReactNode;
  min?: number;
  gap?: number;
}) {
  const [width, setWidth] = useState(0);
  const items = React.Children.toArray(children);
  const cols = width ? Math.max(1, Math.min(items.length || 1, Math.floor((width + gap) / (min + gap)))) : 1;
  const itemWidth = width ? (width - gap * (cols - 1)) / cols : undefined;
  return (
    <View
      onLayout={e => setWidth(Math.floor(e.nativeEvent.layout.width))}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap, width: '100%' }}
    >
      {items.map((child, i) => (
        <View key={i} style={{ width: itemWidth ?? '100%', flexGrow: 0 }}>
          {child}
        </View>
      ))}
    </View>
  );
}

export function Split({ children, gap = 20 }: { children: React.ReactNode; gap?: number }) {
  const wide = useWide();
  return (
    <View style={{ flexDirection: wide ? 'row' : 'column', gap, alignItems: 'stretch' }}>
      {React.Children.map(children, child => {
        if (wide || !React.isValidElement(child)) return child;
        const element = child as React.ReactElement<{ style?: ViewStyle }>;
        return React.cloneElement(element, {
          style: { ...element.props.style, flex: undefined, flexBasis: 'auto', flexGrow: 0, flexShrink: 0 },
        });
      })}
    </View>
  );
}

export function Eyebrow({ children, color }: { children: React.ReactNode; color?: string }) {
  const c = usePalette();
  return (
    <Txt
      size={12}
      weight="600"
      color={color ?? c.muted}
      style={{ letterSpacing: 1.4, textTransform: 'uppercase' }}
    >
      {children}
    </Txt>
  );
}

export function Meter({ value, label }: { value: number; label: string }) {
  const c = usePalette();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
    >
      <MovingProgress value={value} color={c.accent} track={c.line} />
    </View>
  );
}

export function Button({
  title,
  onPress,
  secondary = false,
  ghost = false,
  disabled = false,
  busy = false,
  icon,
  testID,
  compact = false,
  full = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  ghost?: boolean;
  disabled?: boolean;
  busy?: boolean;
  icon?: string;
  testID?: string;
  compact?: boolean;
  full?: boolean;
}) {
  const c = usePalette();
  const fg = secondary || ghost ? c.ink : c.onAccent;
  return (
    <MotionPress
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy, busy }}
      testID={testID}
      disabled={disabled || busy}
      onPress={onPress}
      style={{
        minHeight: compact ? 40 : 48,
        backgroundColor: ghost ? 'transparent' : secondary ? c.soft : c.accent,
        borderRadius: compact ? 12 : 14,
        borderCurve: 'continuous',
        paddingVertical: compact ? 8 : 12,
        paddingHorizontal: compact ? 14 : 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        opacity: disabled ? 0.45 : 1,
        borderWidth: 1,
        borderColor: secondary || ghost ? c.line : 'transparent',
        alignSelf: full ? 'stretch' : 'flex-start',
        ...((isWeb ? { cursor: disabled ? 'not-allowed' : 'pointer' } : {}) as ViewStyle),
      }}
    >
      {busy && <ActivityIndicator size="small" color={fg} />}
      <Txt size={compact ? 14 : 15} weight="600" color={fg} style={{ flexShrink: 1, textAlign: 'center' }}>
        {title}
      </Txt>
      {icon && !busy && <Icon name={icon} size={18} color={fg} />}
    </MotionPress>
  );
}

/** Square checkbox (not a radio-looking circle). */
export function Checkbox({
  checked,
  label,
  onPress,
  disabled,
}: {
  checked: boolean;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        minHeight: 44,
        paddingVertical: 8,
        opacity: pressed ? 0.6 : disabled ? 0.5 : 1,
      })}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: checked ? c.accent : c.faint,
          backgroundColor: checked ? c.accent : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && <Icon name="checkmark" size={15} color={c.onAccent} />}
      </View>
      <Txt size={15} style={{ flex: 1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function Chip({
  text,
  icon,
  tone = 'default',
}: {
  text: string;
  icon?: string;
  tone?: 'default' | 'strong' | 'signal';
}) {
  const c = usePalette();
  const fg = tone === 'strong' ? c.onAccent : tone === 'signal' ? c.signal : c.muted;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: tone === 'strong' ? c.accent : tone === 'signal' ? c.signal : c.line,
        backgroundColor: tone === 'strong' ? c.accent : 'transparent',
        alignSelf: 'flex-start',
      }}
    >
      {icon && <Icon name={icon} size={13} color={fg} />}
      <Txt size={12} weight="600" color={fg}>
        {text}
      </Txt>
    </View>
  );
}

const ago = (iso?: string) => {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)}m ago` : `${Math.floor(s / 3600)}h ago`;
};

/** Cloud status: Synced · 2m / Syncing… / Saved locally / Needs attention / Guest. */
export function SyncChip() {
  const c = usePalette();
  const { syncStatus, lastSyncedAt, scope, syncNow } = useLearning();
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  const guest = scope === 'guest';
  const [label, icon] = guest
    ? ['Guest · this device', 'cloud-off']
    : syncStatus === 'syncing'
      ? ['Syncing…', 'refresh']
      : syncStatus === 'synced'
        ? [`Synced · ${ago(lastSyncedAt)}`, 'cloud-check']
        : syncStatus === 'conflict'
          ? ['Choose a version', 'warning']
          : syncStatus === 'pending'
            ? ['Offline · saved locally', 'cloud-off']
            : ['Connecting…', 'cloud'];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${guest ? 'Open account' : 'Sync now'}`}
      onPress={() =>
        guest || syncStatus === 'conflict' ? router.push('/account') : void syncNow({ announce: true })
      }
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 36,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: c.line,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Icon name={icon} size={15} color={syncStatus === 'conflict' ? c.danger : c.muted} />
      <Txt size={12} weight="500" color={c.muted}>
        {label}
      </Txt>
    </Pressable>
  );
}

const TABS = [
  { title: 'Today', route: '/today', icon: 'sunny-outline' },
  { title: 'Map', route: '/map', icon: 'map-outline' },
  { title: 'Progress', route: '/progress', icon: 'stats-chart-outline' },
  { title: 'Library', route: '/library', icon: 'book-outline' },
] as const;
export const tabs = TABS;

export function BrandLink({ size = 15, href = '/today' }: { size?: number; href?: string }) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${APP_NAME} home`}
      onPress={() => router.push(href as never)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          backgroundColor: c.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BrandMark size={20} color={c.onAccent} />
      </View>
      <Txt size={size} weight="700" style={{ letterSpacing: -0.3 }}>
        {APP_NAME}
      </Txt>
    </Pressable>
  );
}

/** Desktop web navigation, shown on every in-app route (tabs and sub-pages). */
export function TopNav() {
  const c = usePalette();
  const pathname = usePathname();
  const { session } = useAuth();
  const active =
    TABS.find(t => pathname === t.route || pathname.startsWith(`${t.route}/`)) ??
    (pathname.startsWith('/unit') || pathname.startsWith('/module') ? TABS[1] : undefined);
  return (
    <View
      accessibilityRole="header"
      style={{ borderBottomWidth: 1, borderColor: c.line, backgroundColor: c.bg }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 1280,
          alignSelf: 'center',
          paddingHorizontal: 40,
          minHeight: 68,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <BrandLink />
        <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4 }}>
          {TABS.map(t => {
            const selected = active?.route === t.route;
            return (
              <Pressable
                key={t.route}
                accessibilityRole="tab"
                accessibilityLabel={t.title}
                accessibilityState={{ selected }}
                onPress={() => router.navigate(t.route)}
                style={state => ({
                  minHeight: 40,
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                  borderRadius: 10,
                  backgroundColor: selected
                    ? c.soft
                    : (state as { hovered?: boolean }).hovered
                      ? c.raised
                      : 'transparent',
                })}
              >
                <Txt size={14} weight={selected ? '600' : '500'} color={selected ? c.ink : c.muted}>
                  {t.title}
                </Txt>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <SyncChip />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
            style={styles.iconButton}
          >
            <Icon name="options-outline" size={19} color={c.muted} />
          </Pressable>
          {session ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Account"
              onPress={() => router.push('/account')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: c.soft,
                borderWidth: 1,
                borderColor: c.line,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Txt size={14} weight="700">
                {(session.user.email ?? '?')[0].toUpperCase()}
              </Txt>
            </Pressable>
          ) : (
            <Button title="Sign in" compact secondary onPress={() => router.push('/signin')} />
          )}
        </View>
      </View>
    </View>
  );
}

/** Clear, non-destructive prompt shown after signing in when guest progress exists. */
export function GuestMergeBanner() {
  const c = usePalette();
  const { guestOffer, mergeGuest, dismissGuest } = useLearning();
  const [busy, setBusy] = useState(false);
  if (!guestOffer) return null;
  return (
    <Panel style={{ borderColor: c.signal, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Icon name="cloud" color={c.signal} />
        <Txt size={17} weight="600" style={{ flex: 1 }}>
          Bring your guest progress into this account?
        </Txt>
      </View>
      <Txt size={14} color={c.muted}>
        This device has guest progress ({guestOffer.summary}). Merging keeps everything from both notebooks —
        nothing in your account is replaced. You can undo right after.
      </Txt>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Button
          title="Merge into my account"
          busy={busy}
          onPress={() => {
            setBusy(true);
            void mergeGuest().finally(() => setBusy(false));
          }}
        />
        <Button title="Keep separate" secondary disabled={busy} onPress={() => void dismissGuest()} />
      </View>
    </Panel>
  );
}

/** Global toast / snackbar for every state change (saved, synced, signed out…). */
export function ToastHost() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const wide = useWide();
  const { toast, hideToast } = useLearning();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, toast.action ? 8000 : 4500);
    return () => clearTimeout(t);
  }, [toast, hideToast]);
  if (!toast) return null;
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: insets.bottom + (wide ? 28 : 84),
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      <View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={{
          maxWidth: 560,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingLeft: 18,
          paddingRight: 8,
          borderRadius: 16,
          backgroundColor: c.accent,
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        }}
      >
        <Txt size={14} weight="500" color={c.onAccent} style={{ flex: 1 }}>
          {toast.message}
        </Txt>
        {toast.action && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              toast.action!.run();
              hideToast();
            }}
            style={{ minHeight: 36, paddingHorizontal: 12, justifyContent: 'center' }}
          >
            <Txt size={14} weight="700" color={c.onAccent} style={{ textDecorationLine: 'underline' }}>
              {toast.action.label}
            </Txt>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={hideToast}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="close" size={16} color={c.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

function Skeleton() {
  const c = usePalette();
  return (
    <View accessibilityLabel="Loading your notebook" style={{ gap: 16 }}>
      {[120, 220, 160].map((h, i) => (
        <View
          key={i}
          style={{
            height: h,
            borderRadius: 20,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
            opacity: 0.7,
          }}
        />
      ))}
    </View>
  );
}

/**
 * Page shell. On desktop web the TopNav is the only header (no duplicate
 * brand row). On mobile a compact header shows the brand (tabs) or Back.
 */
export function Screen({
  children,
  title,
  subtitle,
  back = false,
  docTitle,
  width = 1200,
  eyebrow,
  scroll = true,
  showNav = true,
}: {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  docTitle?: string;
  width?: number;
  eyebrow?: string;
  scroll?: boolean;
  showNav?: boolean;
}) {
  const c = usePalette();
  const wide = useWide();
  const insets = useSafeAreaInsets();
  const { loaded, error, notice, dismiss } = useLearning();
  usePageTitle(docTitle ?? title);
  const desktopNav = isWeb && wide && showNav;
  const header = (
    <>
      {!desktopNav && (
        <View style={styles.row}>
          {back ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/today'))}
              style={[styles.iconButton, { flexDirection: 'row', paddingRight: 12, gap: 4, marginLeft: -6 }]}
            >
              <Icon name="chevron-back" size={20} />
              <Txt size={15} weight="500">
                Back
              </Txt>
            </Pressable>
          ) : (
            <BrandLink size={16} />
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {!back && <SyncChip />}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => router.push('/settings')}
              style={styles.iconButton}
            >
              <Icon name="options-outline" size={20} color={c.muted} />
            </Pressable>
          </View>
        </View>
      )}
      {desktopNav && back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/map'))}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            minHeight: 36,
            alignSelf: 'flex-start',
            marginLeft: -6,
          }}
        >
          <Icon name="chevron-back" size={18} color={c.muted} />
          <Txt size={14} color={c.muted}>
            Back
          </Txt>
        </Pressable>
      )}
      {!!title && (
        <View style={{ gap: 8, maxWidth: 820 }}>
          {!!eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Txt size={wide ? 40 : 28} weight="700" accessibilityRole="header">
            {title}
          </Txt>
          {!!subtitle && (
            <Txt color={c.muted} size={wide ? 17 : 15}>
              {subtitle}
            </Txt>
          )}
        </View>
      )}
      {!!error && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss error"
          onPress={dismiss}
          style={{ padding: 16, borderWidth: 1, borderColor: c.danger, borderRadius: 14 }}
        >
          <Txt color={c.danger}>{error}</Txt>
        </Pressable>
      )}
      {!!notice && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss notice"
          onPress={dismiss}
          style={{ padding: 16, backgroundColor: c.soft, borderRadius: 14 }}
        >
          <Txt size={14}>{notice}</Txt>
        </Pressable>
      )}
      <GuestMergeBanner />
    </>
  );
  const pad = {
    paddingHorizontal: wide ? 40 : 18,
    width: '100%' as const,
    maxWidth: width + (wide ? 80 : 36),
    alignSelf: 'center' as const,
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {desktopNav && (
        <View style={{ paddingTop: insets.top }}>
          <TopNav />
        </View>
      )}
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            ...pad,
            paddingTop: desktopNav ? 32 : insets.top + 8,
            paddingBottom: 96,
            gap: wide ? 28 : 20,
          }}
        >
          {header}
          {loaded ? children : <Skeleton />}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ ...pad, paddingTop: desktopNav ? 24 : insets.top + 8, gap: 16 }}>{header}</View>
          {loaded ? (
            children
          ) : (
            <View style={pad}>
              <Skeleton />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function Section({
  title,
  aside,
  action,
}: {
  title: string;
  aside?: string;
  action?: React.ReactNode;
}) {
  const c = usePalette();
  return (
    <View style={styles.row}>
      <Txt style={{ flexShrink: 1 }} size={20} weight="600" accessibilityRole="header">
        {title}
      </Txt>
      {action ??
        (aside ? (
          <Txt size={13} color={c.muted}>
            {aside}
          </Txt>
        ) : null)}
    </View>
  );
}

export function Row({
  title,
  subtitle,
  leading,
  onPress,
  trailing,
  testID,
  last = false,
}: {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  onPress: () => void;
  trailing?: React.ReactNode;
  testID?: string;
  last?: boolean;
}) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderColor: c.line,
        minHeight: 64,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {typeof leading === 'string' ? (
        <View
          style={{
            minWidth: 40,
            height: 40,
            paddingHorizontal: 6,
            borderRadius: 12,
            backgroundColor: c.soft,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Txt size={12} weight="700">
            {leading}
          </Txt>
        </View>
      ) : (
        leading
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt size={15} weight="600">
          {title}
        </Txt>
        {subtitle && (
          <Txt size={13} color={c.muted}>
            {subtitle}
          </Txt>
        )}
      </View>
      {trailing ?? <Icon name="chevron-forward" size={17} color={c.faint} />}
    </Pressable>
  );
}

export function Pieces({ tasks }: { tasks: boolean[] }) {
  const c = usePalette();
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {(['Watch', 'Build', 'Recall'] as const).map((label, i) => (
        <View
          key={label}
          accessible
          accessibilityLabel={`${label} ${tasks[i] ? 'done' : 'pending'}`}
          style={{
            flex: 1,
            gap: 8,
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: tasks[i] ? c.accent : c.line,
            backgroundColor: tasks[i] ? c.soft : c.surface,
          }}
        >
          <Icon
            name={
              tasks[i]
                ? 'checkmark-circle'
                : (['play-circle-outline', 'code-slash-outline', 'chatbubble-outline'] as const)[i]
            }
            size={20}
          />
          <Txt size={13} weight="600">
            {label}
          </Txt>
        </View>
      ))}
    </View>
  );
}

export function Tag({
  text,
  active = false,
  onPress,
}: {
  text: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const c = usePalette();
  return (
    <MotionPress
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        minHeight: 40,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? c.accent : c.line,
        backgroundColor: active ? c.accent : 'transparent',
        justifyContent: 'center',
      }}
    >
      <Txt size={14} weight="600" color={active ? c.onAccent : c.muted}>
        {text}
      </Txt>
    </MotionPress>
  );
}

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
export const inputStyle = (c: Palette): ViewStyle & TextStyle => ({
  backgroundColor: c.surface,
  color: c.ink,
  borderWidth: 1,
  borderColor: c.line,
  borderRadius: 14,
  padding: 14,
  fontSize: 16,
  minHeight: 50,
});
