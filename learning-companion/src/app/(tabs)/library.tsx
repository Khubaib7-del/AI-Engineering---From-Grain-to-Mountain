import { useMemo, useState } from 'react';
import { Linking, Pressable, TextInput, View, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { resources, unitsUsing } from '../../lib/content';
import type { Resource } from '../../lib/types';
import {
  Button,
  Chip,
  Grid,
  Icon,
  Panel,
  Screen,
  Tag,
  Txt,
  inputStyle,
  usePalette,
} from '../../components/ui';

const FILTERS = [
  { label: 'All', types: [] as string[] },
  { label: 'Courses', types: ['course'] },
  { label: 'Books', types: ['book'] },
  { label: 'Papers', types: ['paper'] },
  { label: 'Videos', types: ['video'] },
  { label: 'Docs', types: ['doc', 'repo', 'article'] },
];
const ICON: Record<string, string> = {
  course: 'school-outline',
  book: 'book-outline',
  paper: 'document-text-outline',
  video: 'play-circle-outline',
  doc: 'document-text-outline',
  repo: 'git',
  article: 'document-text-outline',
};

const LANGUAGE: Record<string, string> = { en: 'English', hi: 'Hindi', ur: 'Urdu', 'hi/ur': 'Hindi/Urdu' };

function ResourceCard({
  resource: r,
  onOpen,
  style,
}: {
  resource: Resource;
  onOpen: (url: string) => void;
  /** Set by Grid so cards in one row share a height. */
  style?: ViewStyle;
}) {
  const c = usePalette();
  const [open, setOpen] = useState(false);
  const used = unitsUsing(r);
  return (
    <Panel style={{ gap: 12, minHeight: 168, ...style }}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open ${r.title}`}
        onPress={() => onOpen(r.url)}
        style={({ pressed }) => ({ gap: 10, opacity: pressed ? 0.6 : 1 })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name={ICON[r.type] ?? 'document-text-outline'} size={16} color={c.muted} />
          <Txt
            size={12}
            weight="600"
            color={c.muted}
            style={{ letterSpacing: 1, textTransform: 'uppercase' }}
          >
            {r.type}
          </Txt>
          <View style={{ flex: 1 }} />
          <Icon name="arrow-up-outline" size={16} color={c.muted} />
        </View>
        <Txt size={17} weight="600">
          {r.title}
        </Txt>
        {!!(r.author || r.language) && (
          <Txt size={13} color={c.muted}>
            {[r.author, r.language && (LANGUAGE[r.language.toLowerCase()] ?? r.language)]
              .filter(Boolean)
              .join(' · ')}
          </Txt>
        )}
      </Pressable>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {(r.modules ?? '')
          .split('/')
          .filter(Boolean)
          .slice(0, 4)
          .map(m => (
            <Chip key={m} text={m} />
          ))}
        {used.map(id => (
          <Pressable
            key={id}
            accessibilityRole="link"
            accessibilityLabel={`Used in unit ${id}`}
            onPress={() => router.push(`/unit/${id}`)}
          >
            <Chip text={`Used in ${id}`} tone="signal" icon="link" />
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
        {!!r.notes && (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen(v => !v)}
            style={{ minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Txt size={13} weight="600" color={c.muted}>
              {open ? 'Hide details' : 'Details'}
            </Txt>
            <Icon name="chevron-down" size={14} color={c.muted} />
          </Pressable>
        )}
        {!!r.video && (
          <Pressable
            accessibilityRole="link"
            onPress={() => onOpen(r.video!)}
            style={{ minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Icon name="play-circle-outline" size={14} color={c.muted} />
            <Txt size={13} weight="600" color={c.muted}>
              Video playlist
            </Txt>
          </Pressable>
        )}
      </View>
      {open && (
        <Txt size={14} color={c.muted}>
          {r.notes}
        </Txt>
      )}
    </Panel>
  );
}

export default function Library() {
  const c = usePalette();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(0);
  const [limit, setLimit] = useState(12);
  const [error, setError] = useState('');
  const items = useMemo(() => {
    const types = FILTERS[filter].types;
    const q = query.trim().toLowerCase();
    return resources.filter(
      r =>
        (!types.length || types.includes(r.type)) &&
        `${r.title} ${r.author ?? ''} ${r.notes ?? ''} ${r.modules ?? ''}`.toLowerCase().includes(q),
    );
  }, [query, filter]);
  const counts = FILTERS.map(f =>
    f.types.length ? resources.filter(r => f.types.includes(r.type)).length : resources.length,
  );
  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      setError('Could not open this resource. Check your internet connection.');
    }
  };
  return (
    <Screen
      title="Library"
      subtitle={`${resources.length} free courses, books, papers, videos and docs used across the path.`}
      docTitle="Library"
    >
      <View style={{ gap: 12 }}>
        <View>
          <TextInput
            accessibilityLabel="Search resources"
            placeholder="Search courses, books, papers…"
            placeholderTextColor={c.faint}
            value={query}
            onChangeText={v => {
              setQuery(v);
              setLimit(12);
            }}
            style={[inputStyle(c), { paddingLeft: 46 }]}
          />
          <View pointerEvents="none" style={{ position: 'absolute', left: 16, top: 15 }}>
            <Icon name="search-outline" size={18} color={c.faint} />
          </View>
        </View>
        <View accessibilityRole="tablist" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map((f, i) => (
            <Tag
              key={f.label}
              text={`${f.label} · ${counts[i]}`}
              active={filter === i}
              onPress={() => {
                setFilter(i);
                setLimit(12);
              }}
            />
          ))}
        </View>
      </View>
      {!!error && <Txt color={c.danger}>{error}</Txt>}
      <Txt size={13} color={c.muted}>
        {items.length} result{items.length === 1 ? '' : 's'}
      </Txt>
      <Grid min={320}>
        {items.slice(0, limit).map(r => (
          <ResourceCard key={r.id + r.url} resource={r} onOpen={url => void open(url)} />
        ))}
      </Grid>
      {items.length > limit && (
        <Button
          title={`Show more · ${items.length - limit} remaining`}
          secondary
          icon="plus"
          onPress={() => setLimit(v => v + 12)}
        />
      )}
      {!items.length && (
        <Panel>
          <Txt size={18} weight="600">
            Nothing matches that yet.
          </Txt>
          <Txt color={c.muted}>Try “Python”, “RAG” or “CampusX”, or switch to All.</Txt>
        </Panel>
      )}
    </Screen>
  );
}
