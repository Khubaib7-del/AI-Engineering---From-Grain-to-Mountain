import { Platform, View } from 'react-native';
import { router } from 'expo-router';
import { NextStepCard } from '../../components/next-step';
import { Station } from '../../components/route-board';
import { Button, Disclosure, Icon, Label, Panel, Row, Screen, Txt, usePalette } from '../../components/ui';
import { findUnit, lessons, unitIds, weeks } from '../../lib/content';
import { isPassed, stepFraction, stepsDone, unitStatus } from '../../lib/assess';
import { availableLesson, reviewDue } from '../../lib/planner';
import { streaks } from '../../lib/activity';
import { useLearning } from '../../lib/store';
import { usePath } from '../../lib/use-path';
import { TRACK_LABEL, weekHoursLeft, weekLabel } from '../../lib/path';

const STATUS_TEXT: Record<string, string> = {
  passed: 'Done',
  'in-progress': 'In progress',
  available: 'Ready',
  locked: 'Locked',
};

function LegacyToday() {
  const c = usePalette();
  const { state } = useLearning();
  const lesson = availableLesson(lessons, state);
  const done = lessons.filter(l => state.lessons[l.id]?.completedAt).length;
  const start = Math.min(done, lessons.length - 3);
  return (
    <>
      <NextStepCard
        kicker="Now"
        meta={lesson ? `Guided day ${lesson.day} of ${lessons.length}` : 'Guided days complete'}
        title={lesson?.title ?? 'Continue on the map'}
        detail={lesson ? `${lesson.estimatedMinutes} minutes · watch, build, recall` : undefined}
        action={lesson ? 'Open lesson' : 'Open the map'}
        testID="open-lesson"
        onAction={() => (lesson ? router.push(`/session/${lesson.id}`) : router.navigate('/map'))}
      />
      <Panel>
        <Disclosure title="Up next" hint={`${done} of ${lessons.length} guided days done`}>
          {lessons.slice(start, start + 3).map((l, i) => (
            <Row
              key={l.id}
              title={l.title}
              leading={`D${String(l.day).padStart(2, '0')}`}
              subtitle={`${l.estimatedMinutes} min · ${state.lessons[l.id]?.completedAt ? 'Done' : 'Watch, build, recall'}`}
              onPress={() => router.push(`/session/${l.id}`)}
              last={i === 2}
            />
          ))}
        </Disclosure>
      </Panel>
      <Txt size={15} color={c.muted}>
        Guided days come from the first curriculum.
      </Txt>
    </>
  );
}

