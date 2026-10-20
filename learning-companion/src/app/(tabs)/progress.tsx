import { Share, View } from 'react-native';
import { router } from 'expo-router';
import {
  Button,
  Grid,
  Icon,
  Panel,
  Row,
  Screen,
  Section,
  Split,
  Txt,
  isWeb,
  usePalette,
} from '../../components/ui';
import { Heatmap } from '../../components/heatmap';
import { activeDaysInMonth, streaks } from '../../lib/activity';
import { bestAttempt } from '../../lib/assess';
import { lessons } from '../../lib/content';
import { reviewDue } from '../../lib/planner';
import { useLearning } from '../../lib/store';
import { unitTitle, usePath } from '../../lib/use-path';

function Stat({ icon, value, label, hint }: { icon: string; value: string; label: string; hint?: string }) {
  const c = usePalette();
  return (
    <Panel style={{ gap: 10, minHeight: 148 }}>
      <Icon name={icon} size={20} color={c.muted} />
      <Txt size={32} weight="700">
        {value}
      </Txt>
      <View>
        <Txt size={14} weight="600">
          {label}
        </Txt>
        {!!hint && (
          <Txt size={12} color={c.muted}>
            {hint}
          </Txt>
        )}
      </View>
    </Panel>
  );
}

export default function Progress() {
  const c = usePalette();
  const { state, scope, syncStatus, lastSyncedAt, showToast } = useLearning();
  const path = usePath();
  const activity = state.activity ?? [];
  const streak = streaks(activity);
  const complete = lessons.filter(l => state.lessons[l.id]?.completedAt);
  const due = complete.filter(l => reviewDue(state.lessons[l.id]));
  const attempts = Object.values(state.units ?? {}).flatMap(u => u.attempts);
  const accuracy = attempts.length
    ? Math.round((attempts.reduce((n, a) => n + a.score / a.max, 0) / attempts.length) * 100)
    : undefined;
  const shipped = Object.values(state.capstones ?? {}).filter(x => x.submittedAt).length;
  const notes = Object.entries(state.units ?? {}).filter(([, w]) => w.evidence?.trim());
  const guest = scope === 'guest';

  const exportBackup = async () => {
    try {
      const text = JSON.stringify(state, null, 2);
      if (isWeb) {
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grain-to-mountain-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Backup downloaded.');
      } else await Share.share({ title: 'Grain to Mountain backup', message: text });
    } catch {
      showToast('Backup could not be shared. Try again.');
    }
  };

  return (
    <Screen
      title="Progress"
      subtitle="Your work, not your clicks: what you have proven, and how consistently you show up."
      docTitle="Progress"
    >
      <Grid min={150}>
        <Stat
          icon="flame"
          value={`${streak.current} day${streak.current === 1 ? '' : 's'}`}
          label="Current streak"
          hint={`Longest ${streak.longest} · ${activeDaysInMonth(activity)} active days this month`}
        />
        <Stat
          icon="target"
          value={path.hasV2 ? `${path.passed}/${path.units.length}` : `${complete.length}/${lessons.length}`}
          label={path.hasV2 ? 'Units passed on your path' : 'Guided lessons done'}
          hint={path.hasV2 ? `${path.hoursLeft} core hours left` : undefined}
        />
        <Stat
          icon="clipboard"
          value={accuracy === undefined ? '—' : `${accuracy}%`}
          label="Quiz accuracy"
          hint={`${attempts.length} attempt${attempts.length === 1 ? '' : 's'}`}
        />
        <Stat
          icon="trophy"
          value={String(shipped)}
          label="Capstones shipped"
          hint={
            path.hasV2
              ? `Finish ≈ ${path.finish.date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} at ${path.hoursPerWeek} h/week`
              : undefined
          }
        />
      </Grid>

      <Panel>
        <Section title="Activity" aside={`${activity.length} events`} />
        <Heatmap activity={activity} labelFor={unitTitle} />
        <Txt size={12} color={c.muted}>
          Every ticked topic, saved practice, quiz attempt and passed unit is logged with its time. Older
          ticks from before the log are undated.
        </Txt>
      </Panel>

      <Split>
        <Panel style={{ flex: 1.4 }}>
          <Section title="Field notes" aside={`${notes.length + complete.length} saved`} />
          {notes.map(([id, w], i) => (
            <Row
              key={id}
              title={unitTitle(id)}
              subtitle={(w.evidence ?? '').slice(0, 110)}
              leading={id.replace(/\.U/, '·')}
              onPress={() => router.push(`/unit/${id}`)}
              last={i === notes.length - 1 && !complete.length}
            />
          ))}
          {complete
            .slice()
            .reverse()
            .map((l, i) => (
              <Row
                key={l.id}
                title={l.title}
                subtitle={state.lessons[l.id].evidence.slice(0, 110)}
                leading={`D${String(l.day).padStart(2, '0')}`}
                onPress={() => router.push(`/session/${l.id}`)}
                last={i === complete.length - 1}
              />
            ))}
          {!notes.length && !complete.length && (
            <View style={{ gap: 12, paddingVertical: 8, alignItems: 'flex-start' }}>
              <Txt color={c.muted}>
                Your practice evidence collects here: links to code, short write-ups and what you built.
              </Txt>
              <Button
                title="Go to today’s plan"
                secondary
                icon="arrow-forward"
                onPress={() => router.navigate('/today')}
              />
            </View>
          )}
        </Panel>
        <Panel style={{ flex: 1 }}>
          <Section title="Reviews due" aside={`${due.length} due`} />
          {due.length ? (
            due.map((l, i) => (
              <Row
                key={l.id}
                title={l.title}
                subtitle="Explain it without your notes"
                onPress={() => router.push(`/session/${l.id}?review=1`)}
                last={i === due.length - 1}
              />
            ))
          ) : (
            <Txt color={c.muted} size={14}>
              You’re all caught up. Completed lessons come back after 1, 3, 7 and 14 days.
            </Txt>
          )}
          {path.units.some(u => u.status === 'passed' && bestAttempt(state.units?.[u.unit.id])) && (
            <Txt size={13} weight="600" color={c.muted} style={{ paddingTop: 12 }}>
              RECENTLY PASSED
            </Txt>
          )}
          {path.units
            .filter(u => u.status === 'passed' && bestAttempt(state.units?.[u.unit.id]))
            .slice(-3)
            .map(u => (
              <Row
                key={u.unit.id}
                title={u.unit.title}
                subtitle={`Best quiz score ${Math.round(((bestAttempt(state.units?.[u.unit.id])?.score ?? 0) / (bestAttempt(state.units?.[u.unit.id])?.max ?? 1)) * 100)}%`}
                onPress={() => router.push(`/unit/${u.unit.id}`)}
              />
            ))}
        </Panel>
      </Split>

      <Panel>
        <Section title="Backup and sync" />
        <Txt size={14} color={c.muted}>
          {guest
            ? 'Saved on this device only. Sign in to sync across web and Android, or export a backup before clearing browser data.'
            : `Synced to your account${syncStatus === 'synced' && lastSyncedAt ? ` · last synced ${new Date(lastSyncedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : syncStatus === 'pending' ? ' · offline, changes saved on this device' : ''}. A backup file is still a good idea before switching devices.`}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button title="Export backup" icon="share-outline" secondary onPress={() => void exportBackup()} />
          {guest && <Button title="Sign in to sync" onPress={() => router.push('/signin')} />}
        </View>
      </Panel>
    </Screen>
  );
}
