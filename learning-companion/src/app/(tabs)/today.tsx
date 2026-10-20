import { Platform, View } from 'react-native';
import { router } from 'expo-router';
import {
  Button,
  Chip,
  Icon,
  Meter,
  Panel,
  Row,
  Screen,
  Section,
  Split,
  Txt,
  usePalette,
  useWide,
} from '../../components/ui';
import { findUnit, lessons, unitIds, weeks } from '../../lib/content';
import { isPassed, stepFraction, unitStatus } from '../../lib/assess';
import { availableLesson, reviewDue } from '../../lib/planner';
import { streaks } from '../../lib/activity';
import { useLearning } from '../../lib/store';
import { usePath } from '../../lib/use-path';
import { TRACK_LABEL } from '../../lib/path';

const STATUS_ICON: Record<string, string> = {
  passed: 'checkmark-circle',
  'in-progress': 'timer',
  available: 'ellipse-outline',
  locked: 'circle-dashed',
};

function SetupCard() {
  const c = usePalette();
  return (
    <Panel style={{ borderColor: c.signal }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Icon name="route" color={c.signal} />
        <Txt size={18} weight="700" style={{ flex: 1 }}>
          Personalise your path
        </Txt>
      </View>
      <Txt color={c.muted}>
        Pick your role, your starting point and your weekly hours. It takes about a minute and you can change
        it any time.
      </Txt>
      <Button title="Set up my path" icon="arrow-forward" onPress={() => router.push('/start')} />
    </Panel>
  );
}

function LegacyToday() {
  const c = usePalette();
  const { state } = useLearning();
  const lesson = availableLesson(lessons, state);
  const done = lessons.filter(l => state.lessons[l.id]?.completedAt).length;
  const start = Math.min(done, lessons.length - 3);
  return (
    <>
      <Panel>
        <Txt size={13} weight="600" color={c.muted}>
          {lesson ? `Guided day ${lesson.day} of ${lessons.length}` : 'Guided days complete'}
        </Txt>
        <Txt size={26} weight="700">
          {lesson?.title ?? 'Continue on the map'}
        </Txt>
        {lesson && <Txt color={c.muted}>{lesson.estimatedMinutes} minutes · Watch, build, recall</Txt>}
        <Button
          title={lesson ? 'Open lesson' : 'Open the map'}
          testID="open-lesson"
          icon="arrow-forward"
          onPress={() => (lesson ? router.push(`/session/${lesson.id}`) : router.navigate('/map'))}
        />
      </Panel>
      <Panel>
        <Section title="Up next" aside={`${done}/${lessons.length} done`} />
        {lessons.slice(start, start + 3).map((l, i) => (
          <Row
            key={l.id}
            title={l.title}
            leading={`D${String(l.day).padStart(2, '0')}`}
            subtitle={`${l.estimatedMinutes} min · ${state.lessons[l.id]?.completedAt ? 'Done' : 'Watch / Build / Recall'}`}
            onPress={() => router.push(`/session/${l.id}`)}
            last={i === 2}
          />
        ))}
      </Panel>
    </>
  );
}

export default function Today() {
  const c = usePalette();
  const wide = useWide();
  const { state } = useLearning();
  const path = usePath();
  const onboarded = !!state.profile?.onboarded;
  const current = path.current;
  const week = path.week;
  const sortedWeeks = [...weeks].sort((a, b) => a.week - b.week);
  const upcoming = week ? sortedWeeks.filter(w => w.week > week.week).slice(0, 3) : [];
  const due = lessons.filter(l => state.lessons[l.id]?.completedAt && reviewDue(state.lessons[l.id])).length;
  const streak = streaks(state.activity).current;
  const weekUnits = (week?.units ?? [])
    .map(id => findUnit(id))
    .filter((u): u is NonNullable<typeof u> => !!u);
  const weekPassed = weekUnits.filter(u => isPassed(u.unit.id, state)).length;
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen
      title="Today"
      eyebrow={dateLabel}
      docTitle="Today"
      subtitle={
        onboarded
          ? `${TRACK_LABEL[state.profile!.track]} · ${state.profile!.hoursPerWeek} h a week${streak ? ` · ${streak}-day streak` : ''}`
          : undefined
      }
    >
      {!onboarded && <SetupCard />}
      {!path.hasV2 || !weeks.length ? (
        <LegacyToday />
      ) : (
        <>
          {current ? (
            <Panel style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip text="Continue" tone="signal" icon="footprints" />
                <Txt size={13} color={c.muted}>
                  {current.module.id} · {current.module.title}
                </Txt>
              </View>
              <Txt size={wide ? 32 : 26} weight="700">
                {current.unit.title}
              </Txt>
              <Txt color={c.muted}>
                {current.unit.learn.slice
                  ? `${current.unit.learn.title} — ${current.unit.learn.slice}`
                  : current.unit.learn.title}
              </Txt>
              <Meter value={current.progress} label="Steps done in this unit" />
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  title={current.progress > 0 ? 'Continue unit' : 'Start unit'}
                  testID="open-lesson"
                  icon="arrow-forward"
                  onPress={() => router.push(`/unit/${current.unit.id}`)}
                />
                <Txt size={13} color={c.muted}>
                  {Math.round(current.progress * 100)}% · about {current.unit.hours} h
                </Txt>
              </View>
            </Panel>
          ) : (
            <Panel>
              <Txt size={24} weight="700">
                Every unit on your path is passed.
              </Txt>
              <Txt color={c.muted}>
                Finish any remaining capstones on the map, or switch role in Settings to explore another
                branch.
              </Txt>
              <Button title="Open the map" icon="arrow-forward" onPress={() => router.navigate('/map')} />
            </Panel>
          )}
          <Split>
            <Panel style={{ flex: 1.4 }}>
              <Section
                title={week ? `Week ${week.week}` : 'This week'}
                aside={`${weekPassed}/${weekUnits.length} passed`}
              />
              {!!week && (
                <Txt size={16} weight="600">
                  {week.title}
                </Txt>
              )}
              <Txt size={13} color={c.muted}>
                Planned {week?.hours ?? 0} h · your goal {path.hoursPerWeek} h/week
                {week && week.hours > path.hoursPerWeek ? ' — this week may stretch over two' : ''}
              </Txt>
              {weekUnits.map(({ unit, module }, i) => {
                const st = unitStatus(unit, state, unitIds);
                return (
                  <Row
                    key={unit.id}
                    title={unit.title}
                    subtitle={`${module.id} · ${unit.hours} h · ${st === 'in-progress' ? `${Math.round(stepFraction(unit, state) * 100)}% done` : st.replace('-', ' ')}`}
                    leading={
                      <Icon name={STATUS_ICON[st]} size={20} color={st === 'locked' ? c.faint : c.ink} />
                    }
                    onPress={() => router.push(`/unit/${unit.id}`)}
                    last={i === weekUnits.length - 1}
                  />
                );
              })}
            </Panel>
            <Panel style={{ flex: 1 }}>
              <Section title="Coming up" />
              {upcoming.length ? (
                upcoming.map((w, i) => (
                  <View
                    key={w.week}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: i === upcoming.length - 1 ? 0 : 1,
                      borderColor: c.line,
                      gap: 2,
                    }}
                  >
                    <Txt size={12} weight="700" color={c.muted}>
                      WEEK {w.week} · {w.hours} H
                    </Txt>
                    <Txt size={15} weight="500">
                      {w.title}
                    </Txt>
                  </View>
                ))
              ) : (
                <Txt size={14} color={c.muted}>
                  This is the last planned week.
                </Txt>
              )}
              <Txt size={13} color={c.muted}>
                Projected finish at {path.hoursPerWeek} h/week:{' '}
                {path.finish.date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </Txt>
            </Panel>
          </Split>
        </>
      )}
      {due > 0 && (
        <Row
          title={`${due} review${due > 1 ? 's' : ''} due`}
          subtitle="Explain a past lesson without notes"
          leading={<Icon name="refresh" />}
          onPress={() => router.navigate('/progress')}
        />
      )}
      {Platform.OS !== 'web' && (
        <Row
          title="Study reminders"
          subtitle="Pick times that fit your day"
          leading={<Icon name="notifications-outline" />}
          onPress={() => router.push('/settings')}
          last
        />
      )}
    </Screen>
  );
}
