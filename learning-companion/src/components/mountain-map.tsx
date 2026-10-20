import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  Pressable,
  View,
  type GestureResponderEvent,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useReduced } from './motion';
import { Icon, Txt, usePalette, type Palette } from './ui';

export type MapNodeStatus = 'locked' | 'available' | 'in-progress' | 'passed';
export type MapNode = {
  id: string;
  kind: 'unit' | 'capstone' | 'module';
  title: string;
  moduleId: string;
  moduleTitle: string;
  phase?: string;
  status: MapNodeStatus;
  /** 0–1, drawn as a segmented ring for in-progress units. */
  progress: number;
  hours?: number;
  /** Units inside a collapsed module node. */
  count?: number;
};

const VW = 1000;
const FONT = Platform.OS === 'web' ? 'Helvetica Neue, Helvetica, Arial, sans-serif' : undefined;
const STEP = 118;
const TOP = 150;
const BOTTOM = 120;
const R = 22;

export type Point = { x: number; y: number };

/** Layout: a switchback trail climbing from the bottom (first unit) to the summit. */
export function layoutTrail(count: number, vw = VW) {
  const height = TOP + BOTTOM + Math.max(0, count - 1) * STEP;
  const points: Point[] = Array.from({ length: count }, (_, i) => ({
    x: vw / 2 + Math.sin(i * 0.9 + 0.4) * vw * 0.23 + Math.sin(i * 0.37) * vw * 0.04,
    y: height - BOTTOM - i * STEP,
  }));
  return { height, points };
}

