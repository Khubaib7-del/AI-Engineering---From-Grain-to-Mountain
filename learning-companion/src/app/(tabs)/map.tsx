import { useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { MapLegend, MountainMap, type MapNode } from '../../components/mountain-map';
import { Icon, Panel, Row, Screen, Tag, Txt, usePalette, useWide } from '../../components/ui';
import { clusteredNodes, legacyNodes, v2Nodes } from '../../lib/map-nodes';
import { useLearning } from '../../lib/store';
import { usePath } from '../../lib/use-path';
import { TRACK_LABEL } from '../../lib/path';

const STATUS_ICON: Record<string, string> = {
  passed: 'checkmark-circle',
  'in-progress': 'timer',
  available: 'ellipse-outline',
  locked: 'circle-dashed',
};

export default function MapScreen() {
  const c = usePalette();
  const wide = useWide();
  const { height } = useWindowDimensions();
  const { state } = useLearning();
  const path = usePath();
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [selected, setSelected] = useState<string>();
  const [focus, setFocus] = useState<string>();
  const currentModule = path.current?.module.id ?? path.modules[0]?.id;
  // Only the module you are in (plus one you open) is drawn unit by unit; the rest are camps.
  const [opened, setOpened] = useState<string>();
  const expanded = useMemo(
    () => new Set([currentModule, opened].filter((id): id is string => !!id)),
    [currentModule, opened],
  );
  const nodes = useMemo(
    () =>
      path.hasV2 ? clusteredNodes(path.units, state, expanded) : legacyNodes(path.legacyModules, state),
    [path, state, expanded],
  );
  const allNodes = useMemo(() => (path.hasV2 ? v2Nodes(path.units, state) : nodes), [path, state, nodes]);
  const [listOpen, setListOpen] = useState<Set<string>>(() => new Set(currentModule ? [currentModule] : []));
  const currentId = path.hasV2
    ? path.current
      ? expanded.has(path.current.module.id)
        ? path.current.unit.id
        : path.current.module.id
      : nodes[nodes.length - 1]?.id
    : nodes.find(n => n.status !== 'passed')?.id;
  const open = (n: MapNode) =>
    router.push(n.kind === 'unit' ? `/unit/${n.id}` : `/module/${n.moduleId}`);
  const expand = (n: MapNode) => {
    setOpened(n.moduleId);
    setSelected(undefined);
    setFocus(path.units.find(u => u.module.id === n.moduleId)?.unit.id);
  };
  const modulesInList = path.hasV2 ? path.modules : [];

  return (
    <Screen
      title="Your map"
      docTitle="Map"
      subtitle={`${TRACK_LABEL[state.profile?.track ?? 'undecided']} · ${path.hasV2 ? `${path.passed} of ${path.units.length} units passed` : `${nodes.filter(n => n.status === 'passed').length} of ${nodes.length} modules`}`}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 8 }}>
          <Tag text="Map" active={mode === 'map'} onPress={() => setMode('map')} />
          <Tag text="List" active={mode === 'list'} onPress={() => setMode('list')} />
        </View>
        {mode === 'map' && <MapLegend />}
      </View>
      {mode === 'map' ? (
        <>
          {!!opened && opened !== currentModule && (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Txt size={13} color={c.muted}>
                Showing the units of {opened} and of the module you are in.
              </Txt>
              <Tag
                text="Fold it back"
                onPress={() => {
                  setOpened(undefined);
                  setFocus(undefined);
                }}
              />
            </View>
          )}
          <MountainMap
            nodes={nodes}
            currentId={currentId}
            focusId={focus}
            onExpand={expand}
            onOpen={open}
            selectedId={selected}
            onSelect={n => setSelected(n?.id)}
            height={Math.max(460, Math.min(height - (wide ? 300 : 280), 900))}
          />
          <Txt size={12} color={c.muted}>
            Drag to pan, pinch or ⌘/Ctrl-scroll to zoom. Squares are modules — tap one to show its units. The flag marks where you are.
          </Txt>
        </>
      ) : path.hasV2 ? (
        <View style={{ gap: 10 }}>
          {modulesInList.map(m => {
            const units = allNodes.filter(n => n.moduleId === m.id);
            const passed = units.filter(n => n.kind === 'unit' && n.status === 'passed').length;
            const total = units.filter(n => n.kind === 'unit').length;
            const isOpen = listOpen.has(m.id);
            return (
              <Panel key={m.id} style={{ gap: 4, paddingVertical: 6 }}>
                <Row
                  title={`${m.id} · ${m.title}`}
                  subtitle={`${passed}/${total} units passed · ${m.phase}${m.id === currentModule ? ' · you are here' : ''}`}
                  leading={<Icon name={isOpen ? 'chevron-down' : 'chevron-forward'} size={18} />}
                  onPress={() =>
                    setListOpen(prev => {
                      const next = new Set(prev);
                      if (next.has(m.id)) next.delete(m.id);
                      else next.add(m.id);
                      return next;
                    })
                  }
                  last={!isOpen}
                />
                {isOpen &&
                  units.map((n, i) => (
                    <Row
                      key={n.id}
                      title={n.title}
                      subtitle={`${n.kind === 'capstone' ? 'Capstone' : n.id}${n.hours ? ` · ${n.hours} h` : ''} · ${n.status.replace('-', ' ')}${n.id === path.current?.unit.id ? ' · you are here' : ''}`}
                      leading={
                        <Icon
                          name={n.kind === 'capstone' ? 'flag' : STATUS_ICON[n.status]}
                          size={20}
                          color={n.status === 'locked' ? c.faint : c.ink}
                        />
                      }
                      onPress={() => open(n)}
                      last={i === units.length - 1}
                    />
                  ))}
              </Panel>
            );
          })}
        </View>
      ) : (
        <Panel>
          {nodes.map((n, i) => (
            <Row
              key={n.id}
              title={n.title}
              subtitle={`${n.id}${n.hours ? ` · ${n.hours} h` : ''} · ${n.status.replace('-', ' ')}`}
              leading={<Icon name={STATUS_ICON[n.status]} size={20} color={n.status === 'locked' ? c.faint : c.ink} />}
              onPress={() => open(n)}
              last={i === nodes.length - 1}
            />
          ))}
        </Panel>
      )}
    </Screen>
  );
}
