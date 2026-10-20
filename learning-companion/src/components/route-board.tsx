// The map as a FLAT route board: modules are stations on level lines, one line per
// phase (horizontal on desktop, one vertical line on phones). Contours are only a
// faint background texture. Every label sits horizontally on a solid plate; status
// is told by icon AND shape, never by colour alone. Mote marks where you are.
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Contours } from './art';
import { Mote } from './mote';
import { Icon, Label, Txt, usePalette, type Palette } from './ui';

export type MapNodeStatus = 'locked' | 'available' | 'in-progress' | 'passed';
export type MapNode = {
  id: string;
  kind: 'unit' | 'capstone' | 'module';
  title: string;
  moduleId: string;
  moduleTitle: string;
  phase?: string;
  status: MapNodeStatus;
  /** 0–1 share of units or steps done. */
  progress: number;
  hours?: number;
  /** Units inside a module node. */
  count?: number;
};

export const STATUS_TEXT: Record<MapNodeStatus, string> = {
  passed: 'Done',
  'in-progress': 'In progress',
  available: 'Ready to start',
  locked: 'Locked',
};

const SIZE = 44;

/** Station marker: shape + icon per status. */
export function Station({
  node,
  size = SIZE,
  current,
}: {
  node: Pick<MapNode, 'status' | 'kind'>;
  size?: number;
  current?: boolean;
}) {
  const c = usePalette();
  const s = node.status;
  const capstone = node.kind === 'capstone';
  const shape = {
    passed: {
      bg: c.accent,
      border: c.accent,
      icon: capstone ? 'flag' : 'checkmark',
      fg: c.onAccent,
      dashed: false,
      radius: size / 2,
    },
    'in-progress': {
      bg: c.accentSoft,
      border: c.accent,
      icon: capstone ? 'flag' : 'timer',
      fg: c.accentText,
      dashed: false,
      radius: size / 2,
    },
    available: {
      bg: c.plate,
      border: c.ink,
      icon: capstone ? 'flag' : 'arrow-forward',
      fg: c.ink,
      dashed: false,
      radius: 10,
    },
    locked: {
      bg: c.plate,
      border: c.edge,
      icon: capstone ? 'flag' : 'lock-closed-outline',
      fg: c.muted,
      dashed: true,
      radius: 10,
    },
  }[s];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: c.mode === 'terminal' ? 2 : capstone ? 6 : shape.radius,
        backgroundColor: shape.bg,
        borderWidth: current ? 3 : 2,
        borderStyle: shape.dashed ? 'dashed' : 'solid',
        borderColor: current ? c.ink : shape.border,
        alignItems: 'center',
        justifyContent: 'center',
        transform: capstone ? [{ rotate: '45deg' }] : undefined,
      }}
    >
      <View style={{ transform: capstone ? [{ rotate: '-45deg' }] : undefined }}>
        <Icon name={shape.icon} size={Math.round(size * 0.42)} color={shape.fg} />
      </View>
    </View>
  );
}

function Plate({
  children,
  c,
  current,
  selected,
}: {
  children: React.ReactNode;
  c: Palette;
  current?: boolean;
  selected?: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: c.plate,
        borderWidth: current || selected ? 2 : 1,
        borderColor: current ? c.accent : selected ? c.ink : c.line,
        borderRadius: c.mode === 'terminal' ? 2 : 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 2,
      }}
    >
      {children}
    </View>
  );
}

type Group = { title: string; nodes: MapNode[] };
function groupByPhase(nodes: MapNode[]): Group[] {
  const out: Group[] = [];
  for (const n of nodes) {
    const t = n.phase ?? 'Your route';
    const g = out.find(x => x.title === t);
    if (g) g.nodes.push(n);
    else out.push({ title: t, nodes: [n] });
  }
  return out;
}

const phaseParts = (t: string) => {
  const m = /^(P\d+)\s+(.*)$/.exec(t);
  return m ? { code: m[1], name: m[2] } : { code: '', name: t };
};