export default function Today() {
  const c = usePalette();
  const { state } = useLearning();
  const path = usePath();
  const onboarded = !!state.profile?.onboarded;
  const current = path.today;
  const week = path.week;
  const sortedWeeks = [...weeks].sort((a, b) => a.week - b.week);
  const upcoming = week ? sortedWeeks.filter(w => w.week > week.week).slice(0, 3) : [];
  const due = lessons.filter(l => state.lessons[l.id]?.completedAt && reviewDue(state.lessons[l.id])).length;
  const streak = streaks(state.activity).current;
  const weekUnits = (week?.units ?? [])
    .map(id => findUnit(id))
    .filter((u): u is NonNullable<typeof u> => !!u);
  const weekPassed = weekUnits.filter(u => isPassed(u.unit.id, state)).length;
  const hoursLeft = weekHoursLeft(
    week,
    id => findUnit(id)?.unit.hours,
    state,
    id => {
      const u = findUnit(id)?.unit;
      return u ? stepFraction(u, state) : 0;
    },
  );
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const done = current ? stepsDone(current.unit, state) : undefined;

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
      {!onboarded ? (
        <NextStepCard
          kicker="Start here"
          meta="About a minute"
          title="Set up your path"
          detail="Pick your role, your starting point and your weekly hours. You can change any of it later."
          action="Set up my path"
          ask={false}
          onAction={() => router.push('/start')}
        />
      ) : null}
      {!path.hasV2 || !weeks.length ? (
        <LegacyToday />
      ) : (
        <>
          {current ? (
            <NextStepCard
              kicker={current.status === 'in-progress' ? 'Continue' : 'Now'}
              meta={week ? weekLabel(week.week, sortedWeeks.length, hoursLeft) : undefined}
              title={current.unit.title}
              detail={`${current.module.id} · ${current.unit.learn.slice ? `${current.unit.learn.title}: ${current.unit.learn.slice}` : current.unit.learn.title}`}
              steps={
                done
                  ? [
                      { label: 'Learn', done: done.learn },
                      { label: 'Read', done: done.read },
                      { label: 'Practice', done: done.practice },
                      { label: 'Assess', done: done.assess },
                    ]
                  : undefined
              }
              action={current.status === 'in-progress' ? 'Continue unit' : 'Start unit'}
              testID="open-lesson"
              onAction={() => router.push(`/unit/${current.unit.id}`)}
            />
          ) : (
            <NextStepCard
              kicker="Summit"
              title="Every unit on your path is done."
              detail="Finish any remaining capstones on the map, or switch role in Settings to explore another branch."
              action="Open the map"
              onAction={() => router.navigate('/map')}
            />
          )}

          <Panel style={{ gap: 0, paddingVertical: 8 }}>
            <Disclosure
              testID="week-plan"
              title={week ? `This week: ${week.title}` : 'This week'}
              hint={`${weekPassed} of ${weekUnits.length} units done · planned ${week?.hours ?? 0} h, your goal ${path.hoursPerWeek} h`}
            >
              {weekUnits.map(({ unit, module }, i) => {
                const st = unitStatus(unit, state, unitIds);
                const alloc = week?.allocation?.[unit.id];
                return (
                  <Row
                    key={unit.id}
                    title={unit.title}
                    subtitle={`${module.id} · ${alloc != null && alloc !== unit.hours ? `${alloc} of ${unit.hours} h this week` : `${unit.hours} h`} · ${st === 'in-progress' ? `${Math.round(stepFraction(unit, state) * 100)}% done` : STATUS_TEXT[st]}`}
                    leading={
                      <Station
                        node={{ status: st, kind: 'unit' }}
                        size={30}
                        current={unit.id === current?.unit.id}
                      />
                    }
                    onPress={() => router.push(`/unit/${unit.id}`)}
                    last={i === weekUnits.length - 1}
                  />
                );
              })}
              {!!week?.detail?.length && (
                <Disclosure title="Day by day" hint="A suggested rhythm for the week">
                  {week.detail.map((line, i) => {
                    const m = /^(Day \d+)(?: \(([^)]*)\))?:\s*(.*)$/.exec(line);
                    return (
                      <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                        <Label style={{ width: 56, paddingTop: 3 }}>{m ? m[1] : '·'}</Label>
                        <Txt size={16} color={c.muted} style={{ flex: 1 }}>
                          {m ? (m[2] ? `${m[2][0].toUpperCase()}${m[2].slice(1)}: ${m[3]}` : m[3]) : line}
                        </Txt>
                      </View>
                    );
                  })}
                </Disclosure>
              )}
              {week?.provisional && (
                <Txt size={15} color={c.muted}>
                  This week is an outline grouped from the unit order. Each unit page has the exact lecture
                  slice and practice.
                </Txt>
              )}
            </Disclosure>
            <Disclosure
              title="Coming up"
              hint={`Projected finish at ${path.hoursPerWeek} h a week: ${path.finish.date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`}
            >
              {upcoming.length ? (
                upcoming.map(w => (
                  <View key={w.week} style={{ gap: 2, paddingVertical: 6 }}>
                    <Label>
                      Week {w.week} · {w.hours} h
                    </Label>
                    <Txt size={16} weight="500">
                      {w.title}
                    </Txt>
                  </View>
                ))
              ) : (
                <Txt size={16} color={c.muted}>
                  This is the last planned week.
                </Txt>
              )}
            </Disclosure>
          </Panel>
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
        <Button
          title="Set study reminders"
          secondary
          icon="notifications-outline"
          onPress={() => router.push('/settings')}
        />
      )}
    </Screen>
  );
}
