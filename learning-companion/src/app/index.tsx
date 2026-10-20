import { useMemo, useRef } from 'react';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RouteBoard, type MapNode } from '../components/route-board';
import { AsciiMountain, AsciiRule, Backdrop, DitherBand, DitherMountain } from '../components/art';
import { Heatmap } from '../components/heatmap';
import { useReduced } from '../components/motion';
import {
  APP_NAME,
  BrandLink,
  Button,
  Chip,
  Disclosure,
  Grid,
  Icon,
  Label,
  Panel,
  Txt,
  usePageTitle,
  usePalette,
} from '../components/ui';
import { useAuth } from '../lib/auth';
import { useLearning } from '../lib/store';
import {
  allUnits,
  conceptCount,
  hasV2,
  modules,
  phases,
  resources,
  tracks,
  v2CoreHours,
  v2Modules,
  v2Phases,
  weeks,
} from '../lib/content';
import type { Activity } from '../lib/types';

const TOTAL_HOURS = hasV2 ? v2CoreHours : modules.reduce((n, m) => n + m.hours, 0);
const years = (perWeek: number) => TOTAL_HOURS / perWeek / 52;
const yearsText = (perWeek: number) => {
  const y = years(perWeek);
  return y < 2 ? 'under two years' : `about ${Math.round(y * 2) / 2} years`;
};
/** Roadmap groups: the v2 phases when the v2 curriculum is bundled, else the legacy camps. */
const ROADMAP: { title: string; caption: string; items: { id: string; title: string }[] }[] = hasV2
  ? v2Phases.map(p => ({
      title: p.title.replace(/^(P\d+)\s+/, '$1 · ').toUpperCase(),
      caption: p.title.replace(/^P\d+\s+/, ''),
      items: p.modules.map(m => ({ id: m.id, title: m.title })),
    }))
  : phases.map((p, i) => ({
      title: ['BASE CAMP', 'CAMP 1', 'CAMP 2', 'SUMMIT RIDGE'][i],
      caption: p.caption,
      items: p.ids.map(id => ({ id, title: modules.find(m => m.id === id)?.title ?? id })),
    }));

const FAQ = [
  [
    'Is it really free?',
    'Yes. Every course, book, video and paper on the path is free to use (some university courses are “free to audit”). The app is free, with no ads or tracking. Certificates from course providers are optional and separate.',
  ],
  [
    'How long will it take?',
    `The core path is about ${TOTAL_HOURS.toLocaleString()} hours${hasV2 ? `, laid out as a ${weeks.length}-week plan` : ''}. At 10 hours a week that is ${yearsText(10)} of evenings; at 20 hours, ${yearsText(20)}. Your weekly plan and projected finish update to the hours you choose, and the placement check lets you skip what you already know.`,
  ],
  [
    'Do I need a CS degree, a GPU or paid API keys?',
    'No degree. A normal laptop is enough for almost everything; GPU work uses free notebooks such as Colab or Kaggle. Where an LLM API is needed, the path points to free tiers or local models first.',
  ],
  [
    'Which role should I pick?',
    'AI Engineer builds LLM apps, retrieval and agents. Forward Deployed Engineer takes those systems into customer environments. MLOps Engineer trains, ships and runs models. All three share the same fundamentals; you can start undecided and choose once the fundamentals are done.',
  ],
  [
    'Does it work offline and on Android?',
    'Yes. Your notebook is stored on your device first, so it works offline; sign in to sync it across the website and the Android app. The lectures themselves still need a connection.',
  ],
  [
    'Is this a certificate?',
    'No. You finish with something more useful to employers: a portfolio of graded quizzes, practice evidence and capstone projects on GitHub that show what you can actually do.',
  ],
  [
    'Who made it?',
    'An AI engineering student who wanted one honest, ordered path through the best free material instead of a hundred open tabs. The curriculum and the app are open source.',
  ],
];

const SOURCES = [
  'Harvard CS50 & CS50P',
  'MIT OpenCourseWare & Missing Semester',
  'Stanford CS229, CS224N, CS336',
  'fast.ai',
  'Hugging Face courses',
  'DataTalksClub (ML, LLM & MLOps Zoomcamps)',
  'Andrej Karpathy · Neural Networks: Zero to Hero',
  'DeepLearning.AI short courses',
  'Mathematics for Machine Learning (book)',
  'Dive into Deep Learning (book)',
  '3Blue1Brown',
  'Official docs: Python, PyTorch, LangGraph, MCP',
];