export function MapLegend() {
  const c = usePalette();
  const items: [MapNodeStatus, string][] = [
    ['passed', 'Done'],
    ['in-progress', 'In progress'],
    ['available', 'Ready'],
    ['locked', 'Locked'],
  ];
  return (
    <View
      accessibilityLabel="Legend"
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}
    >
      {items.map(([s, label]) => (
        <View key={s} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Station node={{ status: s, kind: 'module' }} size={24} />
          <Txt size={15} raw color={c.ink}>
            {label}
          </Txt>
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <Mote size={26} still />
        <Txt size={15} raw color={c.ink}>
          You are here
        </Txt>
      </View>
    </View>
  );
}

export function RouteBoard({
  nodes,
  currentId,
  selectedId,
  onSelect,
  renderDetail,
  interactive = true,
  compactLabels = false,
}: {
  nodes: MapNode[];
  currentId?: string;
  selectedId?: string;
  onSelect?: (n: MapNode | undefined) => void;
  renderDetail?: (n: MapNode) => React.ReactNode;
  interactive?: boolean;
  compactLabels?: boolean;
}) {
  const c = usePalette();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const wide = size.w >= 760;
  const groups = groupByPhase(nodes);
  const press = (n: MapNode) => onSelect?.(selectedId === n.id ? undefined : n);

  const stationLabel = (n: MapNode, current: boolean) => (
    <>
      <Label color={current ? c.accentText : c.muted}>
        {n.kind === 'capstone' ? 'Capstone' : n.id}
        {n.hours ? ` · ${n.hours} h` : ''}
      </Label>
      <Txt size={16} weight="600" color={c.plateInk} numberOfLines={compactLabels ? 2 : 3}>
        {n.title}
      </Txt>
      <Txt size={14} raw color={c.muted}>
        {current ? 'You are here' : STATUS_TEXT[n.status]}
        {n.count && n.status !== 'locked' ? ` · ${Math.round(n.progress * n.count)}/${n.count}` : ''}
      </Txt>
    </>
  );

  return (
    <View
      onLayout={e => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={{
        borderRadius: c.mode === 'terminal' ? 4 : 24,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.surface,
        overflow: 'hidden',
        padding: wide ? 28 : 16,
        gap: wide ? 36 : 8,
      }}
    >
      <Contours width={size.w} height={size.h} opacity={c.dark ? 0.55 : 0.6} />
      {groups.map((g, gi) => {
        const { code, name } = phaseParts(g.title);
        const passed = g.nodes.filter(n => n.status === 'passed').length;
        const selected = g.nodes.find(n => n.id === selectedId);
        const header = (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {!!code && (
              <View
                style={{
                  paddingHorizontal: 8,
                  minHeight: 26,
                  borderRadius: 6,
                  backgroundColor: c.ink,
                  justifyContent: 'center',
                }}
              >
                <Txt size={13} raw mono weight="600" color={c.bg}>
                  {code}
                </Txt>
              </View>
            )}
            <Txt size={18} weight="600" style={{ flexShrink: 1 }}>
              {name}
            </Txt>
            <Label>
              {passed}/{g.nodes.length} done
            </Label>
          </View>
        );
        if (wide)
          return (
            <View key={g.title} style={{ gap: 14 }}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: c.plate,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: c.line,
                }}
              >
                {header}
              </View>
              <View style={{ flexDirection: 'row' }}>
                {/* The level line runs through every station centre. */}
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 30 + SIZE / 2 - 1.5,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: c.edge,
                  }}
                />
                {g.nodes.map(n => {
                  const current = n.id === currentId;
                  return (
                    <Pressable
                      key={n.id}
                      testID={`station-${n.id}`}
                      disabled={!interactive}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedId === n.id }}
                      accessibilityLabel={`${n.id} ${n.title}. ${current ? 'You are here. ' : ''}${STATUS_TEXT[n.status]}`}
                      onPress={() => press(n)}
                      style={state => ({
                        flex: 1,
                        maxWidth: 240,
                        alignItems: 'center',
                        gap: 10,
                        paddingHorizontal: 6,
                        opacity: (state as { hovered?: boolean }).hovered ? 0.92 : 1,
                      })}
                    >
                      <View style={{ height: 30, justifyContent: 'flex-end' }}>
                        {current ? <Mote size={34} /> : null}
                      </View>
                      <Station node={n} current={current} />
                      <View style={{ alignSelf: 'stretch' }}>
                        <Plate c={c} current={current} selected={selectedId === n.id}>
                          {stationLabel(n, current)}
                        </Plate>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              {selected && renderDetail?.(selected)}
            </View>
          );
        // Phone: one vertical level line; labels to the right on plates.
        return (
          <View key={g.title} style={{ gap: 8 }}>
            <View style={{ paddingVertical: 6, paddingTop: gi ? 14 : 4 }}>{header}</View>
            {g.nodes.map((n, i) => {
              const current = n.id === currentId;
              const lastInAll = gi === groups.length - 1 && i === g.nodes.length - 1;
              return (
                <View key={n.id}>
                  <Pressable
                    testID={`station-${n.id}`}
                    disabled={!interactive}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedId === n.id }}
                    accessibilityLabel={`${n.id} ${n.title}. ${current ? 'You are here. ' : ''}${STATUS_TEXT[n.status]}`}
                    onPress={() => press(n)}
                    style={{ flexDirection: 'row', gap: 14, alignItems: 'stretch' }}
                  >
                    <View style={{ width: SIZE, alignItems: 'center' }}>
                      {!lastInAll && (
                        <View
                          style={{
                            position: 'absolute',
                            top: SIZE / 2,
                            bottom: -10,
                            width: 3,
                            backgroundColor: c.edge,
                          }}
                        />
                      )}
                      <View style={{ paddingTop: 8 }}>
                        <Station node={n} current={current} size={36} />
                      </View>
                    </View>
                    <View style={{ flex: 1, paddingBottom: 2 }}>
                      <Plate c={c} current={current} selected={selectedId === n.id}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                          <View style={{ flex: 1, gap: 2 }}>{stationLabel(n, current)}</View>
                          {current && <Mote size={36} />}
                        </View>
                      </Plate>
                    </View>
                  </Pressable>
                  {selectedId === n.id && renderDetail && (
                    <View style={{ marginLeft: SIZE + 14, marginTop: 8 }}>{renderDetail(n)}</View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
