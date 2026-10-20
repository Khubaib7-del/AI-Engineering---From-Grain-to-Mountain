import { useState } from 'react';
import { Linking, Platform, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Button,
  Checkbox,
  Chip,
  Disclosure,
  Icon,
  Label,
  Panel,
  Screen,
  Txt,
  inputStyle,
  usePalette,
  useWide,
} from '../../components/ui';
import { NextStepCard } from '../../components/next-step';
import { findUnit, unitIds, unitWeek } from '../../lib/content';
import {
  bestAttempt,
  canPass,
  emptyUnitWork,
  gradeMcq,
  isPassed,
  mcqOf,
  missingForPass,
  optionOrder,
  MIN_SHORT_ANSWER,
  PASS_MARK,
  shortOf,
  shortPassed,
  shortThreshold,
  stepsDone,
  unitStatus,
  type McqGrade,
} from '../../lib/assess';
import { logActivity } from '../../lib/activity';
import { useLearning } from '../../lib/store';
import { usePath } from '../../lib/use-path';
import type { LearningState, ResourceRef, StepKey, Unit, UnitWork } from '../../lib/types';

const STEPS: { key: StepKey; label: string; icon: string }[] = [
  { key: 'learn', label: 'Learn', icon: 'play-circle-outline' },
  { key: 'read', label: 'Read', icon: 'book-outline' },
  { key: 'practice', label: 'Practice', icon: 'hammer' },
  { key: 'assess', label: 'Assess', icon: 'clipboard' },
];

function ResourceLine({
  resource,
  onOpen,
  cta = 'Open',
}: {
  resource: ResourceRef;
  onOpen: () => void;
  cta?: string;
}) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${cta}: ${resource.title}`}
      onPress={onOpen}
      style={({ pressed }) => ({
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: c.edge,
        backgroundColor: c.raised,
        gap: 6,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Label style={{ flex: 1 }}>
          {resource.type} ·{' '}
          {resource.free === true ? 'free' : resource.free === 'audit' ? 'free to audit' : 'partly free'}
        </Label>
        <Txt size={15} raw weight="600" color={c.accentText}>
          {cta}
        </Txt>
        <Icon name="arrow-up-outline" size={16} color={c.accentText} />
      </View>
      <Txt size={17} weight="600">
        {resource.title}
      </Txt>
      {!!resource.slice && (
        <Txt size={16} color={c.muted}>
          Exactly: {resource.slice}
        </Txt>
      )}
    </Pressable>
  );
}

function Block({
  index,
  title,
  done,
  open,
  onToggle,
  summary,
  children,
}: {
  index: number;
  title: string;
  done: boolean;
  open: boolean;
  onToggle: () => void;
  summary?: string;
  children: React.ReactNode;
}) {
  const c = usePalette();
  return (
    <Panel style={{ gap: open ? 16 : 0, borderColor: open && !done ? c.accent : c.line }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Step ${index}: ${title}${done ? ', done' : ''}`}
        onPress={onToggle}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 44 }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: done ? c.accent : 'transparent',
            borderWidth: done ? 0 : 2,
            borderColor: c.edge,
          }}
        >
          {done ? (
            <Icon name="checkmark" size={17} color={c.onAccent} />
          ) : (
            <Txt size={14} raw mono weight="600">
              {index}
            </Txt>
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={21} weight="600" accessibilityRole="header">
            {title}
          </Txt>
          {!!summary && !open && (
            <Txt size={15} color={c.muted} numberOfLines={1}>
              {summary}
            </Txt>
          )}
        </View>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevron-down" size={20} color={c.muted} />
        </View>
      </Pressable>
      {open && children}
    </Panel>
  );
}