function demoNodes(): MapNode[] {
  const statuses: MapNode['status'][] = ['passed', 'passed', 'passed', 'in-progress', 'locked'];
  const source = hasV2 ? v2Modules : modules;
  return source.slice(0, 5).map((m, i) => ({
    id: m.id,
    kind: 'module',
    title: m.title,
    moduleId: m.id,
    moduleTitle: m.title,
    phase: 'P1 Foundations',
    status: statuses[i],
    progress: i === 3 ? 0.5 : statuses[i] === 'passed' ? 1 : 0,
    hours: m.hours,
  }));
}

function demoActivity(): Activity[] {
  const out: Activity[] = [];
  const today = new Date();
  for (let d = 0; d < 200; d++) {
    const seed = Math.sin(d * 12.9898) * 43758.5453;
    const r = seed - Math.floor(seed);
    if (r < 0.42 - (d > 150 ? 0.25 : 0)) continue;
    const n = 1 + Math.floor(r * 5);
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    for (let k = 0; k < n; k++)
      out.push({ at: new Date(date.getTime() - k * 60000).toISOString(), kind: 'step', id: 'demo' });
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

function SectionHead({ label, title, body }: { label: string; title: string; body?: string }) {
  const c = usePalette();
  const { width } = useWindowDimensions();
  return (
    <View style={{ gap: 12, maxWidth: 680 }}>
      <Label color={c.accentText}>{c.mode === 'terminal' ? `// ${label.toLowerCase()}` : label}</Label>
      <Txt size={width >= 900 ? 44 : 32} weight="600" accessibilityRole="header">
        {title}
      </Txt>
      {body && (
        <Txt size={18} color={c.muted}>
          {body}
        </Txt>
      )}
    </View>
  );
}

function Faq() {
  const c = usePalette();
  return (
    <View style={{ borderBottomWidth: 1, borderColor: c.line }}>
      {FAQ.map(([q, a], i) => (
        <Disclosure key={q} title={q} initiallyOpen={i === 0}>
          <Txt color={c.muted} style={{ maxWidth: 680 }}>
            {a}
          </Txt>
        </Disclosure>
      ))}
    </View>
  );
}

/** The hero art: an ASCII range in a terminal-style frame. */
function HeroArt({ wide }: { wide: boolean }) {
  const c = usePalette();
  return (
    <View
      style={{
        borderRadius: c.mode === 'terminal' ? 4 : 24,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.dark ? 'rgba(5,8,14,.55)' : 'rgba(255,253,248,.7)',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 16,
          minHeight: 44,
          borderBottomWidth: 1,
          borderColor: c.line,
        }}
      >
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: c.edge }}
          />
        ))}
        <Txt size={13} raw mono color={c.muted} style={{ marginLeft: 8 }}>
          ~/route $ climb --from zero --to ai-engineer
        </Txt>
      </View>
      <View style={{ paddingTop: 16 }}>
        <AsciiMountain rows={wide ? 26 : 18} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderColor: c.line,
          gap: 12,
        }}
      >
        <Txt size={13} raw mono color={c.muted}>
          base camp · M00
        </Txt>
        <Txt size={13} raw mono color={c.accentText}>
          summit · job-ready ▲
        </Txt>
      </View>
    </View>
  );
}

