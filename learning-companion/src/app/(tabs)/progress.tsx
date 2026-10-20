import { Share, View } from 'react-native';
import { router } from 'expo-router';
import {
  Button,
  Disclosure,
  Grid,
  Icon,
  Label,
  Panel,
  Row,
  Screen,
  Section,
  Txt,
  isWeb,
  usePalette,
} from '../../components/ui';
import { NextStepCard } from '../../components/next-step';
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
    <Panel style={{ gap: 8, minHeight: 150 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={18} color={c.accentText} />
        <Label>{label}</Label>
      </View>
      <Txt size={34} weight="600" mono={c.mode === 'terminal'}>
        {value}
      </Txt>
      {!!hint && (
        <Txt size={15} color={c.muted}>
          {hint}
        </Txt>
      )}
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
      {due.length ? (
        <NextStepCard
          kicker="Next"
          meta={`${due.length} review${due.length > 1 ? 's' : ''} due`}
          title={`Review: ${due[0].title}`}
          detail="Explain it without your notes. Reviews come back after 1, 3, 7 and 14 days."
          action="Start review"
          onAction={() => router.push(`/session/${due[0].id}?review=1`)}
        />
      ) : path.current ? (
        <NextStepCard
          kicker="Next"
          meta={`${path.passed} of ${path.units.length} units done · ${path.hoursLeft} core hours left`}
          title={path.current.unit.title}
          detail="Keep the streak going with one step today."
          action="Continue"
          onAction={() => router.push(`/unit/${path.current!.unit.id}`)}
        />
      ) : null}
      <Grid min={150}>
        <Stat
          icon="flame"
          value={`${streak.current} day${streak.current === 1 ? '' : 's'}`}
          label="Streak"
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
        <Txt size={15} color={c.muted}>
          Every ticked topic, saved practice, quiz attempt and passed unit is logged with its time.
        </Txt>
      </Panel>

      <Panel style={{ gap: 0, paddingVertical: 8 }}>
        <Disclosure
          first
          title="Field notes"
          hint={`${notes.length + complete.length} pieces of practice evidence`}
        >
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
        </Disclosure>
        <Disclosure
          title="Reviews and recent passes"
          hint={due.length ? `${due.length} due now` : 'All caught up'}
        >
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
            <Label style={{ paddingTop: 12 }}>Recently passed</Label>
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
        </Disclosure>
      </Panel>

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
