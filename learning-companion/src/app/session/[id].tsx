import { useState } from 'react';
import { Linking, Platform, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button, Icon, inputStyle, Panel, Pieces, Screen, Section, Txt, usePalette } from '../../components/ui';
import { lessons } from '../../lib/content';
import { canComplete, emptyWork, reviewDue } from '../../lib/planner';
import { useLearning } from '../../lib/store';
export default function Session() {
  const { id, review } = useLocalSearchParams<{ id: string; review?: string }>(), { state, update } = useLearning(), c = usePalette();
  const lesson = lessons.find(l => l.id === id), saved = state.lessons[id] ?? emptyWork();
  const [draft, setDraft] = useState({ id, source: saved.evidence, value: saved.evidence }), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  if (draft.id !== id || draft.source !== saved.evidence) setDraft({ id, source: saved.evidence, value: saved.evidence });
  const evidence = draft.value;
  const setEvidence = (value: string) => setDraft(d => ({ ...d, value }));
  if (!lesson) return <Screen back title="Lesson not found." />;
  const ready = lesson.prerequisites.every(p => state.lessons[p]?.completedAt), complete = !!saved.completedAt;
  const save = async (finish = false) => {
    const work = { ...saved, evidence };
    if (complete && evidence.trim().length < 12) { setMessage('Keep at least one sentence of evidence for your completed lesson.'); return; }
    if (finish && !canComplete(lesson, work, state)) { setMessage('Finish the tasks and write at least 12 characters of evidence.'); return; }
    setBusy(true);
    const ok = await update(s => ({ ...s, lessons: { ...s.lessons, [id]: { ...(s.lessons[id] ?? emptyWork()), evidence, ...(finish ? { completedAt: saved.completedAt ?? new Date().toISOString() } : {}) } } }));
    setBusy(false);
    if (ok) { setMessage(finish ? 'Work saved. You built another piece.' : 'Notes saved.'); if (finish && Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); }
  };
  const toggle = async (i: number) => { if (busy || complete || !ready) return; setBusy(true); const ok = await update(s => { const work = s.lessons[id] ?? emptyWork(); return { ...s, lessons: { ...s.lessons, [id]: { ...work, tasks: work.tasks.map((v, n) => n === i ? !v : v) } } }; }); setBusy(false); if (ok && Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => {}); };
  return <Screen back title={lesson.title} subtitle={`Day ${lesson.day} · ${lesson.estimatedMinutes} minutes`}>
    {!ready && <View style={{ padding: 20, backgroundColor: c.soft, borderRadius: 20, gap: 8 }}><Txt weight="700">Preview this lesson</Txt><Txt>Complete {lesson.prerequisites.join(', ')} first. You can read ahead; saving tasks waits until the earlier work is complete.</Txt><Button title="Open previous lesson" secondary onPress={() => router.push(`/session/${lesson.prerequisites[0]}`)} /></View>}
    <Panel style={{backgroundColor:c.hero}}><Pieces tasks={saved.tasks} /><Txt size={12} weight="600" color={c.accent}>{complete ? 'WORK SAVED' : 'WATCH → BUILD → RECALL'}</Txt></Panel>
    {review === '1' && complete && <View style={{ padding: 20, backgroundColor: c.soft, borderRadius: 20, gap: 12 }}><Section title="Recall without notes" /><Txt>{lesson.tasks.find(t => t.kind === 'recall')?.description}</Txt><Button title="I recalled this without help" disabled={!reviewDue(saved)} onPress={() => { void update(s => { const w = s.lessons[id]; return { ...s, lessons: { ...s.lessons, [id]: { ...w, reviews: [...w.reviews, new Date().toISOString()] } } }; }).then(ok => { if (ok) setMessage('Review saved. The next revisit is scheduled from your original completion date.'); }); }} /><Txt size={14} color={c.muted}>Confirm only after answering. If you needed help, study the notes and try again later.</Txt></View>}
    {lesson.study && <Panel><Section title="Only this step today"/><Txt weight="600">{lesson.study.title}</Txt><Txt>{lesson.study.assignment}</Txt><Txt size={14} color={c.muted}>{lesson.study.smallStep}</Txt><Txt size={14} weight="600">Your stopping point</Txt><Txt size={14} color={c.muted}>{lesson.study.stopWhen}</Txt><Txt size={12} color={c.muted}>The day number is a sequence, not a deadline. You can spread this lesson over several days.</Txt></Panel>}
    <Button title="Open course lesson" secondary icon="open-outline" onPress={() => { void Linking.openURL(lesson.resourceUrl).catch(() => setMessage('Could not open the course. Check your connection.')); }} />
    {lesson.study && <Button title="Read matching notes" secondary icon="book-outline" onPress={()=>{void Linking.openURL(lesson.study!.readingUrl).catch(()=>setMessage('Could not open the notes. Check your connection.'));}}/>}
    <Panel style={{gap:0}}>{lesson.tasks.map((task, i) => <Pressable key={task.kind} accessibilityRole="checkbox" accessibilityState={{ checked: saved.tasks[i], disabled: !ready || complete || busy }} onPress={() => void toggle(i)} disabled={!ready || complete || busy} style={({ pressed }) => ({ flexDirection: 'row', paddingVertical: 20, gap: 14, borderBottomWidth: 1, borderColor: c.line, opacity: pressed ? .65 : 1 })}><Icon name={saved.tasks[i] ? 'checkmark-circle' : 'ellipse-outline'} color={c.accent} size={26} /><View style={{ flex: 1, gap: 6 }}><Txt size={14} weight="700" color={c.accent}>{['01 / WATCH OR READ', '02 / BUILD', '03 / RECALL'][i]}</Txt><Txt>{task.description}</Txt></View></Pressable>)}</Panel>
    <Panel><Section title="Your field notes" /><Txt color={c.muted}>What did you build? Explain what happened, or paste a link to your code. At least one useful sentence.</Txt><TextInput accessibilityLabel="Lesson evidence" multiline editable={ready && !busy} value={evidence} onChangeText={value => {setEvidence(value); if(message === 'Notes saved.') setMessage('');}} placeholder="I ran hello.py using… Input means…" placeholderTextColor={c.muted} maxLength={20000} style={[inputStyle(c), { minHeight: 160, textAlignVertical: 'top' }]} /><Button title={busy ? 'Saving…' : message === 'Notes saved.' ? 'Notes saved' : 'Save notes'} secondary disabled={!ready || busy} onPress={() => void save()} /></Panel>
    {!!message && <Txt accessibilityLiveRegion="polite" color={c.accent} weight="600">{message}</Txt>}
    {!complete ? <Button title={busy ? 'Saving…' : 'Complete lesson'} testID="complete-lesson" disabled={busy || !canComplete(lesson, { ...saved, evidence }, state)} onPress={() => void save(true)} icon="checkmark" /> : <Button title={lesson.day < 28 ? 'Open next lesson' : 'Continue in Path'} onPress={() => lesson.day < 28 ? router.push(`/session/${lessons[lesson.day].id}`) : router.push('/path')} icon="arrow-forward" />}
    <Txt size={14} color={c.muted}>Completion is your confirmation of practice, not a certificate of mastery.</Txt>
  </Screen>;
}
