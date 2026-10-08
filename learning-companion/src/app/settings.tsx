import { useState } from 'react';
import { Linking, Platform, Switch, TextInput, View } from 'react-native';
import { Button, inputStyle, Panel, Screen, Section, Tag, Txt, usePalette } from '../components/ui';
import { isQuiet, validTime } from '../lib/planner';
import { requestReminders, testReminder } from '../lib/notifications';
import { useLearning } from '../lib/store';
export default function Settings() {
  const { state, update, importBackup } = useLearning(), c = usePalette(), [times, setTimes] = useState(state.settings.times.join(', ')), [quietStart, setQuietStart] = useState(state.settings.quietStart), [quietEnd, setQuietEnd] = useState(state.settings.quietEnd), [weekdays, setWeekdays] = useState(state.settings.weekdays), [backup, setBackup] = useState(''), [importing, setImporting] = useState(false), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const savedSource = JSON.stringify([state.settings.times, state.settings.quietStart, state.settings.quietEnd, state.settings.weekdays]);
  const [source, setSource] = useState(savedSource);
  if (source !== savedSource) { setSource(savedSource); setTimes(state.settings.times.join(', ')); setQuietStart(state.settings.quietStart); setQuietEnd(state.settings.quietEnd); setWeekdays(state.settings.weekdays); }
  const saveSettings = async (enabled = state.settings.reminders) => {
    const parsed = [...new Set(times.split(',').map(t => t.trim()))];
    if (parsed.length < 1 || parsed.length > 4 || !parsed.every(validTime) || !validTime(quietStart) || !validTime(quietEnd) || !weekdays.length) { setMessage('Use 1–4 times in HH:MM format and select at least one study day.'); return; }
    if (enabled && parsed.every(t => isQuiet(t, quietStart, quietEnd))) { setMessage('All reminder times fall inside quiet hours. Choose a time outside them.'); return; }
    setBusy(true);
    try {
      if (enabled && !await requestReminders()) { setMessage('Permission is off. Enable notifications in phone settings, then try again.'); return; }
      const ok = await update(s => ({ ...s, settings: { ...s.settings, reminders: enabled, times: parsed, quietStart, quietEnd, weekdays } }));
      if (ok) setMessage(enabled ? 'Saved. Reminder delivery depends on your phone’s permission and battery settings.' : 'Preferences saved. Reminders are off.');
    } catch (e) { setMessage(String(e)); } finally { setBusy(false); }
  };
  return <Screen back action={false} title="Settings" subtitle="Make learning fit your day.">
    <Panel><Section title="Appearance" /><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{(['system', 'light', 'dark'] as const).map(t => <Tag key={t} text={t[0].toUpperCase() + t.slice(1)} active={state.settings.theme === t} onPress={() => { void update(s => ({ ...s, settings: { ...s.settings, theme: t } })); }} />)}</View></Panel>
    <Panel><Section title="Study reminders" /><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Txt style={{ flex: 1 }}>{Platform.OS === 'web' ? 'Available on your phone' : 'Remind me to learn'}</Txt><Switch accessibilityLabel="Enable study reminders" disabled={Platform.OS === 'web' || busy} value={state.settings.reminders && Platform.OS !== 'web'} onValueChange={value => { if (!value) { void update(s => ({ ...s, settings: { ...s.settings, reminders: false } })); } else void saveSettings(true); }} trackColor={{ true: c.accent }} /></View><Txt size={14} color={c.muted}>Local reminders need no account. Schedule the current unfinished lesson for the next 7 days. Reopen the app weekly to refresh; no future lesson is assumed complete.</Txt>
      <Txt weight="600">Times, in your phone’s timezone</Txt><TextInput accessibilityLabel="Reminder times" value={times} onChangeText={setTimes} placeholder="09:00, 20:00" placeholderTextColor={c.muted} style={inputStyle(c)} /><Txt size={14} color={c.muted}>24-hour clock. Up to four times, separated by commas.</Txt>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => <Tag key={day} text={day} active={weekdays.includes(i)} onPress={() => setWeekdays(v => v.includes(i) ? v.filter(d => d !== i) : [...v, i])} />)}</View>
      <Txt weight="600">Quiet hours</Txt><View style={{ flexDirection: 'row', gap: 12 }}><View style={{ flex: 1, gap: 6 }}><Txt size={14}>From</Txt><TextInput accessibilityLabel="Quiet hours start" value={quietStart} onChangeText={setQuietStart} style={inputStyle(c)} /></View><View style={{ flex: 1, gap: 6 }}><Txt size={14}>Until</Txt><TextInput accessibilityLabel="Quiet hours end" value={quietEnd} onChangeText={setQuietEnd} style={inputStyle(c)} /></View></View>
      <Button title={busy ? 'Saving…' : 'Save reminder preferences'} disabled={busy} onPress={() => void saveSettings()} />
      {Platform.OS !== 'web' && <><Button title="Send a test in 10 seconds" secondary onPress={() => { void testReminder().then(() => setMessage('Test scheduled. Put the app in the background for 10 seconds.')).catch(e => setMessage(String(e))); }} /><Button title="Open phone notification settings" secondary onPress={() => { void Linking.openSettings().catch(() => setMessage('Open notification settings manually on your phone.')); }} /></>}
    </Panel>
    {!!message && <Txt accessibilityLiveRegion="polite" color={c.accent}>{message}</Txt>}
    <Panel><Section title="Restore a notebook" /><Txt color={c.muted}>Export from Progress first. Import replaces this device’s notebook and turns reminders off until you enable them again.</Txt><TextInput accessibilityLabel="Backup JSON" value={backup} onChangeText={setBackup} multiline placeholder="Paste your exported JSON here" placeholderTextColor={c.muted} style={[inputStyle(c), { minHeight: 120, textAlignVertical: 'top' }]} />{!importing ? <Button title="Review import" secondary disabled={!backup.trim()} onPress={() => setImporting(true)} /> : <View style={{ gap: 12 }}><Txt>Replace the current notebook with this backup?</Txt><Button title="Replace notebook" onPress={() => { void importBackup(backup).then(ok => { if (ok) { setBackup(''); setImporting(false); setMessage('Notebook restored.'); } }); }} /><Button title="Cancel import" secondary onPress={() => setImporting(false)} /></View>}</Panel>
    <Txt size={14} color={c.muted}>AI Learning · v0.1 · Personal prototype. No sign-in, ads or analytics. Resources require internet; your notebook works offline.</Txt>
  </Screen>;
}