export default function Landing() {
  const c = usePalette();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const reduced = useReduced();
  const { session, ready } = useAuth();
  const { state, loaded } = useLearning();
  const { about } = useLocalSearchParams<{ about?: string }>();
  const scroll = useRef<ScrollView>(null);
  const anchors = useRef<Record<string, number>>({});
  const nodes = useMemo(() => demoNodes(), []);
  const activity = useMemo(() => demoActivity(), []);
  usePageTitle(undefined);

  if (!ready || !loaded) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  if (Platform.OS !== 'web') return <Redirect href={state.profile?.onboarded ? '/today' : '/start'} />;
  if (!about && (session || state.profile?.onboarded)) return <Redirect href="/today" />;

  const go = (key: string) =>
    scroll.current?.scrollTo({ y: Math.max(0, (anchors.current[key] ?? 0) - 24), animated: !reduced });
  const enter = (delay = 0) => (reduced ? undefined : FadeInDown.duration(520).delay(delay));
  const pad = {
    paddingHorizontal: wide ? 56 : 20,
    maxWidth: 1240,
    width: '100%' as const,
    alignSelf: 'center' as const,
  };
  const section = { ...pad, gap: 32, paddingVertical: wide ? 88 : 56 };
  const sampleUnit = allUnits.find(u => u.unit.id === 'M01.U01') ?? allUnits[0];
  const books = resources.filter(r => r.type === 'book').length;
  const rule = (seed: number) => (
    <View style={pad}>
      <AsciiRule width={wide ? 120 : 44} seed={seed} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Backdrop haze={false} />
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Nav */}
        <View
          style={{
            ...pad,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 80,
            gap: 16,
          }}
        >
          <BrandLink href="/?about=1" compact={width < 480} />
          {wide && (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[
                ['How it works', 'how'],
                ['Route', 'roadmap'],
                ['Roles', 'roles'],
                ['FAQ', 'faq'],
              ].map(([label, key]) => (
                <Pressable
                  key={key}
                  accessibilityRole="link"
                  onPress={() => go(key)}
                  style={{ paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' }}
                >
                  <Txt size={16} raw color={c.ink}>
                    {label}
                  </Txt>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push('/download')}
                style={{ paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' }}
              >
                <Txt size={16} raw color={c.ink}>
                  Android app
                </Txt>
              </Pressable>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Button title="Sign in" ghost compact onPress={() => router.push('/signin')} />
            <Button title="Get started" compact onPress={() => router.push('/start')} />
          </View>
        </View>

        {/* Hero */}
        <View
          style={{
            ...pad,
            flexDirection: wide ? 'row' : 'column',
            gap: wide ? 56 : 32,
            alignItems: wide ? 'center' : 'stretch',
            paddingTop: wide ? 64 : 24,
            paddingBottom: wide ? 72 : 40,
          }}
        >
          <Animated.View entering={enter()} style={{ flex: wide ? 1 : undefined, gap: 24 }}>
            <Chip text="Free · open source · web + Android" icon="sparkles" tone="signal" />
            <Txt
              size={wide ? 64 : 42}
              weight="600"
              accessibilityRole="header"
              style={{ lineHeight: wide ? 68 : 46 }}
            >
              Go from zero to AI engineer. Free.
            </Txt>
            <Txt size={wide ? 20 : 18} color={c.muted} style={{ maxWidth: 540 }}>
              One guided route from your first line of Python to a job as an AI, Forward Deployed or MLOps
              engineer. Built on the best free courses. One clear next step at a time.
            </Txt>
            <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12 }}>
              <Button
                title="Get started, it’s free"
                icon="arrow-forward"
                full={!wide}
                onPress={() => router.push('/start')}
              />
              <Button title="See the route" secondary full={!wide} onPress={() => go('roadmap')} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 20, rowGap: 8, paddingTop: 4 }}>
              {[
                ...(hasV2
                  ? [
                      `${v2Modules.length} modules`,
                      `${allUnits.length} units`,
                      `~${TOTAL_HOURS.toLocaleString()} h`,
                    ]
                  : [
                      `${modules.length} modules`,
                      `~${TOTAL_HOURS.toLocaleString()} h`,
                      `${conceptCount} concepts`,
                    ]),
                'works offline',
              ].map(f => (
                <Txt key={f} size={14} raw mono color={c.muted}>
                  {`[${f}]`}
                </Txt>
              ))}
            </View>
          </Animated.View>
          <Animated.View entering={enter(140)} style={{ flex: wide ? 1.05 : undefined }}>
            <HeroArt wide={wide} />
          </Animated.View>
        </View>

        {rule(2)}

        {/* How it works */}
        <View
          onLayout={e => {
            anchors.current.how = e.nativeEvent.layout.y;
          }}
          style={section}
        >
          <SectionHead label="How it works" title="Three steps, repeated until you are job-ready." />
          <Grid min={280} gap={20}>
            {[
              [
                'route',
                '01',
                'Pick your role',
                'Tell us your level and weekly hours. An optional placement check skips what you already know.',
              ],
              [
                'map',
                '02',
                'Follow one next step',
                'Each unit names the exact lecture slice to watch, what to read and what to build.',
              ],
              [
                'trophy',
                '03',
                'Prove it',
                'Graded quizzes, short answers checked against a rubric, and a GitHub capstone per module.',
              ],
            ].map(([icon, n, title, body]) => (
              <Panel key={n} style={{ gap: 14, minHeight: 210 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: c.mode === 'terminal' ? 4 : 14,
                      backgroundColor: c.accentSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={icon} size={22} color={c.accentText} />
                  </View>
                  <Label>{n}</Label>
                </View>
                <Txt size={22} weight="600">
                  {title}
                </Txt>
                <Txt color={c.muted}>{body}</Txt>
              </Panel>
            ))}
          </Grid>
        </View>

        {/* Route */}
        <View
          onLayout={e => {
            anchors.current.roadmap = e.nativeEvent.layout.y;
          }}
          style={section}
        >
          <SectionHead
            label="The route"
            title={
              hasV2
                ? `${ROADMAP.length} level lines, base camp to summit.`
                : 'Four camps from base to summit.'
            }
            body="No slopes, no guesswork: each phase is one line of stations. Finish a line, start the next. Browse it all without an account."
          />
          <RouteBoard nodes={nodes} currentId={nodes[3]?.id} interactive={false} compactLabels />
          <Disclosure title={`All ${ROADMAP.length} phases`} hint="Every module on the route, in order">
            <Grid min={260} gap={16}>
              {ROADMAP.map(p => (
                <View
                  key={p.title}
                  style={{
                    gap: 6,
                    padding: 16,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: c.line,
                    backgroundColor: c.surface,
                  }}
                >
                  <Label color={c.accentText}>{p.title}</Label>
                  <Txt size={18} weight="600">
                    {p.caption}
                  </Txt>
                  {p.items.map(m => (
                    <Txt key={m.id} size={15} color={c.muted}>
                      <Txt size={14} raw mono color={c.ink}>
                        {m.id}
                      </Txt>{' '}
                      {m.title}
                    </Txt>
                  ))}
                </View>
              ))}
            </Grid>
          </Disclosure>
          <Button
            title="Browse the full map"
            secondary
            icon="arrow-forward"
            onPress={() => router.push('/map')}
          />
        </View>

        {rule(5)}

        {/* Anatomy of a unit */}
        {sampleUnit && (
          <View style={section}>
            <SectionHead
              label="Inside a unit"
              title="Learn, read, practise, prove."
              body="Each unit names the exact slice of one primary resource and checks that you can use it."
            />
            <Panel style={{ gap: 18 }}>
              <Label>
                {sampleUnit.module.id} · {sampleUnit.unit.id}
              </Label>
              <Txt size={wide ? 28 : 22} weight="600">
                {sampleUnit.unit.title}
              </Txt>
              <Grid min={220} gap={12}>
                {[
                  [
                    'play-circle-outline',
                    'Learn',
                    `${sampleUnit.unit.learn.title}${sampleUnit.unit.learn.slice ? `: ${sampleUnit.unit.learn.slice}` : ''}`,
                  ],
                  ['book-outline', 'Read', sampleUnit.unit.read?.title ?? 'Matching chapter'],
                  ['hammer', 'Practice', sampleUnit.unit.practice.title],
                  [
                    'clipboard',
                    'Assess',
                    `${sampleUnit.unit.quiz.filter(q => q.kind === 'mcq').length} graded questions, 80% to pass`,
                  ],
                ].map(([icon, label, body], i) => (
                  <View
                    key={label}
                    style={{
                      gap: 8,
                      padding: 16,
                      borderRadius: 14,
                      backgroundColor: c.raised,
                      borderWidth: 1,
                      borderColor: c.line,
                      minHeight: 150,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Icon name={icon} size={18} color={c.accentText} />
                      <Label color={c.ink}>
                        {String(i + 1).padStart(2, '0')} · {label}
                      </Label>
                    </View>
                    <Txt size={16} color={c.muted}>
                      {body}
                    </Txt>
                  </View>
                ))}
              </Grid>
            </Panel>
          </View>
        )}

        {/* Roles */}
        <View
          onLayout={e => {
            anchors.current.roles = e.nativeEvent.layout.y;
          }}
          style={section}
        >
          <SectionHead label="Roles" title="Three jobs, one shared trunk." />
          <Grid min={300} gap={16}>
            {tracks.map(t => (
              <Panel key={t.id} style={{ gap: 12 }}>
                <Icon
                  name={t.id === 'ai-engineer' ? 'sparkles' : t.id === 'fde' ? 'briefcase' : 'server'}
                  size={24}
                  color={c.accentText}
                />
                <Txt size={22} weight="600">
                  {t.title}
                </Txt>
                <Txt color={c.muted} numberOfLines={4}>
                  {t.summary}
                </Txt>
                <Disclosure title="What you will be able to do">
                  {t.outcomes.map(o => (
                    <View key={o} style={{ flexDirection: 'row', gap: 8 }}>
                      <Icon name="checkmark" size={16} color={c.accentText} />
                      <Txt size={16} style={{ flex: 1 }}>
                        {o}
                      </Txt>
                    </View>
                  ))}
                </Disclosure>
              </Panel>
            ))}
          </Grid>
        </View>

        {/* Progress */}
        <View style={{ ...section, gap: 0 }}>
          <DitherBand height={64} />
          <View style={{ gap: 32, paddingTop: 24 }}>
            <SectionHead
              label="Progress"
              title="Your work, not your clicks."
              body="Every quiz, practice note and capstone is logged with its date."
            />
            <Panel>
              <Label>Example activity</Label>
              <Heatmap activity={activity} />
            </Panel>
          </View>
        </View>

        {/* Sources */}
        <View style={{ ...section, gap: 24 }}>
          <SectionHead
            label="Sources"
            title="Built on the best free teaching."
            body={`${resources.length} hand-picked resources, including ${books} free books.`}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {SOURCES.map(s => (
              <View
                key={s}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: c.line,
                  backgroundColor: c.surface,
                }}
              >
                <Txt size={15} raw>
                  {s}
                </Txt>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View
          onLayout={e => {
            anchors.current.faq = e.nativeEvent.layout.y;
          }}
          style={{ ...section, gap: 24 }}
        >
          <SectionHead label="FAQ" title="Questions, answered." />
          <Faq />
        </View>

        {/* Final CTA */}
        <View style={{ ...pad, paddingTop: wide ? 40 : 24, gap: 0 }}>
          <View
            style={{
              borderRadius: c.mode === 'terminal' ? 4 : 28,
              borderWidth: 1,
              borderColor: c.line,
              backgroundColor: c.surface,
              overflow: 'hidden',
            }}
          >
            <View
              style={{ alignItems: 'center', gap: 16, paddingTop: wide ? 64 : 40, paddingHorizontal: 20 }}
            >
              <Txt size={wide ? 52 : 34} weight="600" style={{ textAlign: 'center' }}>
                Start with one grain.
              </Txt>
              <Txt size={18} color={c.muted} style={{ textAlign: 'center', maxWidth: 520 }}>
                A minute to set up. A clear next step every day after.
              </Txt>
              <Button title="Get started" icon="arrow-forward" onPress={() => router.push('/start')} />
            </View>
            <DitherMountain height={wide ? 200 : 130} />
          </View>
        </View>

        {/* Footer */}
        <View style={{ ...pad, paddingTop: 48, gap: 28 }}>
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 28, justifyContent: 'space-between' }}>
            <View style={{ gap: 8, maxWidth: 320 }}>
              <BrandLink href="/?about=1" />
              <Txt size={15} color={c.muted}>
                A free, guided route from zero to an AI engineering job.
              </Txt>
            </View>
            <View style={{ flexDirection: 'row', gap: 48, flexWrap: 'wrap' }}>
              {[
                [
                  'Product',
                  [
                    ['Get started', '/start'],
                    ['Map', '/map'],
                    ['Library', '/library'],
                  ],
                ],
                [
                  'Apps',
                  [
                    ['Android', '/download'],
                    ['Web app', '/today'],
                  ],
                ],
                [
                  'About',
                  [
                    ['Privacy', '/privacy'],
                    ['Sign in', '/signin'],
                  ],
                ],
              ].map(([head, links]) => (
                <View key={head as string} style={{ gap: 10 }}>
                  <Label color={c.ink}>{head as string}</Label>
                  {(links as string[][]).map(([label, href]) => (
                    <Pressable
                      key={label}
                      accessibilityRole="link"
                      onPress={() => router.push(href as never)}
                      style={{ minHeight: 32, justifyContent: 'center' }}
                    >
                      <Txt size={15} color={c.muted}>
                        {label}
                      </Txt>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </View>
          <Txt size={14} color={c.muted}>
            © {new Date().getFullYear()} {APP_NAME}. Course content belongs to its creators; links open their
            original sites.
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}
