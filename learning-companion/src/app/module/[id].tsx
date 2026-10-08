import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Icon, Meter, Panel, Screen, Section, Txt, usePalette } from '../../components/ui';
import { allTopicIds, modules, resources, topicId, studyGuides } from '../../lib/content';
import {StudyGuide} from '../../components/study-guide';
import { useLearning } from '../../lib/store';
export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(), { state, update } = useLearning(), c = usePalette(), [message, setMessage] = useState('');
  const module = modules.find(m => m.id === id);
  if (!module) return <Screen back title="Module not found." />;
  const ready = module.prerequisites.every(p => state.verified[p]), verified = !!state.verified[id], ids = allTopicIds.filter(t => t.startsWith(`${id}.`)), count = ids.filter(t => state.topics[t]).length, course = resources.find(r => r.id === module.course);
  return <Screen back title={module.title} subtitle={`${id} · ${count}/${ids.length} concepts studied · ~${module.hours} hours`}>
    <Meter value={count/ids.length} label="Module concepts studied" />
    {!ready && <View style={{ gap: 12, padding: 20, backgroundColor: c.soft, borderRadius: 20 }}><Txt weight="700">Preview now. Build on your foundation.</Txt><Txt>Self-assess the prerequisite modules before recording progress here.</Txt>{module.prerequisites.filter(p => !state.verified[p]).map(p => <Button key={p} secondary title={`${p}: ${modules.find(m => m.id === p)?.title}`} onPress={() => router.push(`/module/${p}`)} />)}</View>}
    {studyGuides.find(g=>g.moduleId===id) && <StudyGuide key={id} guide={studyGuides.find(g=>g.moduleId===id)!}/> }
    <Panel><Section title="The assessment" /><Txt>{module.gate}</Txt><Txt size={14} color={c.muted}>Checking concepts means “studied”. Confirm the assessment only after doing the exercise without relying on generated answers.</Txt><Button title={verified ? 'Assessment confirmed' : 'I demonstrated this skill'} disabled={!ready || count !== ids.length || verified} onPress={() => { void update(s => ({ ...s, verified: { ...s.verified, [id]: new Date().toISOString() } })).then(ok => { if (ok) setMessage('Assessment recorded. The next modules are ready.'); }); }} /></Panel>
    {!!message && <Txt accessibilityLiveRegion="polite" color={c.accent}>{message}</Txt>}
    {course && !studyGuides.some(g=>g.moduleId===id) && <Button title={course.title} secondary icon="open-outline" onPress={() => { void Linking.openURL(course.url).catch(() => setMessage('Could not open this course.')); }} />}
    {module.groups.map((group, gi) => <Panel key={group.title}><Section title={group.title} />{group.topics.map((topic, ti) => { const tid = topicId(id, gi, ti), checked = !!state.topics[tid]; return <Pressable key={tid} accessibilityRole="checkbox" accessibilityLabel={topic} accessibilityState={{ checked, disabled: !ready || verified }} disabled={!ready || verified} onPress={() => { void update(s => ({ ...s, topics: { ...s.topics, [tid]: !s.topics[tid] } })); }} style={({ pressed }) => ({ flexDirection: 'row', gap: 14, alignItems: 'center', minHeight: 54, paddingVertical: 14, borderBottomWidth: 1, borderColor: c.line, opacity: pressed ? .65 : 1 })}><Icon name={checked ? 'checkmark-circle' : 'ellipse-outline'} color={c.accent} /><Txt style={{ flex: 1 }}>{topic}</Txt></Pressable>; })}</Panel>)}
  </Screen>;
}
