import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { MountainMap, type MapNode } from '../components/mountain-map';
import { Heatmap } from '../components/heatmap';
import { useReduced } from '../components/motion';
import {
  APP_NAME,
  BrandLink,
  Button,
  Chip,
  Grid,
  Icon,
  Panel,
  Txt,
  usePageTitle,
  usePalette,
} from '../components/ui';
import { useAuth } from '../lib/auth';
import { useLearning } from '../lib/store';
import { allUnits, conceptCount, modules, phases, resources, tracks } from '../lib/content';
import type { Activity } from '../lib/types';

const TOTAL_HOURS = modules.reduce((n, m) => n + m.hours, 0);

const FAQ = [
  [
    'Is it really free?',
    'Yes. Every course, book, video and paper on the path is free to use (some university courses are “free to audit”). The app is free, with no ads or tracking. Certificates from course providers are optional and separate.',
  ],
  [
    'How long will it take?',
    `The core path is about ${TOTAL_HOURS.toLocaleString()} hours. At 10 hours a week that is roughly three and a half years of evenings; at 20 hours, under two. Your weekly plan and projected finish update to the hours you choose, and the placement check lets you skip what you already know.`,
  ],
  [
    'Do I need a CS degree, a GPU or paid API keys?',
    'No degree. A normal laptop is enough for almost everything; GPU work uses free notebooks such as Colab or Kaggle. Where an LLM API is needed, the path points to free tiers or local models first.',
  ],
  [
    'Which role should I pick?',
    'AI Engineer builds LLM apps, retrieval and agents. Forward Deployed Engineer takes those systems into customer environments. MLOps Engineer trains, ships and runs models. All three share the same fundamentals; you can start undecided and choose at Camp 2.',
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
  const statuses: MapNode['status'][] = [
    'passed',
    'passed',
    'passed',
    'in-progress',
    'available',
    'locked',
    'locked',
    'locked',
    'locked',
  ];
  return modules.slice(0, 9).map((m, i) => ({
    id: m.id,
    kind: i === 4 ? 'capstone' : 'module',
    title: m.title,
    moduleId: m.id,
    moduleTitle: m.title,
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

function Glow({ width, height }: { width: number; height: number }) {
  const c = usePalette();
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <RadialGradient id="g" cx="70%" cy="20%" rx="60%" ry="55%">
          <Stop offset="0" stopColor={c.ink} stopOpacity={c.bg === '#000000' ? 0.11 : 0.06} />
          <Stop offset="1" stopColor={c.ink} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#g)" />
    </Svg>
  );
}

function SectionHead({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  const c = usePalette();
  const { width } = useWindowDimensions();
  return (
    <View style={{ gap: 10, maxWidth: 720 }}>
      <Txt size={12} weight="600" color={c.muted} style={{ letterSpacing: 1.6 }}>
        {eyebrow.toUpperCase()}
      </Txt>
      <Txt size={width >= 900 ? 44 : 32} weight="700" accessibilityRole="header">
        {title}
      </Txt>
      {body && (
        <Txt size={17} color={c.muted}>
          {body}
        </Txt>
      )}
    </View>
  );
}

function Faq() {
  const c = usePalette();
  const [open, setOpen] = useState(0);
  return (
    <View style={{ borderTopWidth: 1, borderColor: c.line }}>
      {FAQ.map(([q, a], i) => (
        <View key={q} style={{ borderBottomWidth: 1, borderColor: c.line }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open === i }}
            onPress={() => setOpen(open === i ? -1 : i)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 20,
              minHeight: 56,
            }}
          >
            <Txt size={17} weight="600" style={{ flex: 1 }}>
              {q}
            </Txt>
            <Icon name={open === i ? 'minus' : 'plus'} size={18} color={c.muted} />
          </Pressable>
          {open === i && (
            <Animated.View entering={FadeIn.duration(160)} style={{ paddingBottom: 20, maxWidth: 760 }}>
              <Txt color={c.muted}>{a}</Txt>
            </Animated.View>
          )}
        </View>
      ))}
    </View>
  );
}

export default function Landing() {
  const c = usePalette();
  const { width, height } = useWindowDimensions();
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
  const sampleUnit = allUnits.find(u => u.unit.id === 'M01.U01') ?? allUnits[0];
  const books = resources.filter(r => r.type === 'book').length;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <Glow width={width} height={Math.min(1100, height * 1.3)} />
        {/* Nav */}
        <View
          style={{
            ...pad,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 76,
            gap: 16,
          }}
        >
          <BrandLink href="/?about=1" compact={width < 480} />
          {wide && (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[
                ['How it works', 'how'],
                ['Roadmap', 'roadmap'],
                ['Roles', 'roles'],
                ['FAQ', 'faq'],
              ].map(([label, key]) => (
                <Pressable
                  key={key}
                  accessibilityRole="link"
                  onPress={() => go(key)}
                  style={{ paddingHorizontal: 14, minHeight: 40, justifyContent: 'center' }}
                >
                  <Txt size={14} color={c.muted}>
                    {label}
                  </Txt>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push('/download')}
                style={{ paddingHorizontal: 14, minHeight: 40, justifyContent: 'center' }}
              >
                <Txt size={14} color={c.muted}>
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
            gap: wide ? 56 : 36,
            alignItems: wide ? 'center' : 'stretch',
            paddingTop: wide ? 72 : 32,
            paddingBottom: wide ? 96 : 56,
          }}
        >
          <Animated.View entering={enter()} style={{ flex: wide ? 1.05 : undefined, gap: 24 }}>
            <Chip text="Free · open source · web + Android" icon="sparkles" />
            <Txt
              size={wide ? 68 : 44}
              weight="700"
              accessibilityRole="header"
              style={{ letterSpacing: wide ? -2.6 : -1.6, lineHeight: wide ? 72 : 48 }}
            >
              Go from zero to AI engineer. Free.
            </Txt>
            <Txt size={wide ? 20 : 17} color={c.muted} style={{ maxWidth: 560 }}>
              One guided path from your first line of Python to a job as an AI Engineer, Forward Deployed
              Engineer or MLOps Engineer — built on the best free courses. Learn it, practise it, prove it.
            </Txt>
            <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12 }}>
              <Button
                title="Get started — it’s free"
                icon="arrow-forward"
                full={!wide}
                onPress={() => router.push('/start')}
              />
              <Button title="See the roadmap" secondary full={!wide} onPress={() => go('roadmap')} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 22, rowGap: 8, paddingTop: 8 }}>
              {[
                `${modules.length} modules`,
                `~${TOTAL_HOURS.toLocaleString()} h`,
                `${conceptCount} concepts`,
                '100% free resources',
                'Works offline',
              ].map(f => (
                <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="checkmark" size={14} color={c.muted} />
                  <Txt size={13} color={c.muted}>
                    {f}
                  </Txt>
                </View>
              ))}
            </View>
          </Animated.View>
          <Animated.View entering={enter(140)} style={{ flex: wide ? 1 : undefined }}>
            <MountainMap nodes={nodes} currentId="M03" interactive={false} height={wide ? 560 : 420} />
          </Animated.View>
        </View>

        {/* How it works */}
        <View
          onLayout={e => {
            anchors.current.how = e.nativeEvent.layout.y;
          }}
          style={{ ...pad, gap: 32, paddingVertical: wide ? 72 : 48, borderTopWidth: 1, borderColor: c.line }}
        >
          <SectionHead eyebrow="How it works" title="Three steps, repeated until you are job-ready." />
          <Grid min={280} gap={20}>
            {[
              [
                'route',
                '01',
                'Pick your role',
                'AI Engineer, Forward Deployed Engineer or MLOps. Tell us your level and weekly hours; an optional placement check skips what you know.',
              ],
              [
                'map',
                '02',
                'Follow your map',
                'One next unit at a time, on a trail up the mountain. Each unit names the exact lecture slice to watch, what to read and what to build.',
              ],
              [
                'trophy',
                '03',
                'Prove it',
                'Auto-graded quizzes, short answers checked against a rubric, practice evidence and a GitHub capstone for every module.',
              ],
            ].map(([icon, n, title, body]) => (
              <Panel key={n} style={{ gap: 14, minHeight: 220 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: c.soft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={icon} size={22} />
                  </View>
                  <Txt size={13} weight="600" color={c.faint}>
                    {n}
                  </Txt>
                </View>
                <Txt size={21} weight="700">
                  {title}
                </Txt>
                <Txt color={c.muted}>{body}</Txt>
              </Panel>
            ))}
          </Grid>
        </View>

        {/* Roadmap */}
        <View
          onLayout={e => {
            anchors.current.roadmap = e.nativeEvent.layout.y;
          }}
          style={{ ...pad, gap: 32, paddingVertical: wide ? 72 : 48, borderTopWidth: 1, borderColor: c.line }}
        >
          <SectionHead
            eyebrow="The roadmap"
            title="Four camps from base to summit."
            body="Every role climbs the same trunk of fundamentals, then branches near the top. Browse the whole map without an account."
          />
          <Grid min={260} gap={16}>
            {phases.map((p, i) => (
              <Panel key={p.title} style={{ gap: 10, minHeight: 280 }}>
                <Txt size={13} weight="600" color={c.faint}>
                  {['BASE CAMP', 'CAMP 1', 'CAMP 2', 'SUMMIT RIDGE'][i]} · {p.ids.length} MODULES
                </Txt>
                <Txt size={19} weight="700">
                  {p.caption}
                </Txt>
                {p.ids.map(id => (
                  <View key={id} style={{ flexDirection: 'row', gap: 10 }}>
                    <Txt size={13} weight="600" color={c.faint} style={{ width: 32 }}>
                      {id}
                    </Txt>
                    <Txt size={14} color={c.muted} style={{ flex: 1 }}>
                      {modules.find(m => m.id === id)?.title}
                    </Txt>
                  </View>
                ))}
              </Panel>
            ))}
          </Grid>
          <Button title="Browse the map" secondary icon="arrow-forward" onPress={() => router.push('/map')} />
        </View>

        {/* Anatomy of a unit */}
        {sampleUnit && (
          <View
            style={{
              ...pad,
              gap: 32,
              paddingVertical: wide ? 72 : 48,
              borderTopWidth: 1,
              borderColor: c.line,
            }}
          >
            <SectionHead
              eyebrow="Anatomy of a unit"
              title="Learn → Read → Practice → Assess."
              body="No vague “selected videos”. Each unit names the exact slice of one primary resource, fills the gaps it leaves, and checks that you can use it."
            />
            <Panel style={{ gap: 18 }}>
              <Txt size={13} weight="600" color={c.muted}>
                {sampleUnit.module.id} · {sampleUnit.module.title} · {sampleUnit.unit.id}
              </Txt>
              <Txt size={wide ? 28 : 22} weight="700">
                {sampleUnit.unit.title}
              </Txt>
              <Grid min={220} gap={12}>
                {[
                  [
                    'play-circle-outline',
                    'Learn',
                    `${sampleUnit.unit.learn.title}${sampleUnit.unit.learn.slice ? ` — ${sampleUnit.unit.learn.slice}` : ''}`,
                  ],
                  ['book-outline', 'Read', sampleUnit.unit.read?.title ?? 'Matching chapter'],
                  [
                    'hammer',
                    'Practice',
                    `${sampleUnit.unit.practice.title}. Done when: ${sampleUnit.unit.practice.done_when}`,
                  ],
                  [
                    'clipboard',
                    'Assess',
                    `${sampleUnit.unit.quiz.filter(q => q.kind === 'mcq').length} auto-graded questions (80% to pass) + ${sampleUnit.unit.quiz.filter(q => q.kind === 'short').length} short answer checked against a rubric`,
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
                      minHeight: 170,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Icon name={icon} size={18} />
                      <Txt size={13} weight="700">
                        {String(i + 1).padStart(2, '0')} · {label}
                      </Txt>
                    </View>
                    <Txt size={14} color={c.muted}>
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
          style={{ ...pad, gap: 32, paddingVertical: wide ? 72 : 48, borderTopWidth: 1, borderColor: c.line }}
        >
          <SectionHead eyebrow="Roles" title="Three jobs, one trunk." />
          <Grid min={300} gap={16}>
            {tracks.map(t => (
              <Panel key={t.id} style={{ gap: 12, minHeight: 300 }}>
                <Icon
                  name={t.id === 'ai-engineer' ? 'sparkles' : t.id === 'fde' ? 'briefcase' : 'server'}
                  size={24}
                />
                <Txt size={22} weight="700">
                  {t.title}
                </Txt>
                <Txt color={c.muted}>{t.summary}</Txt>
                <View style={{ gap: 6 }}>
                  {t.outcomes.map(o => (
                    <View key={o} style={{ flexDirection: 'row', gap: 8 }}>
                      <Icon name="checkmark" size={16} color={c.muted} />
                      <Txt size={14} style={{ flex: 1 }}>
                        {o}
                      </Txt>
                    </View>
                  ))}
                </View>
                <Txt size={13} color={c.faint}>
                  Portfolio: {t.portfolio.join(' · ')}
                </Txt>
              </Panel>
            ))}
          </Grid>
        </View>

        {/* Progress */}
        <View
          style={{ ...pad, gap: 32, paddingVertical: wide ? 72 : 48, borderTopWidth: 1, borderColor: c.line }}
        >
          <SectionHead
            eyebrow="Progress"
            title="Your work, not your clicks."
            body="Every quiz, practice note and capstone is logged with its date. A year of showing up, at a glance."
          />
          <Panel>
            <Txt size={13} color={c.faint}>
              Example activity
            </Txt>
            <Heatmap activity={activity} />
          </Panel>
        </View>

        {/* Sources */}
        <View
          style={{ ...pad, gap: 24, paddingVertical: wide ? 72 : 48, borderTopWidth: 1, borderColor: c.line }}
        >
          <SectionHead
            eyebrow="Sources"
            title="Built on the best free teaching in the world."
            body={`${resources.length} hand-picked resources, including ${books} free books.`}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 28, rowGap: 12 }}>
            {SOURCES.map(s => (
              <Txt key={s} size={15} color={c.muted}>
                {s}
              </Txt>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View
          onLayout={e => {
            anchors.current.faq = e.nativeEvent.layout.y;
          }}
          style={{ ...pad, gap: 24, paddingVertical: wide ? 72 : 48, borderTopWidth: 1, borderColor: c.line }}
        >
          <SectionHead eyebrow="FAQ" title="Questions, answered." />
          <Faq />
        </View>

        {/* Final CTA */}
        <View style={{ ...pad, paddingVertical: wide ? 96 : 56, alignItems: 'center', gap: 20 }}>
          <Txt size={wide ? 52 : 34} weight="700" style={{ textAlign: 'center', letterSpacing: -1.6 }}>
            Start with one grain.
          </Txt>
          <Txt size={17} color={c.muted} style={{ textAlign: 'center', maxWidth: 520 }}>
            A minute to set up. A clear next step every day after.
          </Txt>
          <Button title="Get started" icon="arrow-forward" onPress={() => router.push('/start')} />
        </View>

        {/* Footer */}
        <View style={{ ...pad, borderTopWidth: 1, borderColor: c.line, paddingTop: 32, gap: 28 }}>
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 28, justifyContent: 'space-between' }}>
            <View style={{ gap: 8, maxWidth: 320 }}>
              <BrandLink href="/?about=1" />
              <Txt size={13} color={c.muted}>
                A free, guided path from zero to an AI engineering job.
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
                  <Txt size={13} weight="700">
                    {head as string}
                  </Txt>
                  {(links as string[][]).map(([label, href]) => (
                    <Pressable
                      key={label}
                      accessibilityRole="link"
                      onPress={() => router.push(href as never)}
                    >
                      <Txt size={13} color={c.muted}>
                        {label}
                      </Txt>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </View>
          <Txt size={12} color={c.faint}>
            © {new Date().getFullYear()} {APP_NAME}. Course content belongs to its creators; links open their
            original sites.
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}
