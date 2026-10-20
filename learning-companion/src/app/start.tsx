import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { Button, Chip, Icon, Panel, Screen, Txt, usePalette, useWide } from '../components/ui';
import { useReduced } from '../components/motion';
import { useAuth } from '../lib/auth';
import { useLearning } from '../lib/store';
import { tracks, v2Modules } from '../lib/content';
import { pathModules, pathUnits, projectedFinish, TRACK_LABEL } from '../lib/path';
import { buildPlacement, placementResult } from '../lib/placement';
import { optionOrder } from '../lib/assess';
import type { Level, Profile, TrackId } from '../lib/types';

const ROLES: { id: TrackId | 'undecided'; title: string; body: string; icon: string }[] = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    body: 'Build LLM apps, retrieval systems and agents.',
    icon: 'sparkles',
  },
  {
    id: 'fde',
    title: 'Forward Deployed Engineer',
    body: 'Ship AI into real customer environments.',
    icon: 'briefcase',
  },
  {
    id: 'mlops',
    title: 'MLOps Engineer',
    body: 'Train, deploy and operate models reliably.',
    icon: 'server',
  },
  {
    id: 'undecided',
    title: 'Not sure yet',
    body: 'Start on the shared trunk and decide later.',
    icon: 'compass-outline',
  },
];
const LEVELS: { id: Level; title: string; body: string }[] = [
  { id: 'new', title: 'I have never coded', body: 'Start from the very beginning.' },
  { id: 'some-python', title: 'I know some Python', body: 'Variables, loops, a few scripts.' },
  { id: 'cs-student', title: 'CS student', body: 'Data structures, OOP, some maths.' },
  { id: 'developer', title: 'Working developer', body: 'I ship software already.' },
];
const HOURS = [
  { value: 4, label: '3–5 h' },
  { value: 8, label: '6–10 h' },
  { value: 13, label: '11–15 h' },
  { value: 20, label: '16+ h' },
];

function Option({
  title,
  body,
  icon,
  selected,
  onPress,
}: {
  title: string;
  body?: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={body ? `${title}. ${body}` : title}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        minHeight: 64,
        borderRadius: 16,
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? c.ink : c.line,
        backgroundColor: selected ? c.soft : c.surface,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      {icon && <Icon name={icon} size={22} color={selected ? c.ink : c.muted} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt size={16} weight="600">
          {title}
        </Txt>
        {body && (
          <Txt size={13} color={c.muted}>
            {body}
          </Txt>
        )}
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1.5,
          borderColor: selected ? c.ink : c.faint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.ink }} />}
      </View>
    </Pressable>
  );
}