function Quiz({
  unit,
  work,
  locked,
  onAttempt,
}: {
  unit: Unit;
  work: UnitWork;
  locked: boolean;
  onAttempt: (grade: McqGrade, answers: number[]) => void;
}) {
  const c = usePalette();
  const questions = mcqOf(unit.quiz);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [grade, setGrade] = useState<McqGrade>();
  const best = bestAttempt(work);
  if (!questions.length) return null;
  return (
    <View style={{ gap: 18 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <Txt size={16} weight="600">
          Multiple choice · pass at {PASS_MARK * 100}%
        </Txt>
        {best && (
          <Chip
            text={`Best ${best.score}/${best.max}`}
            tone={best.score / best.max >= PASS_MARK ? 'strong' : 'default'}
          />
        )}
      </View>
      {questions.map((q, qi) => {
        const result = grade?.results[qi];
        return (
          <View key={q.id} style={{ gap: 8 }}>
            <Txt size={15} weight="600">
              {qi + 1}. {q.prompt}
            </Txt>
            {optionOrder(q.id, q.options.length).map(oi => {
              const opt = q.options[oi];
              const chosen = answers[qi] === oi;
              const isAnswer = !!grade && oi === q.answer;
              const wrongPick = !!grade && chosen && oi !== q.answer;
              return (
                <Pressable
                  key={oi}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: chosen, disabled: !!grade }}
                  disabled={!!grade || locked}
                  onPress={() =>
                    setAnswers(a => {
                      const n = [...a];
                      n[qi] = oi;
                      return n;
                    })
                  }
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    minHeight: 46,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: chosen || isAnswer ? 1.5 : 1,
                    borderColor: isAnswer ? c.accent : wrongPick ? c.danger : chosen ? c.accent : c.edge,
                    backgroundColor: chosen ? c.accentSoft : c.surface,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 1.5,
                      borderColor: chosen ? c.accentText : c.edge,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {chosen && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.accentText }} />
                    )}
                  </View>
                  <Txt size={15} style={{ flex: 1 }}>
                    {opt}
                  </Txt>
                  {isAnswer && <Icon name="checkmark" size={16} />}
                  {wrongPick && <Icon name="close" size={16} color={c.danger} />}
                </Pressable>
              );
            })}
            {result && (
              <Txt size={14} color={result.correct ? c.muted : c.ink}>
                {result.correct ? 'Correct. ' : 'Not quite. '}
                {result.explain}
              </Txt>
            )}
          </View>
        );
      })}
      {grade ? (
        <View style={{ gap: 12, padding: 16, borderRadius: 14, backgroundColor: c.soft }}>
          <Txt size={17} weight="700">
            {grade.score}/{grade.max} · {Math.round(grade.pct * 100)}% —{' '}
            {grade.passed ? 'passed' : `you need ${PASS_MARK * 100}%`}
          </Txt>
          {!grade.passed && (
            <Txt size={14} color={c.muted}>
              Re-watch the parts of the Learn step behind the questions you missed, then try again.
            </Txt>
          )}
          <Button
            title="Retake quiz"
            secondary
            icon="refresh"
            onPress={() => {
              setGrade(undefined);
              setAnswers([]);
            }}
          />
        </View>
      ) : (
        <Button
          title="Submit answers"
          disabled={locked || answers.filter(a => a !== undefined).length < questions.length}
          onPress={() => {
            const g = gradeMcq(questions, answers);
            setGrade(g);
            onAttempt(
              g,
              answers.map(a => a ?? -1),
            );
          }}
        />
      )}
    </View>
  );
}

function ShortAnswer({
  q,
  saved,
  locked,
  onSave,
}: {
  q: Extract<Unit['quiz'][number], { kind: 'short' }>;
  saved?: { text: string; checks: boolean[] };
  locked: boolean;
  onSave: (text: string, checks: boolean[]) => void;
}) {
  const c = usePalette();
  const [text, setText] = useState(saved?.text ?? '');
  const [checks, setChecks] = useState<boolean[]>(saved?.checks ?? q.rubric.map(() => false));
  const [reveal, setReveal] = useState(!!saved);
  const passed = shortPassed(q, saved);
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Txt size={15} weight="600" style={{ flex: 1 }}>
          {q.prompt}
        </Txt>
        {passed && <Chip text="Self-checked" tone="strong" icon="checkmark" />}
      </View>
      <TextInput
        accessibilityLabel={`Answer: ${q.prompt}`}
        multiline
        editable={!locked}
        value={text}
        onChangeText={setText}
        placeholder="Write your answer first, in your own words…"
        placeholderTextColor={c.faint}
        style={[inputStyle(c), { minHeight: 110, textAlignVertical: 'top' }]}
      />
      {!reveal ? (
        <Button
          title="Check against the rubric"
          secondary
          disabled={locked || text.trim().length < MIN_SHORT_ANSWER}
          onPress={() => setReveal(true)}
        />
      ) : (
        <View style={{ gap: 4, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: c.line }}>
          <Txt size={13} weight="600" color={c.muted}>
            Tick each point your answer really covers ({shortThreshold(q.rubric)} of {q.rubric.length} to
            pass)
          </Txt>
          {q.rubric.map((r, i) => (
            <Checkbox
              key={i}
              label={r}
              checked={!!checks[i]}
              disabled={locked}
              onPress={() => setChecks(cs => cs.map((v, j) => (j === i ? !v : v)))}
            />
          ))}
          <Button
            title="Save answer"
            disabled={locked || text.trim().length < MIN_SHORT_ANSWER}
            onPress={() => onSave(text, checks)}
          />
        </View>
      )}
    </View>
  );
}

