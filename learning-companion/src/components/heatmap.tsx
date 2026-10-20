import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { eventsOn, heatmap } from '../lib/activity';
import type { Activity } from '../lib/types';
import { Txt, usePalette, useWide } from './ui';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const KIND_LABEL: Record<string, string> = {
  topic: 'Topic ticked',
  unit: 'Unit passed',
  quiz: 'Quiz attempt',
  practice: 'Practice evidence saved',
  capstone: 'Capstone submitted',
  lesson: 'Lesson completed',
  step: 'Step done',
  review: 'Review',
};

/** 52-week activity heatmap (Kindling pattern, silver ramp, ring on today). */
export function Heatmap({ activity, labelFor }: { activity: Activity[]; labelFor?: (id: string) => string }) {
  const c = usePalette();
  const wide = useWide();
  const columns = useMemo(() => heatmap(activity), [activity]);
  const [selected, setSelected] = useState<string>();
  const scroll = useRef<ScrollView>(null);
  const gap = 3;
  const [avail, setAvail] = useState(0);
  // Fill the card on wide screens; on phones keep cells tappable and scroll horizontally.
  const size = avail
    ? Math.max(wide ? 10 : 12, Math.min(18, Math.floor((avail - gap * 51) / 52)))
    : wide
      ? 13
      : 12;
  const events = selected ? eventsOn(activity, selected) : [];
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View style={{ paddingTop: 18, gap }}>
          {['M', '', 'W', '', 'F', '', ''].map((d, i) => (
            <View key={i} style={{ height: size, justifyContent: 'center' }}>
              <Txt size={10} color={c.faint} style={{ lineHeight: size }}>
                {d}
              </Txt>
            </View>
          ))}
        </View>
        <ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
          onLayout={e => setAvail(Math.floor(e.nativeEvent.layout.width))}
          style={{ flex: 1 }}
        >
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', gap, height: 14 }}>
              {columns.map((col, i) => {
                const first = col[0].date;
                const month = Number(first.slice(5, 7)) - 1;
                const show = i === 0 || Number(columns[i - 1][0].date.slice(5, 7)) - 1 !== month;
                return (
                  <View key={first} style={{ width: size, overflow: 'visible' }}>
                    {show && (
                      <Txt size={10} color={c.faint} style={{ width: 30, lineHeight: 14 }}>
                        {MONTHS[month]}
                      </Txt>
                    )}
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap }}>
              {columns.map(col => (
                <View key={col[0].date} style={{ gap }}>
                  {col.map(cell => (
                    <Pressable
                      key={cell.date}
                      disabled={cell.future}
                      accessibilityLabel={`${cell.date}: ${cell.count} activit${cell.count === 1 ? 'y' : 'ies'}`}
                      onPress={() => setSelected(cell.date === selected ? undefined : cell.date)}
                      style={{
                        width: size,
                        height: size,
                        borderRadius: Math.round(size * 0.24),
                        backgroundColor: cell.future ? 'transparent' : c.heat[cell.level],
                        borderWidth: cell.today || cell.date === selected ? 1.5 : 0,
                        borderColor: c.signal,
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end' }}>
        <Txt size={11} color={c.faint}>
          Less
        </Txt>
        {c.heat.map(color => (
          <View key={color} style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: color }} />
        ))}
        <Txt size={11} color={c.faint}>
          More
        </Txt>
      </View>
      {selected && (
        <View style={{ padding: 14, borderRadius: 14, backgroundColor: c.soft, gap: 6 }}>
          <Txt size={13} weight="600">
            {new Date(`${selected}T12:00:00`).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Txt>
          {events.length ? (
            events.map(e => (
              <Txt key={`${e.at}-${e.kind}-${e.id}`} size={13} color={c.muted}>
                {new Date(e.at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {KIND_LABEL[e.kind] ?? e.kind} · {labelFor?.(e.id) ?? e.id}
                {e.score !== undefined ? ` · ${Math.round(e.score * 100)}%` : ''}
              </Txt>
            ))
          ) : (
            <Txt size={13} color={c.muted}>
              No activity that day.
            </Txt>
          )}
        </View>
      )}
    </View>
  );
}
