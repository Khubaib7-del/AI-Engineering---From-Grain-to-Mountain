import { useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Button,
  Checkbox,
  Chip,
  Disclosure,
  Icon,
  Label,
  Meter,
  Panel,
  Row,
  Screen,
  Section,
  Txt,
  inputStyle,
  usePalette,
} from '../../components/ui';
import { NextStepCard } from '../../components/next-step';
import { STATUS_TEXT, Station } from '../../components/route-board';
import { StudyGuide } from '../../components/study-guide';
import {
  addedTopicIds,
  findModuleV2,
  modules,
  resources,
  studyGuides,
  topicsOfModule,
  unitIds,
} from '../../lib/content';
import { unitStatus, stepFraction } from '../../lib/assess';
import { logActivity } from '../../lib/activity';
import { useLearning } from '../../lib/store';
import type { ModuleV2 } from '../../lib/types';


type RepoFacts = { ok: boolean; message: string };
async function checkRepo(url: string): Promise<RepoFacts> {
  const m = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/);
  if (!m)
    return {
      ok: false,
      message: 'Paste a public GitHub repository URL, e.g. https://github.com/you/project.',
    };
  const repo = `${m[1]}/${m[2].replace(/\.git$/, '')}`;
  try {
    const [info, readme] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}`),
      fetch(`https://api.github.com/repos/${repo}/readme`),
    ]);
    if (info.status === 404) return { ok: false, message: 'That repository was not found or is private.' };
    if (!info.ok)
      return { ok: true, message: 'Could not reach GitHub to check the repo right now; it is saved anyway.' };
    const data = (await info.json()) as { pushed_at?: string; default_branch?: string };
    const pushed = data.pushed_at ? new Date(data.pushed_at).toLocaleDateString() : 'unknown';
    return {
      ok: true,
      message: `Repo found · README ${readme.ok ? 'present' : 'missing'} · last push ${pushed}`,
    };
  } catch {
    return { ok: true, message: 'Offline — the repo link is saved and can be checked later.' };
  }
}