export default function Start() {
  const c = usePalette();
  const wide = useWide();
  const reduced = useReduced();
  const { session } = useAuth();
  const { state, update } = useLearning();
  const existing = state.profile;
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<Profile['track']>(existing?.track ?? 'ai-engineer');
  const [level, setLevel] = useState<Level>(existing?.level ?? 'new');
  const [hours, setHours] = useState(existing?.hoursPerWeek ?? 8);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof placementResult>>();

  const save = async (profile: Partial<Profile>) => {
    const full: Profile = {
      track,
      level,
      hoursPerWeek: hours,
      testedOut: result?.testedOut ?? existing?.testedOut ?? [],
      startedAt: existing?.startedAt ?? new Date().toISOString(),
      onboarded: true,
      ...(result
        ? { placement: { score: result.score, max: result.max, at: new Date().toISOString() } }
        : existing?.placement
          ? { placement: existing.placement }
          : {}),
      ...profile,
    };
    await update(s => ({ ...s, profile: full }));
  };
  const skip = async () => {
    await save({ track: existing?.track ?? 'undecided' });
    router.replace('/today');
  };

  const total = 4;
  // Placement covers every module, in the order of the chosen role.
  const placementModules = useMemo(
    () => (track === 'undecided' ? v2Modules : pathModules(v2Modules, tracks, track)),
    [track],
  );
  const placementQuestions = useMemo(() => buildPlacement(placementModules), [placementModules]);
  const placementModuleIds = useMemo(
    () => [...new Set(placementQuestions.map(q => q.module))],
    [placementQuestions],
  );
  const grade = (a: (number | undefined)[]) => setResult(placementResult(placementQuestions, a, v2Modules));
  const units = pathUnits(pathModules(v2Modules, tracks, track)).filter(u => u.unit.depth === 'core');
  const tested = new Set(result?.testedOut ?? []);
  const hoursLeft = units.filter(u => !tested.has(u.unit.id)).reduce((n, u) => n + u.unit.hours, 0);
  const finish = projectedFinish(hoursLeft, hours);
  const firstUnit = units.find(u => !tested.has(u.unit.id));

  const next = () => setStep(s => s + 1);
  const entering = reduced ? FadeIn.duration(1) : FadeInRight.duration(220);

  return (
    <Screen docTitle="Get started" width={640} showNav={false} minimal>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: total, now: Math.min(step + 1, total) }}
          style={{ flexDirection: 'row', gap: 6, flex: 1 }}
        >
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= Math.min(step, total - 1) ? c.accent : c.line,
              }}
            />
          ))}
        </View>
        {step < 4 && <Button title="Skip for now" ghost compact onPress={() => void skip()} />}
      </View>

      <Animated.View key={`${step}-${quizIndex}`} entering={entering} style={{ gap: 16 }}>
        {step === 0 && (
          <>
            <Txt size={wide ? 34 : 28} weight="700" accessibilityRole="header">
              What do you want to become?
            </Txt>
            <Txt color={c.muted}>
              All three share one trunk of fundamentals; the role decides where your path branches near the
              summit.
            </Txt>
            {ROLES.map(r => (
              <Option
                key={r.id}
                title={r.title}
                body={r.body}
                icon={r.icon}
                selected={track === r.id}
                onPress={() => setTrack(r.id)}
              />
            ))}
            <Button title="Continue" icon="arrow-forward" full onPress={next} />
          </>
        )}
        {step === 1 && (
          <>
            <Txt size={wide ? 34 : 28} weight="700" accessibilityRole="header">
              Where are you starting?
            </Txt>
            {LEVELS.map(l => (
              <Option
                key={l.id}
                title={l.title}
                body={l.body}
                selected={level === l.id}
                onPress={() => setLevel(l.id)}
              />
            ))}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Back" secondary onPress={() => setStep(0)} />
              <View style={{ flex: 1 }}>
                <Button title="Continue" icon="arrow-forward" full onPress={next} />
              </View>
            </View>
          </>
        )}
        {step === 2 && (
          <>
            <Txt size={wide ? 34 : 28} weight="700" accessibilityRole="header">
              How much time per week?
            </Txt>
            <Txt color={c.muted}>
              Be realistic — steady beats intense. This sets your weekly plan and projected finish.
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {HOURS.map(h => (
                <View key={h.value} style={{ flexGrow: 1, flexBasis: 120 }}>
                  <Option title={h.label} selected={hours === h.value} onPress={() => setHours(h.value)} />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Back" secondary onPress={() => setStep(1)} />
              <View style={{ flex: 1 }}>
                <Button title="Continue" icon="arrow-forward" full onPress={next} />
              </View>
            </View>
          </>
        )}
        {step === 3 && quizIndex === 0 && answers.length === 0 && (
          <>
            <Txt size={wide ? 34 : 28} weight="700" accessibilityRole="header">
              Want to skip what you already know?
            </Txt>
            <Txt color={c.muted}>
              An optional check with {placementQuestions.length} questions — up to three from each of the{' '}
              {placementModuleIds.length} modules, taken from the units themselves. Get every question in a
              module right and its core units are marked as tested out (you can still revisit them). Skip a
              module you are new to, and stop whenever the questions get unfamiliar.
            </Txt>
            <Button
              title="Take the placement check"
              icon="arrow-forward"
              full
              onPress={() => setAnswers([undefined])}
            />
            <Button
              title="No thanks, start from the beginning"
              secondary
              full
              onPress={() => {
                void save({}).then(() => setStep(4));
              }}
            />
          </>
        )}
        {step === 3 &&
          answers.length > 0 &&
          (() => {
            const q = placementQuestions[quizIndex];
            const last = quizIndex >= placementQuestions.length - 1;
            const moduleIndex = placementModuleIds.indexOf(q.module);
            const moduleTitle = v2Modules.find(m => m.id === q.module)?.title ?? q.module;
            const advance = (n: (number | undefined)[]) => {
              if (!last) setQuizIndex(i => i + 1);
              else grade(n);
            };
            const skipModule = () => {
              const n = [...answers];
              let i = quizIndex;
              while (i < placementQuestions.length && placementQuestions[i].module === q.module) n[i++] = -1;
              setAnswers(n);
              if (i < placementQuestions.length) setQuizIndex(i);
              else grade(n);
            };
            return (
              <>
                <Txt size={13} weight="600" color={c.muted}>
                  Module {moduleIndex + 1} of {placementModuleIds.length} · {q.module} {moduleTitle} · question{' '}
                  {quizIndex + 1} of {placementQuestions.length}
                </Txt>
                <Txt size={wide ? 26 : 22} weight="700" accessibilityRole="header">
                  {q.prompt}
                </Txt>
                {optionOrder(q.id, q.options.length).map(oi => (
                  <Option
                    key={oi}
                    title={q.options[oi]}
                    selected={answers[quizIndex] === oi}
                    onPress={() =>
                      setAnswers(a => {
                        const n = [...a];
                        n[quizIndex] = oi;
                        return n;
                      })
                    }
                  />
                ))}
                {!result && (
                  <>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Button
                        title="I don’t know"
                        secondary
                        onPress={() => {
                          const n = [...answers];
                          n[quizIndex] = -1;
                          setAnswers(n);
                          advance(n);
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Button
                          title={last ? 'See my result' : 'Next'}
                          full
                          disabled={answers[quizIndex] === undefined}
                          onPress={() => advance(answers)}
                        />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                      <Button title={`New to ${q.module} — skip it`} ghost compact onPress={skipModule} />
                      <Button title="Stop here and see my result" ghost compact onPress={() => grade(answers)} />
                    </View>
                  </>
                )}
                {result && (
                  <Panel>
                    <Txt weight="700">
                      You scored {result.score}/{result.max}.
                    </Txt>
                    <Txt color={c.muted}>
                      {result.testedOut.length
                        ? `Tested out of ${result.testedOut.length} unit${result.testedOut.length > 1 ? 's' : ''} (${result.testedOutModules.join(', ')}).`
                        : 'No units tested out — you will start at the beginning, which is the right call.'}
                    </Txt>
                    <Button
                      title="Build my path"
                      icon="arrow-forward"
                      full
                      onPress={() => void save({}).then(() => setStep(4))}
                    />
                  </Panel>
                )}
              </>
            );
          })()}
        {step === 4 && (
          <>
            <Chip text="Your path is ready" tone="signal" icon="checkmark" />
            <Txt size={wide ? 34 : 28} weight="700" accessibilityRole="header">
              {TRACK_LABEL[track]}
            </Txt>
            <Panel>
              {[
                [
                  'clock',
                  `${hours} h a week · about ${finish.weeks} weeks of core units in the current curriculum`,
                ],
                [
                  'footprints',
                  firstUnit
                    ? `Start at ${firstUnit.module.id} · ${firstUnit.unit.title}`
                    : 'Start on the map',
                ],
                [
                  'checkmark-circle',
                  result
                    ? `Placement ${result.score}/${result.max}${result.testedOut.length ? ` · tested out of ${result.testedOut.length} units` : ''}`
                    : 'No placement check — starting from the beginning',
                ],
                ['cloud', session ? 'Saved to your account' : 'Saved on this device'],
              ].map(([icon, text]) => (
                <View key={text} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Icon name={icon} size={18} color={c.muted} />
                  <Txt style={{ flex: 1 }}>{text}</Txt>
                </View>
              ))}
            </Panel>
            {session ? (
              <Button
                title="Open today’s plan"
                icon="arrow-forward"
                full
                onPress={() => router.replace('/today')}
              />
            ) : (
              <>
                <Button
                  title="Save my progress — create a free account"
                  full
                  onPress={() => router.replace('/signup')}
                />
                <Button title="Continue as guest" secondary full onPress={() => router.replace('/today')} />
                <Txt size={13} color={c.muted} style={{ textAlign: 'center' }}>
                  Guest progress stays on this device. You can sign up later and merge it.
                </Txt>
              </>
            )}
          </>
        )}
      </Animated.View>
    </Screen>
  );
}
