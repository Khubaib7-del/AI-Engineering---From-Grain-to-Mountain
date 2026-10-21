import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Collapse } from '../../components/motion';
import { MapLegend, RouteBoard, STATUS_TEXT, Station, type MapNode } from '../../components/route-board';
import { Button, Label, Panel, RoundIconButton, Row, Screen, Segmented, Txt, usePalette } from '../../components/ui';
import { clusteredNodes, legacyNodes, v2Nodes } from '../../lib/map-nodes';
import { useLearning } from '../../lib/store';
import { usePath } from '../../lib/use-path';
import { TRACK_LABEL } from '../../lib/path';

export default function MapScreen() {
  const c = usePalette();
  const { state } = useLearning();
  const path = usePath();
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const currentModule = path.current?.module.id ?? path.modules[0]?.id;
  const [selected, setSelected] = useState<string | undefined>(currentModule);
  const nodes = useMemo(
    () =>
      path.hasV2 ? clusteredNodes(path.units, state, new Set()) : legacyNodes(path.legacyModules, state),
    [path, state],
  );
  const allNodes = useMemo(() => (path.hasV2 ? v2Nodes(path.units, state) : nodes), [path, state, nodes]);
  const [listOpen, setListOpen] = useState<Set<string>>(() => new Set(currentModule ? [currentModule] : []));
  const toggleModule = (id: string) =>
    setListOpen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const currentId = path.hasV2 ? currentModule : nodes.find(n => n.status !== 'passed')?.id;
  const open = (n: MapNode) => router.push(n.kind === 'unit' ? `/unit/${n.id}` : `/module/${n.moduleId}`);
  const unitsOf = (moduleId: string) => allNodes.filter(n => n.moduleId === moduleId);

  const detail = (n: MapNode) => {
    const units = path.hasV2 ? unitsOf(n.moduleId) : [];
    const shown = units.slice(0, 8);
    return (
      <Panel style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 220, gap: 4 }}>
            <Label>
              {n.id} · {STATUS_TEXT[n.status]}
            </Label>
            <Txt size={20} weight="600">
              {n.title}
            </Txt>
          </View>
          <Button title="Open module" icon="arrow-forward" compact onPress={() => open(n)} />
        </View>
        {shown.map((u, i) => (
          <Row
            key={u.id}
            title={u.title}
            subtitle={`${u.kind === 'capstone' ? 'Capstone' : u.id}${u.hours ? ` · ${u.hours} h` : ''} · ${u.id === path.current?.unit.id ? 'You are here' : STATUS_TEXT[u.status]}`}
            leading={<Station node={u} size={30} current={u.id === path.current?.unit.id} />}
            onPress={() => open(u)}
            last={i === shown.length - 1 && units.length <= shown.length}
          />
        ))}
        {units.length > shown.length && (
          <Txt size={15} color={c.muted}>
            + {units.length - shown.length} more on the module page
          </Txt>
        )}
      </Panel>
    );
  };

  return (
    <Screen
      title="Your route"
      docTitle="Map"
      subtitle={`${TRACK_LABEL[state.profile?.track ?? 'undecided']} · ${path.hasV2 ? `${path.passed} of ${path.units.length} units done` : `${nodes.filter(n => n.status === 'passed').length} of ${nodes.length} modules`}`}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Segmented
          label="View"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'map', label: 'Route', icon: 'route' },
            { value: 'list', label: 'List', icon: 'list' },
          ]}
        />
        {mode === 'map' && <MapLegend />}
      </View>
      {mode === 'map' ? (
        <>
          <RouteBoard
            nodes={nodes}
            currentId={currentId}
            selectedId={selected}
            onSelect={n => setSelected(n?.id)}
            renderDetail={detail}
          />
          <Txt size={15} color={c.muted}>
            Tap a station to see its units. Each line is one phase; finish a line, then start the next.
          </Txt>
        </>
      ) : path.hasV2 ? (
        <View style={{ gap: 12 }}>
          {path.modules.map(m => {
            const units = unitsOf(m.id);
            const passed = units.filter(n => n.kind === 'unit' && n.status === 'passed').length;
            const total = units.filter(n => n.kind === 'unit').length;
            const isOpen = listOpen.has(m.id);
            return (
              <Animated.View key={m.id} layout={LinearTransition.duration(240)}>
              <Panel style={{ gap: 0, paddingVertical: 6 }}>
                <Row
                  title={m.title}
                  subtitle={`${passed}/${total} units done · ${m.phase}${m.id === currentModule ? ' · you are here' : ''}`}
                  leading={m.id}
                  trailing={
                    <RoundIconButton
                      icon="chevron-down"
                      turn={isOpen ? 180 : 0}
                      active={isOpen}
                      label={isOpen ? `Collapse ${m.title}` : `Expand ${m.title}`}
                      onPress={() => toggleModule(m.id)}
                    />
                  }
                  onPress={() => toggleModule(m.id)}
                  last={!isOpen}
                />
                <Collapse open={isOpen}>
                  {units.map((n, i) => (
                    <Row
                      key={n.id}
                      title={n.title}
                      subtitle={`${n.kind === 'capstone' ? 'Capstone' : n.id}${n.hours ? ` · ${n.hours} h` : ''} · ${n.id === path.current?.unit.id ? 'You are here' : STATUS_TEXT[n.status]}`}
                      leading={<Station node={n} size={30} current={n.id === path.current?.unit.id} />}
                      onPress={() => open(n)}
                      last={i === units.length - 1}
                    />
                  ))}
                </Collapse>
              </Panel>
              </Animated.View>
            );
          })}
        </View>
      ) : (
        <Panel>
          {nodes.map((n, i) => (
            <Row
              key={n.id}
              title={n.title}
              subtitle={`${n.id}${n.hours ? ` · ${n.hours} h` : ''} · ${STATUS_TEXT[n.status]}`}
              leading={<Station node={n} size={30} />}
              onPress={() => open(n)}
              last={i === nodes.length - 1}
            />
          ))}
        </Panel>
      )}
    </Screen>
  );
}