function Capstone({ module, unitsPassed }: { module: ModuleV2; unitsPassed: boolean }) {
  const c = usePalette();
  const { state, update, showToast } = useLearning();
  const saved = state.capstones?.[module.id];
  const [url, setUrl] = useState(saved?.url ?? '');
  const [scores, setScores] = useState<number[]>(saved?.scores ?? module.capstone.rubric.map(() => -1));
  const [facts, setFacts] = useState<RepoFacts>();
  const [busy, setBusy] = useState(false);
  const proven = !!saved?.submittedAt && unitsPassed && saved.scores.every(s => s >= 2);
  const needsRepo = module.capstone.evidence === 'github';
  const submit = async () => {
    setBusy(true);
    const check = needsRepo ? await checkRepo(url) : { ok: url.trim().length > 7, message: '' };
    setFacts(check);
    if (!check.ok) return setBusy(false);
    const ok = await update(s =>
      logActivity(
        {
          ...s,
          capstones: {
            ...(s.capstones ?? {}),
            [module.id]: {
              url: url.trim(),
              scores,
              submittedAt: s.capstones?.[module.id]?.submittedAt ?? new Date().toISOString(),
            },
          },
        },
        { kind: 'capstone', id: module.id },
      ),
    );
    setBusy(false);
    if (ok)
      showToast(
        scores.every(s => s >= 2) && unitsPassed ? `Module ${module.id} proven ✓` : 'Capstone saved.',
      );
  };
  return (
    <Panel style={{ gap: 0, paddingVertical: 8 }}>
      <Disclosure
        title={`Capstone: ${module.capstone.title}`}
        hint={
          proven
            ? 'Proven ✓'
            : saved?.submittedAt
              ? 'Submitted · update any time'
              : 'The project that proves this module'
        }
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="flag" color={c.accentText} />
          <Label style={{ flex: 1 }}>Brief</Label>
          {proven && <Chip text="Proven" tone="strong" icon="checkmark" />}
        </View>
        <Txt>{module.capstone.brief}</Txt>
        {!unitsPassed && (
          <Txt size={14} color={c.muted}>
            You can start any time; the module counts as proven once every unit is passed and you score at
            least 2 on each criterion.
          </Txt>
        )}
        <Txt size={14} weight="600">
          Rubric — score yourself honestly
        </Txt>
        {module.capstone.rubric.map((r, i) => (
          <View key={r.criterion} style={{ gap: 8, paddingVertical: 6 }}>
            <Txt size={15} weight="600">
              {r.criterion}
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {r.levels.map((level, li) => (
                <Pressable
                  key={li}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: scores[i] === li }}
                  onPress={() => setScores(s => s.map((v, j) => (j === i ? li : v)))}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    minHeight: 40,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: scores[i] === li ? c.accent : c.edge,
                    backgroundColor: scores[i] === li ? c.accentSoft : c.surface,
                    justifyContent: 'center',
                  }}
                >
                  <Txt
                    size={13}
                    weight={scores[i] === li ? '700' : '500'}
                    color={scores[i] === li ? c.accentText : c.ink}
                  >
                    {li} · {level}
                  </Txt>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <TextInput
          accessibilityLabel="Capstone link"
          autoCapitalize="none"
          value={url}
          onChangeText={setUrl}
          placeholder={needsRepo ? 'https://github.com/you/project' : 'Link or short write-up'}
          placeholderTextColor={c.faint}
          style={inputStyle(c)}
        />
        {!!facts && (
          <Txt size={14} color={facts.ok ? c.muted : c.danger}>
            {facts.message}
          </Txt>
        )}
        <Button
          title={saved?.submittedAt ? 'Update submission' : 'Submit capstone'}
          busy={busy}
          disabled={!url.trim() || scores.some(s => s < 0)}
          onPress={() => void submit()}
        />
      </Disclosure>
    </Panel>
  );
}

function ModuleV2Screen({ module }: { module: ModuleV2 }) {
  const c = usePalette();
  const { state } = useLearning();
  const units = module.submodules.flatMap(s => s.units);
  const statuses = units.map(u => unitStatus(u, state, unitIds));
  const passed = statuses.filter(s => s === 'passed').length;
  const nextIdx =
    statuses.findIndex(s => s === 'in-progress') >= 0
      ? statuses.findIndex(s => s === 'in-progress')
      : statuses.findIndex(s => s === 'available');
  const next = nextIdx >= 0 ? units[nextIdx] : undefined;
  const nextSub = next ? module.submodules.find(sm => sm.units.some(u => u.id === next.id))?.id : undefined;
  const prereqs = module.prerequisites
    .map(id => findModuleV2(id) ?? modules.find(m => m.id === id))
    .filter(Boolean);
  return (
    <Screen
      back
      docTitle={`${module.id} · ${module.title}`}
      title={module.title}
      eyebrow={`${module.id} · ${module.phase}`}
      subtitle={module.summary}
      width={880}
    >
      {next ? (
        <NextStepCard
          kicker={statuses[nextIdx] === 'in-progress' ? 'Continue' : 'Next in this module'}
          meta={`${passed} of ${units.length} units done · ${module.hours} h core`}
          title={next.title}
          detail={`${next.id} · ${next.hours} h · ${next.learn.title}`}
          action={statuses[nextIdx] === 'in-progress' ? 'Continue unit' : 'Start unit'}
          onAction={() => router.push(`/unit/${next.id}`)}
        />
      ) : (
        <Panel>
          <Label>
            {passed} of {units.length} units done
          </Label>
          <Txt size={22} weight="600">
            {passed === units.length
              ? 'Every unit here is done. Finish the capstone below.'
              : 'Pass the earlier modules to open these units.'}
          </Txt>
          <Meter value={units.length ? passed / units.length : 0} label="Units passed" />
        </Panel>
      )}
      {!!prereqs.length && (
        <Txt size={16} color={c.muted}>
          Builds on:{' '}
          {prereqs.map((p, i) => (
            <Txt
              key={p!.id}
              size={16}
              weight="600"
              color={c.accentText}
              accessibilityRole="link"
              onPress={() => router.push(`/module/${p!.id}`)}
            >
              {p!.id} {p!.title}
              {i < prereqs.length - 1 ? ', ' : ''}
            </Txt>
          ))}
        </Txt>
      )}
      <Panel style={{ gap: 0, paddingVertical: 8 }}>
        {module.submodules.map(sub => {
          const subPassed = sub.units.filter(u => unitStatus(u, state, unitIds) === 'passed').length;
          return (
            <Disclosure
              key={sub.id}
              title={sub.title}
              hint={`${sub.id} · ${subPassed} of ${sub.units.length} done`}
              initiallyOpen={sub.id === nextSub}
            >
              {sub.units.map((u, i) => {
                const st = unitStatus(u, state, unitIds);
                return (
                  <Row
                    key={u.id}
                    title={u.title}
                    subtitle={`${u.id} · ${u.hours} h · ${st === 'in-progress' ? `${Math.round(stepFraction(u, state) * 100)}% done` : STATUS_TEXT[st]}`}
                    leading={
                      <Station node={{ status: st, kind: 'unit' }} size={30} current={u.id === next?.id} />
                    }
                    onPress={() => router.push(`/unit/${u.id}`)}
                    last={i === sub.units.length - 1}
                  />
                );
              })}
            </Disclosure>
          );
        })}
      </Panel>
      <Capstone module={module} unitsPassed={passed === units.length} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip text={`${module.hours} h core`} icon="clock" />
        {!!module.deepHours && <Chip text={`+${module.deepHours} h deep`} />}
        {module.tracks.map(t => (
          <Chip key={t} text={t === 'ai-engineer' ? 'AI Engineer' : t === 'fde' ? 'FDE' : 'MLOps'} />
        ))}
      </View>
    </Screen>
  );
}

/** Pre-v2 module page: topic checklist with square boxes, saved counter and explained assessment lock. */
function LegacyModule({ id }: { id: string }) {
  const c = usePalette();
  const { state, update, showToast } = useLearning();
  const module = modules.find(m => m.id === id)!;
  const topics = topicsOfModule(id);
  const ids = topics.map(t => t.id);
  const count = ids.filter(t => state.topics[t]).length;
  const verified = !!state.verified[id];
  const missingPrereqs = module.prerequisites.filter(p => !state.verified[p]);
  const remaining = ids.length - count;
  const current = verified && count === ids.length;
  const course = resources.find(r => r.id === module.course);
  const guide = studyGuides.find(g => g.moduleId === id);
  const lockReason = missingPrereqs.length
    ? `Confirm ${missingPrereqs.join(', ')} first.`
    : remaining
      ? `${remaining} topic${remaining > 1 ? 's' : ''} left to tick.`
      : '';
  return (
    <Screen
      back
      docTitle={`${id} · ${module.title}`}
      title={module.title}
      eyebrow={`${id} · about ${module.hours} hours`}
      width={880}
    >
      <Panel>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt weight="600">
            Saved · {count}/{ids.length} topics
          </Txt>
          {verified && <Chip text="Self-assessed" />}
        </View>
        <Meter value={ids.length ? count / ids.length : 0} label="Module topics studied" />
        {!!missingPrereqs.length && (
          <Txt size={14} color={c.muted}>
            Builds on:{' '}
            {missingPrereqs.map(p => (
              <Txt
                key={p}
                size={14}
                weight="600"
                accessibilityRole="link"
                onPress={() => router.push(`/module/${p}`)}
              >
                {p}{' '}
              </Txt>
            ))}
          </Txt>
        )}
      </Panel>
      {guide && <StudyGuide key={id} guide={guide} />}
      {course && !guide && (
        <Button
          title={course.title}
          secondary
          icon="open-outline"
          onPress={() => void Linking.openURL(course.url)}
        />
      )}
      {module.groups.map((group, gi) => (
        <Panel key={group.title}>
          <Section title={group.title} />
          {topics
            .filter(t => t.group === gi)
            .map(t => {
              const checked = !!state.topics[t.id];
              const disabled = current || (verified && !addedTopicIds.has(t.id));
              return (
                <Checkbox
                  key={t.id}
                  label={t.title}
                  checked={checked}
                  disabled={disabled}
                  onPress={() =>
                    void update(s =>
                      logActivity(
                        { ...s, topics: { ...s.topics, [t.id]: !checked } },
                        { kind: 'topic', id: t.id },
                      ),
                    ).then(
                      ok => ok && showToast(!checked ? `Saved · ${count + 1}/${ids.length}` : 'Unticked.'),
                    )
                  }
                />
              );
            })}
        </Panel>
      ))}
      <Panel>
        <Section title="Module check" />
        <Txt>{module.gate}</Txt>
        <Txt size={14} color={c.muted}>
          A graded unit-by-unit version of this module is coming with the new curriculum. Until then, confirm
          only after doing the exercise without generated answers.
        </Txt>
        {!!lockReason && !current && (
          <Txt size={14} weight="600">
            Not yet: {lockReason}
          </Txt>
        )}
        <Button
          title={current ? 'Confirmed' : verified ? 'Refresh confirmation' : 'I can do this'}
          disabled={!!lockReason || current}
          onPress={() =>
            void update(s =>
              logActivity(
                { ...s, verified: { ...s.verified, [id]: new Date().toISOString() } },
                { kind: 'unit', id },
              ),
            ).then(ok => ok && showToast('Module confirmed.'))
          }
        />
      </Panel>
    </Screen>
  );
}

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const v2 = findModuleV2(id);
  if (v2) return <ModuleV2Screen module={v2} />;
  if (modules.some(m => m.id === id)) return <LegacyModule id={id} />;
  return <Screen back title="Module not found" />;
}