/** Smooth path through points (Catmull-Rom → cubic Bézier). */
export function smoothPath(points: Point[]) {
  if (!points.length) return '';
  if (points.length === 1) return `M${points[0].x} ${points[0].y}`;
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
  const a = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const sx = cx + r * Math.cos(a(from));
  const sy = cy + r * Math.sin(a(from));
  const ex = cx + r * Math.cos(a(to));
  const ey = cy + r * Math.sin(a(to));
  return `M${sx.toFixed(2)} ${sy.toFixed(2)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Pulse({ x, y, color }: { x: number; y: number; color: string }) {
  const reduced = useReduced();
  const o = useSharedValue(0.55);
  useEffect(() => {
    if (reduced) {
      o.value = 0.45;
      return;
    }
    o.value = withRepeat(withTiming(0.08, { duration: 1100 }), -1, true);
    return () => cancelAnimation(o);
  }, [reduced, o]);
  const props = useAnimatedProps(() => ({ opacity: o.value }));
  return (
    <AnimatedCircle
      cx={x}
      cy={y}
      r={R + 12}
      fill="none"
      stroke={color}
      strokeWidth={6}
      animatedProps={props}
    />
  );
}

/** Node glyph: state is carried by SHAPE (filled / segmented ring / outline / dashed), not colour. */
function NodeShape({
  node,
  p,
  c,
  current,
  selected,
}: {
  node: MapNode;
  p: Point;
  c: Palette;
  current: boolean;
  selected: boolean;
}) {
  const { x, y } = p;
  if (node.kind === 'capstone') {
    const s = R + 2;
    const d = `M${x} ${y - s} L${x + s} ${y} L${x} ${y + s} L${x - s} ${y} Z`;
    return (
      <G>
        <Path
          d={d}
          fill={node.status === 'passed' ? c.accent : c.bg}
          stroke={node.status === 'locked' ? c.faint : c.ink}
          strokeWidth={2}
          strokeDasharray={node.status === 'locked' ? '4 4' : undefined}
        />
        <Path
          d={`M${x - 5} ${y + 8} L${x - 5} ${y - 9} L${x + 7} ${y - 5} L${x - 5} ${y - 1}`}
          fill="none"
          stroke={node.status === 'passed' ? c.onAccent : c.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        {selected && <Circle cx={x} cy={y} r={R + 9} fill="none" stroke={c.signal} strokeWidth={1.5} />}
      </G>
    );
  }
  if (node.kind === 'module') {
    const s = R + 2;
    const locked = node.status === 'locked';
    return (
      <G>
        <Rect
          x={x - s}
          y={y - s}
          width={s * 2}
          height={s * 2}
          rx={10}
          fill={node.status === 'passed' ? c.accent : c.bg}
          stroke={locked ? c.faint : c.ink}
          strokeWidth={node.status === 'available' ? 2.2 : 1.8}
          strokeDasharray={locked ? '4 5' : undefined}
        />
        <Path
          d={`M${x - 11} ${y + 8} L${x - 3} ${y - 6} L${x + 2} ${y + 2} L${x + 5} ${y - 2} L${x + 12} ${y + 8} Z`}
          fill={node.status === 'passed' ? c.onAccent : locked ? c.faint : c.ink}
        />
        {node.status === 'in-progress' && (
          <>
            <Line x1={x - s + 6} y1={y + s - 6} x2={x + s - 6} y2={y + s - 6} stroke={c.line} strokeWidth={3} />
            <Line
              x1={x - s + 6}
              y1={y + s - 6}
              x2={x - s + 6 + Math.max(2, (s * 2 - 12) * node.progress)}
              y2={y + s - 6}
              stroke={c.ink}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </>
        )}
        {(current || selected) && (
          <Rect
            x={x - s - 8}
            y={y - s - 8}
            width={s * 2 + 16}
            height={s * 2 + 16}
            rx={16}
            fill="none"
            stroke={c.signal}
            strokeWidth={selected ? 1.5 : 2}
          />
        )}
      </G>
    );
  }
  return (
    <G>
      {node.status === 'passed' && (
        <>
          <Circle cx={x} cy={y} r={R} fill={c.accent} />
          <Path
            d={`M${x - 8} ${y} L${x - 2} ${y + 6} L${x + 9} ${y - 6}`}
            fill="none"
            stroke={c.onAccent}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {node.status === 'in-progress' && (
        <>
          <Circle cx={x} cy={y} r={R} fill={c.bg} stroke={c.line} strokeWidth={4} />
          {[0, 1, 2, 3].map(i => (
            <Path
              key={i}
              d={arc(x, y, R, i * 90 + 6, i * 90 + 84)}
              fill="none"
              stroke={i < Math.round(node.progress * 4) ? c.ink : c.line}
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}
          <Circle cx={x} cy={y} r={4} fill={c.ink} />
        </>
      )}
      {node.status === 'available' && (
        <Circle cx={x} cy={y} r={R} fill={c.bg} stroke={c.ink} strokeWidth={2.2} />
      )}
      {node.status === 'locked' && (
        <Circle cx={x} cy={y} r={R} fill={c.bg} stroke={c.faint} strokeWidth={1.6} strokeDasharray="4 5" />
      )}
      {(current || selected) && (
        <Circle cx={x} cy={y} r={R + 8} fill="none" stroke={c.signal} strokeWidth={selected ? 1.5 : 2} />
      )}
    </G>
  );
}

/** The climber: a small silver flag on a pole planted beside the current node. */
function Climber({ p, c }: { p: Point; c: Palette }) {
  const x = p.x + R + 6;
  const y = p.y - R - 4;
  return (
    <G accessibilityLabel="You are here">
      <Line x1={x} y1={y + 26} x2={x} y2={y - 22} stroke={c.ink} strokeWidth={2} strokeLinecap="round" />
      <Path d={`M${x} ${y - 22} L${x + 22} ${y - 15} L${x} ${y - 8} Z`} fill={c.signal} />
      <Rect x={x + 8} y={y + 2} width={38} height={20} rx={10} fill={c.accent} />
      <SvgText
        fontFamily={FONT}
        x={x + 27}
        y={y + 16}
        fontSize={11}
        fontWeight="700"
        fill={c.onAccent}
        textAnchor="middle"
      >
        You
      </SvgText>
    </G>
  );
}

type View2 = { s: number; tx: number; ty: number };
type Geom = { w: number; h: number; fit: number; H: number; vw: number };
const touchDistance = (e: GestureResponderEvent) => {
  const t = e.nativeEvent.touches;
  return t && t.length >= 2 ? Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY) : 0;
};
/** Keep the map within reach: zoom 0.45-3x, and never pan it fully off-screen. */
export function clampView(v: View2, g: Geom): View2 {
  const s = Math.min(3, Math.max(0.45, v.s));
  const scale = g.fit * s;
  const cw = g.vw * scale;
  const ch = g.H * scale;
  const minTx = Math.min(0, g.w - cw) - 80;
  const maxTx = Math.max(0, g.w - cw) + 80;
  const minTy = Math.min(0, g.h - ch) - 80;
  const maxTy = Math.max(0, g.h - ch) + 80;
  return { s, tx: Math.min(maxTx, Math.max(minTx, v.tx)), ty: Math.min(maxTy, Math.max(minTy, v.ty)) };
}
const zoomView = (v: View2, factor: number, fx: number, fy: number, g: Geom) => {
  const s = Math.min(3, Math.max(0.45, v.s * factor));
  const k = s / v.s;
  return clampView({ s, tx: fx - (fx - v.tx) * k, ty: fy - (fy - v.ty) * k }, g);
};

function ZoomButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.line,
      }}
    >
      <Icon name={icon} size={18} />
    </Pressable>
  );
}

export function MountainMap({
  nodes,
  currentId,
  onOpen,
  interactive = true,
  height = 640,
  selectedId,
  onSelect,
  focusId,
  onExpand,
}: {
  nodes: MapNode[];
  /** Open a collapsed module node into its units on the map. */
  onExpand?: (node: MapNode) => void;
  currentId?: string;
  /** Node to centre on when it changes (e.g. a module that was just opened); defaults to "you". */
  focusId?: string;
  onOpen?: (node: MapNode) => void;
  interactive?: boolean;
  height?: number;
  selectedId?: string;
  onSelect?: (node: MapNode | undefined) => void;
}) {
  const c = usePalette();
  const [size, setSize] = useState({ w: 0, h: height });
  // Narrow screens get a narrower virtual canvas so labels stay readable (no tiny text on phones).
  const vw = size.w ? Math.round(Math.min(VW, Math.max(460, size.w / 0.8))) : VW;
  const { height: H, points } = useMemo(() => layoutTrail(nodes.length, vw), [nodes.length, vw]);
  const fit = size.w ? Math.min(size.w / vw, 1.15) : 1;
  const maxChars = Math.max(14, Math.floor((vw / 2 - 80) / 8.8));
  const [view, setView] = useState<View2>({ s: 1, tx: 0, ty: 0 });
  const currentIndex = Math.max(
    0,
    nodes.findIndex(n => n.id === currentId),
  );
  const container = useRef<View>(null);
  // Geometry and the latest view, mirrored into refs for gesture callbacks.
  const geom = useRef<Geom>({ w: 0, h: height, fit: 1, H, vw });
  const viewRef = useRef(view);
  useEffect(() => {
    geom.current = { w: size.w, h: size.h, fit, H, vw };
    viewRef.current = view;
  });

  const centerOn = (index: number, s?: number) => {
    const p = points[index];
    if (!p || !size.w) return;
    setView(v => {
      const zoom = s ?? v.s;
      const scale = fit * zoom;
      // When the trail fits the width, keep it centred horizontally; otherwise follow the node.
      const tx = vw * scale <= size.w ? (size.w - vw * scale) / 2 : size.w / 2 - p.x * scale;
      return clampView({ s: zoom, tx, ty: size.h / 2 - p.y * scale }, { w: size.w, h: size.h, fit, H, vw });
    });
  };

  const focusIndex = focusId ? nodes.findIndex(n => n.id === focusId) : -1;
  // Start centred on "you" (or on the node just focused).
  useEffect(() => {
    // Re-centre when the viewport or your position changes (a layout sync, not derived state).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (size.w) centerOn(focusIndex >= 0 ? focusIndex : currentIndex, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, currentIndex, focusIndex, nodes.length]);

  const zoomAt = (factor: number) =>
    setView(v => zoomView(v, factor, size.w / 2, size.h / 2, { w: size.w, h: size.h, fit, H, vw }));

  // Mouse wheel / trackpad: scroll pans, Cmd/Ctrl-scroll or pinch zooms (web).
  useEffect(() => {
    if (Platform.OS !== 'web' || !interactive) return;
    const el = container.current as unknown as HTMLElement | null;
    if (!el?.addEventListener) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const g = geom.current;
      if (!e.ctrlKey && !e.metaKey) {
        setView(v => clampView({ ...v, tx: v.tx - e.deltaX, ty: v.ty - e.deltaY }, g));
        return;
      }
      const rect = el.getBoundingClientRect();
      setView(v =>
        zoomView(v, e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - rect.left, e.clientY - rect.top, g),
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [interactive]);

  const gesture = useRef({ dist: 0, start: { s: 1, tx: 0, ty: 0 } as View2 });
  // The responder is created once; its callbacks read refs only when a gesture runs, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (e, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6 || touchDistance(e) > 0,
      onPanResponderGrant: e => {
        gesture.current = { dist: touchDistance(e), start: viewRef.current };
      },
      onPanResponderMove: (e, g) => {
        const d = touchDistance(e);
        const { start } = gesture.current;
        const gm = geom.current;
        if (d && gesture.current.dist) {
          const k = Math.min(3, Math.max(0.45, start.s * (d / gesture.current.dist))) / start.s;
          const fx = gm.w / 2;
          const fy = gm.h / 2;
          setView(
            clampView(
              { s: start.s * k, tx: fx - (fx - start.tx) * k + g.dx, ty: fy - (fy - start.ty) * k + g.dy },
              gm,
            ),
          );
        } else {
          if (d && !gesture.current.dist) gesture.current.dist = d;
          setView(clampView({ s: start.s, tx: start.tx + g.dx, ty: start.ty + g.dy }, gm));
        }
      },
    }),
  );

  const scale = fit * view.s;
  const firstOfModule = nodes.map((n, i) => i === 0 || nodes[i - 1].moduleId !== n.moduleId);
  // Everything inside the pan/zoom transform depends only on content, layout and selection,
  // so it is built once per change; dragging re-renders just the transform attribute.
  const scene = useMemo(() => {
    const trail = smoothPath(points);
    const done = smoothPath(points.slice(0, currentIndex + 1));
    const summit = { x: vw / 2, y: 54 };
    return (
      <>
        {/* Mountain body and contour lines */}
        <Path
          d={`M${-200} ${H + 600} L${vw / 2 - 60} ${summit.y + 30} L${vw / 2} ${summit.y} L${vw / 2 + 80} ${summit.y + 46} L${vw + 200} ${H + 600} Z`}
          fill={c.surface}
        />
        {Array.from({ length: Math.max(4, Math.ceil(H / 160)) }, (_, i) => {
          const yy = summit.y + 90 + i * 160;
          const spread = 120 + (yy - summit.y) * 0.62;
          return (
            <Path
              key={i}
              d={`M${vw / 2 - spread} ${yy + 30} Q${vw / 2 - spread / 3} ${yy - 24} ${vw / 2} ${yy} T${vw / 2 + spread} ${yy + 22}`}
              stroke={c.line}
              strokeWidth={1}
              fill="none"
              opacity={0.7}
            />
          );
        })}
        {/* Summit flag */}
        <Line
          x1={summit.x}
          y1={summit.y}
          x2={summit.x}
          y2={summit.y - 40}
          stroke={c.ink}
          strokeWidth={2}
        />
        <Path
          d={`M${summit.x} ${summit.y - 40} L${summit.x + 26} ${summit.y - 32} L${summit.x} ${summit.y - 24} Z`}
          fill={c.ink}
        />
        <SvgText
          x={summit.x}
          y={summit.y + 26}
          fontSize={13}
          fontWeight="700"
          fill={c.muted}
          textAnchor="middle"
          letterSpacing={2}
        >
          JOB-READY
        </SvgText>
        {/* Trail: full route dashed, travelled route solid */}
        <Path
          d={trail}
          stroke={c.faint}
          strokeWidth={2}
          strokeDasharray="2 8"
          strokeLinecap="round"
          fill="none"
        />
        <Path d={done} stroke={c.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
        {/* Module labels */}
        {nodes.map((n, i) =>
          firstOfModule[i] && n.kind !== 'module' ? (
            <G key={`label-${n.moduleId}`}>
              <Line
                x1={40}
                y1={points[i].y + 50}
                x2={vw - 40}
                y2={points[i].y + 50}
                stroke={c.line}
                strokeWidth={1}
                strokeDasharray="1 6"
              />
              <SvgText
                x={40}
                y={points[i].y + 42}
                fontSize={12}
                fontWeight="700"
                fill={c.faint}
                letterSpacing={1.5}
              >
                {`${n.moduleId} · ${n.moduleTitle}`.toUpperCase().slice(0, Math.floor(vw / 9))}
              </SvgText>
            </G>
          ) : null,
        )}
        {/* Nodes */}
        {nodes.map((n, i) => {
          const p = points[i];
          const right = p.x < vw / 2;
          const current = i === currentIndex && n.status !== 'passed';
          return (
            <G
              key={n.id}
              onPress={interactive ? () => onSelect?.(selectedId === n.id ? undefined : n) : undefined}
              accessibilityLabel={`${n.title}, ${n.status.replace('-', ' ')}`}
            >
              <Circle cx={p.x} cy={p.y} r={R + 16} fill="transparent" />
              {current && <Pulse x={p.x} y={p.y} color={c.signal} />}
              <NodeShape node={n} p={p} c={c} current={current} selected={selectedId === n.id} />
              <SvgText
                x={right ? p.x + R + 16 : p.x - R - 16}
                y={p.y + (current && right ? 24 : 0) - 2}
                fontSize={15}
                fontWeight="600"
                fill={n.status === 'locked' ? c.faint : c.ink}
                textAnchor={right ? 'start' : 'end'}
              >
                {n.title.length > maxChars ? `${n.title.slice(0, maxChars - 1)}…` : n.title}
              </SvgText>
              <SvgText
                x={right ? p.x + R + 16 : p.x - R - 16}
                y={p.y + (current && right ? 24 : 0) + 16}
                fontSize={12}
                fill={c.muted}
                textAnchor={right ? 'start' : 'end'}
              >
                {n.kind === 'module' && n.count
                  ? `${n.id} · ${n.count} units${n.hours ? ` · ${n.hours} h` : ''}`
                  : `${n.kind === 'capstone' ? 'Capstone' : n.id}${n.hours ? ` · ${n.hours} h` : ''}`}
              </SvgText>
            </G>
          );
        })}
        {nodes[currentIndex] && nodes[currentIndex].status !== 'passed' && (
          <Climber p={points[currentIndex]} c={c} />
        )}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, points, currentIndex, selectedId, vw, H, c, maxChars, interactive]);

  return (
    <View
      ref={container}
      onLayout={e => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={[
        {
          height,
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: c.bg,
          borderWidth: 1,
          borderColor: c.line,
        },
        (Platform.OS === 'web' && interactive ? { cursor: 'grab', touchAction: 'none' } : {}) as ViewStyle,
      ]}
      {...(interactive ? responder.panHandlers : {})}
      accessibilityLabel={`Mountain map with ${nodes.length} steps`}
    >
      {size.w > 0 && (
        <Svg width={size.w} height={size.h}>
          <G transform={`translate(${view.tx.toFixed(1)} ${view.ty.toFixed(1)}) scale(${scale.toFixed(4)})`}>
            {scene}
          </G>
        </Svg>
      )}
      {interactive && (
        <View style={{ position: 'absolute', right: 12, top: 12, gap: 8 }}>
          <ZoomButton icon="zoom-in" label="Zoom in" onPress={() => zoomAt(1.25)} />
          <ZoomButton icon="zoom-out" label="Zoom out" onPress={() => zoomAt(1 / 1.25)} />
          <ZoomButton icon="target" label="Center on you" onPress={() => centerOn(currentIndex, 1)} />
        </View>
      )}
      {interactive &&
        selectedId &&
        onOpen &&
        (() => {
          const n = nodes.find(x => x.id === selectedId);
          return n ? (
            <NodeSheet
              node={n}
              onOpen={() => onOpen(n)}
              onExpand={onExpand && n.kind === 'module' ? () => onExpand(n) : undefined}
              onClose={() => onSelect?.(undefined)}
              wide={size.w >= 760}
            />
          ) : null;
        })()}
    </View>
  );
}

const STATUS_TEXT: Record<MapNodeStatus, string> = {
  locked: 'Locked — finish the earlier step first',
  available: 'Ready to start',
  'in-progress': 'In progress',
  passed: 'Passed',
};

function NodeSheet({
  node,
  onOpen,
  onExpand,
  onClose,
  wide,
}: {
  node: MapNode;
  onOpen: () => void;
  onExpand?: () => void;
  onClose: () => void;
  wide: boolean;
}) {
  const c = usePalette();
  return (
    <View
      style={{
        position: 'absolute',
        ...(wide ? { right: 64, top: 12, width: 340 } : { left: 10, right: 10, bottom: 10 }),
        padding: 18,
        gap: 10,
        borderRadius: 18,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.line,
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={12} weight="600" color={c.muted}>
            {node.moduleId} · {node.moduleTitle}
          </Txt>
          <Txt size={18} weight="700">
            {node.title}
          </Txt>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="close" size={16} />
        </Pressable>
      </View>
      <Txt size={13} color={c.muted}>
        {node.kind === 'capstone'
          ? 'Module capstone project'
          : node.kind === 'module' && node.count
            ? `${node.count} units · ${Math.round(node.progress * 100)}% passed`
            : STATUS_TEXT[node.status]}
        {node.hours ? ` · about ${node.hours} h` : ''}
        {node.status === 'in-progress' && node.kind !== 'module'
          ? ` · ${Math.round(node.progress * 100)}% of steps`
          : ''}
      </Txt>
      <Pressable
        accessibilityRole="button"
        onPress={onExpand ?? onOpen}
        style={({ pressed }) => ({
          minHeight: 44,
          borderRadius: 12,
          backgroundColor: c.accent,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Txt size={15} weight="600" color={c.onAccent}>
          {onExpand
            ? 'Show its units on the map'
            : node.kind === 'module'
              ? 'Open module'
              : node.status === 'passed'
                ? 'Review'
                : node.status === 'in-progress'
                  ? 'Continue'
                  : 'Open'}
        </Txt>
        <Icon name={onExpand ? 'chevron-down' : 'arrow-forward'} size={16} color={c.onAccent} />
      </Pressable>
      {onExpand && (
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={({ pressed }) => ({
            minHeight: 40,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.line,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Txt size={14} weight="600">
            Module page
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

/** Legend: shape carries the meaning. */
export function MapLegend() {
  const c = usePalette();
  const items: [string, MapNode][] = [
    [
      'Passed',
      { id: 'a', kind: 'unit', title: '', moduleId: '', moduleTitle: '', status: 'passed', progress: 1 },
    ],
    [
      'In progress',
      {
        id: 'b',
        kind: 'unit',
        title: '',
        moduleId: '',
        moduleTitle: '',
        status: 'in-progress',
        progress: 0.5,
      },
    ],
    [
      'Ready',
      { id: 'c', kind: 'unit', title: '', moduleId: '', moduleTitle: '', status: 'available', progress: 0 },
    ],
    [
      'Locked',
      { id: 'd', kind: 'unit', title: '', moduleId: '', moduleTitle: '', status: 'locked', progress: 0 },
    ],
    [
      'Module',
      {
        id: 'm',
        kind: 'module',
        title: '',
        moduleId: '',
        moduleTitle: '',
        status: 'in-progress',
        progress: 0.4,
      },
    ],
    [
      'Capstone',
      {
        id: 'e',
        kind: 'capstone',
        title: '',
        moduleId: '',
        moduleTitle: '',
        status: 'available',
        progress: 0,
      },
    ],
  ];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6, flexShrink: 1 }}>
      {items.map(([label, n]) => (
        <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Svg width={30} height={30} viewBox="-30 -30 60 60">
            <NodeShape node={n} p={{ x: 0, y: 0 }} c={c} current={false} selected={false} />
          </Svg>
          <Txt size={12} color={c.muted}>
            {label}
          </Txt>
        </View>
      ))}
    </View>
  );
}