export default function UnitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = usePalette();
  const wide = useWide();
  const { state, update, showToast } = useLearning();
  const path = usePath();
  const found = findUnit(id);
  const savedEvidence = state.units?.[id]?.evidence ?? '';
  const [evidence, setEvidence] = useState({ id, value: savedEvidence });
  if (evidence.id !== id) setEvidence({ id, value: savedEvidence });
  const [openSteps, setOpenSteps] = useState<{ id: string; keys: StepKey[] | null }>({ id, keys: null });
  if (openSteps.id !== id) setOpenSteps({ id, keys: null });

  if (!found)
    return <Screen back title="Unit not found" subtitle="This unit is not in the current curriculum." />;
  const { unit, module } = found;
  const work = state.units?.[id] ?? emptyUnitWork();
  const status = unitStatus(unit, state, unitIds);
  const locked = status === 'locked';
  const done = stepsDone(unit, state);
  const missingPrereqs = unit.prerequisites.filter(p => unitIds.has(p) && !isPassed(p, state));
  const sub = module.submodules.find(s => s.units.some(u => u.id === id));
  const index = path.units.findIndex(u => u.unit.id === id);
  const next = index >= 0 ? path.units[index + 1] : undefined;
  const testedOut = !!state.profile?.testedOut.includes(id);

  const open = (url: string) =>
    void Linking.openURL(url).catch(() => showToast('Could not open the link. Check your connection.'));

  /** Apply a change to this unit's work, log it, and pass the unit when everything is in. */
  const change = async (
    fn: (w: UnitWork) => UnitWork,
    event?: { kind: 'step' | 'practice' | 'quiz' | 'topic'; id?: string; score?: number },
    message?: string,
  ) => {
    let passedNow = false;
    const ok = await update(s => {
      const before = s.units?.[id] ?? emptyUnitWork();
      let nextWork = fn(before);
      let nextState: LearningState = { ...s, units: { ...(s.units ?? {}), [id]: nextWork } };
      if (event)
        nextState = logActivity(nextState, { kind: event.kind, id: event.id ?? id, score: event.score });
      if (!nextWork.passedAt && unitStatus(unit, s, unitIds) !== 'locked' && canPass(unit, nextWork)) {
        nextWork = {
          ...nextWork,
          passedAt: new Date().toISOString(),
          steps: { ...nextWork.steps, assess: nextWork.steps.assess ?? new Date().toISOString() },
        };
        nextState = logActivity(
          { ...nextState, units: { ...(nextState.units ?? {}), [id]: nextWork } },
          { kind: 'unit', id },
        );
        passedNow = true;
      }
      return nextState;
    });
    if (!ok) return;
    if (passedNow) {
      showToast(
        `Unit passed ✓ ${next ? `Next: ${next.unit.title}` : ''}`,
        next ? { label: 'Open', run: () => router.push(`/unit/${next.unit.id}`) } : undefined,
      );
      if (Platform.OS !== 'web')
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (message) showToast(message);
  };

  const markStep = (key: StepKey, label: string) =>
    change(
      w => ({ ...w, steps: { ...w.steps, [key]: w.steps[key] ?? new Date().toISOString() } }),
      { kind: 'step', id: `${id}:${key}` },
      `${label} marked done.`,
    );

  const topicsDone = unit.topics.filter(t => state.topics[t.id]).length;
  const stepList = STEPS.filter(st => st.key !== 'read' || !!unit.read);
  const firstOpen = stepList.find(st => !done[st.key]);
  const nextStep = firstOpen
    ? {
        index: stepList.indexOf(firstOpen) + 1,
        ...(firstOpen.key === 'learn'
          ? {
              title: `Watch: ${unit.learn.title}`,
              detail: unit.learn.slice
                ? `Exactly: ${unit.learn.slice}`
                : 'Open the lesson, then mark it done below.',
              action: 'Open the lesson',
              run: () => {
                setOpenSteps({ id, keys: ['learn'] });
                open(unit.learn.url);
              },
            }
          : firstOpen.key === 'read'
            ? {
                title: `Read: ${unit.read!.title}`,
                detail: unit.read!.slice
                  ? `Exactly: ${unit.read!.slice}`
                  : 'Open the reading, then mark it done below.',
                action: 'Open the reading',
                run: () => {
                  setOpenSteps({ id, keys: ['read'] });
                  open(unit.read!.url);
                },
              }
            : firstOpen.key === 'practice'
              ? {
                  title: `Build: ${unit.practice.title}`,
                  detail: `Done when: ${unit.practice.done_when}`,
                  action: 'Start the practice',
                  run: () => setOpenSteps({ id, keys: ['practice'] }),
                }
              : {
                  title: 'Prove it: take the quiz',
                  detail: `${mcqOf(unit.quiz).length} questions, ${PASS_MARK * 100}% to pass${shortOf(unit.quiz).length ? ', plus a short answer' : ''}.`,
                  action: 'Take the quiz',
                  run: () => setOpenSteps({ id, keys: ['assess'] }),
                }),
      }
    : undefined;
  const isOpen = (k: StepKey) => (openSteps.keys ? openSteps.keys.includes(k) : firstOpen?.key === k);
  const toggle = (k: StepKey) => {
    const cur = openSteps.keys ?? (firstOpen ? [firstOpen.key] : []);
    setOpenSteps({ id, keys: cur.includes(k) ? cur.filter(x => x !== k) : [...cur, k] });
  };
  const isLink = /^https?:\/\//.test(evidence.value.trim());
  const isGithub = /github\.com\//.test(evidence.value);

  return (
    <Screen back docTitle={unit.title} width={880}>
      <View style={{ gap: 10 }}>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push(`/module/${module.id}`)}
          style={{ alignSelf: 'flex-start', minHeight: 32, justifyContent: 'center' }}
        >
          <Label color={c.accentText}>
            {module.id} · {module.title}
            {sub ? ` · ${sub.title}` : ''}
          </Label>
        </Pressable>
        <Txt size={wide ? 38 : 30} weight="600" accessibilityRole="header">
          {unit.title}
        </Txt>
        <Label color={c.ink}>
          {[
            status === 'passed'
              ? testedOut
                ? 'Tested out ✓'
                : 'Done ✓'
              : status === 'in-progress'
                ? 'In progress'
                : status === 'available'
                  ? 'Ready'
                  : 'Locked',
            `${unit.hours} h`,
            unit.depth === 'core' ? 'Core' : 'Deep dive',
            unitWeek.get(unit.id) ? `Week ${unitWeek.get(unit.id)}` : '',
          ]
            .filter(Boolean)
            .join(' · ')}
        </Label>
      </View>

      {nextStep && status !== 'passed' && (
        <NextStepCard
          kicker={`Step ${nextStep.index} of ${stepList.length}`}
          title={nextStep.title}
          detail={nextStep.detail}
          steps={stepList.map(s => ({ label: s.label, done: done[s.key] }))}
          action={nextStep.action}
          onAction={nextStep.run}
        />
      )}
      {status === 'passed' && (
        <NextStepCard
          kicker="Unit done"
          title={next ? `Next: ${next.unit.title}` : `Module capstone: ${module.capstone.title}`}
          detail={next ? `${next.module.id} · ${next.unit.hours} h` : 'Prove the module with one project.'}
          steps={stepList.map(s => ({ label: s.label, done: done[s.key] }))}
          action={next ? 'Open next unit' : 'Open capstone'}
          onAction={() => router.push(next ? `/unit/${next.unit.id}` : `/module/${module.id}`)}
        />
      )}

      {locked && (
        <View
          style={{
            padding: 16,
            borderRadius: 14,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: c.edge,
            backgroundColor: c.surface,
            gap: 10,
          }}
        >
          <Txt weight="600">
            Locked until you pass{' '}
            {missingPrereqs.length === 1 ? 'one earlier unit' : `${missingPrereqs.length} earlier units`}
          </Txt>
          <Txt size={16} color={c.muted}>
            You can read ahead and practise; the assessment opens once these are passed.
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {missingPrereqs.map(p => (
              <Button
                key={p}
                compact
                secondary
                title={`${p} · ${findUnit(p)?.unit.title ?? ''}`}
                onPress={() => router.push(`/unit/${p}`)}
              />
            ))}
          </View>
        </View>
      )}

      {!!unit.outcomes.length && (
        <View style={{ borderBottomWidth: 1, borderColor: c.line }}>
          <Disclosure title="What you will be able to do" hint={`${unit.outcomes.length} outcomes`}>
            {unit.outcomes.map(o => (
              <View key={o} style={{ flexDirection: 'row', gap: 10 }}>
                <Icon name="target" size={18} color={c.accentText} />
                <Txt style={{ flex: 1 }}>{o.replace(/^You can /, '')}</Txt>
              </View>
            ))}
          </Disclosure>
        </View>
      )}

      <Block
        index={1}
        title="Learn"
        done={done.learn}
        open={isOpen('learn')}
        onToggle={() => toggle('learn')}
        summary={unit.learn.title}
      >
        <ResourceLine resource={unit.learn} onOpen={() => open(unit.learn.url)} cta="Open lesson" />
        {(!!unit.covers.length || !!unit.gaps?.length || !!unit.topics.length) && (
          <View style={{ borderBottomWidth: 1, borderColor: c.line }}>
            {!!unit.covers.length && (
              <Disclosure title="What this lesson covers" hint={`${unit.covers.length} ideas`}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {unit.covers.map(x => (
                    <Chip key={x} text={x} />
                  ))}
                </View>
              </Disclosure>
            )}
            {!!unit.gaps?.length && (
              <Disclosure
                title="Fill-ins the lecture skips"
                hint={`${unit.gaps.length} short extra reading${unit.gaps.length > 1 ? 's' : ''}`}
              >
                {unit.gaps.map(g => (
                  <Pressable
                    key={g.topic}
                    accessibilityRole="link"
                    onPress={() => open(g.resource.url)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      gap: 10,
                      alignItems: 'center',
                      minHeight: 44,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <Icon name="link" size={16} color={c.accentText} />
                    <Txt size={16} style={{ flex: 1 }}>
                      <Txt size={16} weight="600">
                        {g.topic}
                      </Txt>
                      {': '}
                      {g.resource.title}
                    </Txt>
                    <Icon name="arrow-up-outline" size={14} color={c.muted} />
                  </Pressable>
                ))}
              </Disclosure>
            )}
            {!!unit.topics.length && (
              <Disclosure
                title="Your notes checklist"
                hint={`${topicsDone} of ${unit.topics.length} topics ticked`}
              >
                {unit.topics.map(t => (
                  <Checkbox
                    key={t.id}
                    label={t.title}
                    checked={!!state.topics[t.id]}
                    onPress={() => {
                      const value = !state.topics[t.id];
                      void update(s =>
                        logActivity(
                          { ...s, topics: { ...s.topics, [t.id]: value } },
                          { kind: 'topic', id: t.id },
                        ),
                      ).then(
                        ok =>
                          ok &&
                          showToast(
                            value
                              ? `Saved · ${topicsDone + 1}/${unit.topics.length} topics`
                              : 'Topic unticked.',
                          ),
                      );
                    }}
                  />
                ))}
              </Disclosure>
            )}
          </View>
        )}
        {!!unit.backup && (
          <Txt size={13} color={c.muted}>
            Prefer another explanation?{' '}
            <Txt size={13} weight="600" accessibilityRole="link" onPress={() => open(unit.backup!.url)}>
              {unit.backup.title}
            </Txt>
          </Txt>
        )}
        {!work.steps.learn && !done.learn && (
          <Button
            title="I finished the lesson"
            secondary
            icon="checkmark"
            onPress={() => void markStep('learn', 'Learn')}
          />
        )}
      </Block>

      {unit.read && (
        <Block
          index={2}
          title="Read"
          done={done.read}
          open={isOpen('read')}
          onToggle={() => toggle('read')}
          summary={unit.read.title}
        >
          <ResourceLine resource={unit.read} onOpen={() => open(unit.read!.url)} cta="Open reading" />
          {!work.steps.read && !done.read && (
            <Button
              title="I did the reading"
              secondary
              icon="checkmark"
              onPress={() => void markStep('read', 'Read')}
            />
          )}
        </Block>
      )}

      <Block
        index={unit.read ? 3 : 2}
        title="Practice"
        done={done.practice}
        open={isOpen('practice')}
        onToggle={() => toggle('practice')}
        summary={unit.practice.title}
      >
        <Txt size={16} weight="600">
          {unit.practice.title}
        </Txt>
        <Txt>{unit.practice.brief}</Txt>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            padding: 14,
            borderRadius: 14,
            backgroundColor: c.accentSoft,
          }}
        >
          <Icon name="flag" size={18} color={c.accentText} />
          <Txt size={14} style={{ flex: 1 }}>
            <Txt size={14} weight="700">
              Done when:{' '}
            </Txt>
            {unit.practice.done_when}
          </Txt>
        </View>
        {!!unit.practice.autograder && (
          <Txt size={13} color={c.muted}>
            Autograder:{' '}
            <Txt
              size={13}
              style={{ fontFamily: Platform.OS === 'web' ? 'ui-monospace, Menlo, monospace' : 'monospace' }}
            >
              {unit.practice.autograder}
            </Txt>
          </Txt>
        )}
        <Txt size={14} weight="600">
          Your evidence
        </Txt>
        <TextInput
          accessibilityLabel="Practice evidence"
          multiline
          value={evidence.value}
          onChangeText={value => setEvidence({ id, value })}
          placeholder="Paste a GitHub link, a URL, or describe what you built and what happened…"
          placeholderTextColor={c.faint}
          maxLength={20000}
          style={[inputStyle(c), { minHeight: 110, textAlignVertical: 'top' }]}
        />
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            title={evidence.value === savedEvidence && savedEvidence ? 'Evidence saved' : 'Save evidence'}
            disabled={evidence.value.trim().length < 8 || evidence.value === savedEvidence}
            onPress={() =>
              void change(
                w => ({
                  ...w,
                  evidence: evidence.value,
                  steps: { ...w.steps, practice: w.steps.practice ?? new Date().toISOString() },
                }),
                { kind: 'practice' },
                'Practice evidence saved.',
              )
            }
          />
          {isGithub ? (
            <Chip text="GitHub link" icon="git" />
          ) : isLink ? (
            <Chip text="Link" icon="link" />
          ) : null}
        </View>
      </Block>

      <Block
        index={unit.read ? 4 : 3}
        title="Assess"
        done={done.assess}
        open={isOpen('assess')}
        onToggle={() => toggle('assess')}
        summary={`Quiz · ${PASS_MARK * 100}% to pass`}
      >
        {testedOut && (
          <Txt color={c.muted}>
            You tested out of this unit in the placement check. Take the quiz any time to confirm.
          </Txt>
        )}
        <Quiz
          unit={unit}
          work={work}
          locked={locked}
          onAttempt={(g, answers) =>
            void change(
              w => ({
                ...w,
                attempts: [
                  ...w.attempts,
                  { at: new Date().toISOString(), score: g.score, max: g.max, answers },
                ],
              }),
              { kind: 'quiz', score: g.pct },
              g.passed ? 'Quiz passed.' : 'Attempt saved. Review and retake when ready.',
            )
          }
        />
        {shortOf(unit.quiz).map(q => (
          <ShortAnswer
            key={q.id}
            q={q}
            saved={work.short[q.id]}
            locked={locked}
            onSave={(text, checks) =>
              void change(
                w => ({
                  ...w,
                  short: { ...w.short, [q.id]: { text, checks, at: new Date().toISOString() } },
                }),
                { kind: 'quiz', id: `${id}:${q.id}` },
                shortPassed(q, { text, checks })
                  ? 'Answer saved and self-checked.'
                  : `Answer saved. Tick at least ${shortThreshold(q.rubric)} rubric points you genuinely covered to pass.`,
              )
            }
          />
        ))}
        {status !== 'passed' && (
          <View style={{ gap: 6, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: c.line }}>
            <Txt size={14} weight="600">
              To pass this unit
            </Txt>
            {(locked
              ? ['Pass the earlier units first.', ...missingForPass(unit, work)]
              : missingForPass(unit, work)
            ).map(m => (
              <Txt key={m} size={14} color={c.muted}>
                · {m}
              </Txt>
            ))}
          </View>
        )}
      </Block>
    </Screen>
  );
}
