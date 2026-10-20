import { useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { MapLegend, MountainMap, type MapNode } from '../../components/mountain-map';
import { Chip, Icon, Panel, Row, Screen, Tag, Txt, usePalette, useWide } from '../../components/ui';
import { legacyNodes, v2Nodes } from '../../lib/map-nodes';
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
  const nodes = useMemo(
    () => (path.hasV2 ? v2Nodes(path.units, state) : legacyNodes(path.legacyModules, state)),
    [path, state],
  );
  const currentId = path.hasV2
    ? (path.current?.unit.id ?? nodes[nodes.length - 1]?.id)
    : nodes.find(n => n.status !== 'passed')?.id;
  const open = (n: MapNode) => router.push(n.kind === 'unit' ? `/unit/${n.id}` : `/module/${n.moduleId}`);

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
          <MountainMap
            nodes={nodes}
            currentId={currentId}
            onOpen={open}
            selectedId={selected}
            onSelect={n => setSelected(n?.id)}
            height={Math.max(460, Math.min(height - (wide ? 300 : 280), 900))}
          />
          <Txt size={12} color={c.muted}>
            Drag to pan, pinch or ⌘/Ctrl-scroll to zoom. Tap a step to see it; the flag marks where you are.
          </Txt>
        </>
      ) : (
        <Panel>
          {nodes.map((n, i) => {
            const firstOfModule = i === 0 || nodes[i - 1].moduleId !== n.moduleId;
            return (
              <View key={n.id}>
                {firstOfModule && n.kind !== 'module' && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingTop: i ? 18 : 0,
                      paddingBottom: 4,
                    }}
                  >
                    <Chip text={n.moduleId} />
                    <Txt size={14} weight="600" color={c.muted}>
                      {n.moduleTitle}
                    </Txt>
                  </View>
                )}
                <Row
                  title={n.title}
                  subtitle={`${n.kind === 'capstone' ? 'Capstone' : n.id}${n.hours ? ` · ${n.hours} h` : ''} · ${n.status.replace('-', ' ')}${n.id === currentId ? ' · you are here' : ''}`}
                  leading={
                    <Icon
                      name={n.kind === 'capstone' ? 'flag' : STATUS_ICON[n.status]}
                      size={20}
                      color={n.status === 'locked' ? c.faint : c.ink}
                    />
                  }
                  onPress={() => open(n)}
                  last={i === nodes.length - 1}
                />
              </View>
            );
          })}
        </Panel>
      )}
    </Screen>
  );
}
