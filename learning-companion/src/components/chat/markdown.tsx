// Markdown for assistant replies: headings (with inline styles), paragraphs,
// nested bullet / numbered lists, block quotes, rules, simple tables,
// **bold**, *italic*, ~~strike~~, `code`, [links](url) and fenced code with copy.
import React, { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Icon, Txt, fontFor, usePalette } from '../ui';

type Block =
  | { kind: 'code'; lang: string; text: string }
  | { kind: 'h'; level: number; text: string }
  | { kind: 'li'; ordered: boolean; n: number; depth: number; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'hr' }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'p'; text: string };

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(c => c.trim());

export function parseBlocks(src: string): Block[] {
  const out: Block[] = [];
  const lines = src.replace(/\r/g, '').split('\n');
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ kind: 'p', text: para.join(' ') });
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^\s*```\s*([\w+-]*)/.exec(line);
    if (fence) {
      flush();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++]);
      out.push({ kind: 'code', lang: fence[1], text: body.join('\n') });
      continue;
    }
    // Table: a header row, then a |---|---| separator.
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      flush();
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      i--;
      out.push({ kind: 'table', head, rows });
      continue;
    }
    const h = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    const hr = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line);
    const ul = /^(\s*)[-*+•]\s+(.*)/.exec(line);
    const ol = /^(\s*)(\d+)[.)]\s+(.*)/.exec(line);
    const quote = /^\s*>\s?(.*)/.exec(line);
    if (h) {
      flush();
      out.push({ kind: 'h', level: h[1].length, text: h[2] });
    } else if (hr) {
      flush();
      out.push({ kind: 'hr' });
    } else if (ul) {
      flush();
      out.push({ kind: 'li', ordered: false, n: 0, depth: Math.min(3, Math.floor(ul[1].length / 2)), text: ul[2] });
    } else if (ol) {
      flush();
      out.push({ kind: 'li', ordered: true, n: Number(ol[2]), depth: Math.min(3, Math.floor(ol[1].length / 2)), text: ol[3] });
    } else if (quote) {
      flush();
      const prev = out[out.length - 1];
      if (prev?.kind === 'quote') prev.text += ` ${quote[1]}`;
      else out.push({ kind: 'quote', text: quote[1] });
    } else if (!line.trim()) flush();
    else if (out.length && out[out.length - 1].kind === 'li' && /^\s{2,}\S/.test(line) && !para.length)
      (out[out.length - 1] as { text: string }).text += ` ${line.trim()}`;
    else para.push(line.trim());
  }
  flush();
  return out;
}

/** Inline styles. Recursive so **bold with `code`** and *[links](…)* work. */
function inline(text: string, size: number, c: ReturnType<typeof usePalette>, key = 'i'): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+?\*\*|__[^_]+?__|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|~~[^~]+~~|\*[^*\s][^*]*?\*|_[^_\s][^_]*?_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const t = m[0];
    const id = `${key}.${k++}`;
    if (t.startsWith('**') || t.startsWith('__'))
      parts.push(
        <Text key={id} style={fontFor('700')}>
          {inline(t.slice(2, -2), size, c, id)}
        </Text>,
      );
    else if (t.startsWith('`'))
      parts.push(
        <Text
          key={id}
          style={{
            ...fontFor('500', true),
            fontSize: size - 2.5,
            backgroundColor: c.soft,
            color: c.ink,
            borderRadius: 5,
            ...(Platform.OS === 'web' ? ({ padding: '1px 5px' } as object) : {}),
          }}
        >
          {Platform.OS === 'web' ? t.slice(1, -1) : ` ${t.slice(1, -1)} `}
        </Text>,
      );
    else if (t.startsWith('[')) {
      const lm = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(t)!;
      parts.push(
        <Text
          key={id}
          accessibilityRole="link"
          onPress={() => void Linking.openURL(lm[2])}
          style={{ color: c.accentText, textDecorationLine: 'underline' }}
        >
          {inline(lm[1], size, c, id)}
        </Text>,
      );
    } else if (t.startsWith('~~'))
      parts.push(
        <Text key={id} style={{ textDecorationLine: 'line-through' }}>
          {t.slice(2, -2)}
        </Text>,
      );
    else
      parts.push(
        <Text key={id} style={{ fontStyle: 'italic' }}>
          {inline(t.slice(1, -1), size, c, id)}
        </Text>,
      );
    last = m.index + t.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Inline({ text, size = 16, weight, color }: { text: string; size?: number; weight?: '600' | '700'; color?: string }) {
  const c = usePalette();
  return (
    <Txt size={size} raw weight={weight} color={color} selectable style={{ lineHeight: Math.round(size * 1.6) }}>
      {inline(text, size, c)}
    </Txt>
  );
}

function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const c = usePalette();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  };
  return (
    <View
      style={{
        borderRadius: c.mode === 'terminal' ? 4 : 12,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.dark ? '#06080D' : '#16181D',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 12,
          paddingRight: 4,
          minHeight: 34,
          backgroundColor: 'rgba(255,255,255,.04)',
          borderBottomWidth: 1,
          borderColor: 'rgba(255,255,255,.08)',
        }}
      >
        <Txt raw size={12} mono color="#AEB7C4">
          {lang || 'code'}
        </Txt>
        {Platform.OS === 'web' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy code"
            onPress={copy}
            style={({ hovered }: { pressed: boolean; hovered?: boolean }) => ({
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
              minHeight: 28,
              paddingHorizontal: 8,
              borderRadius: 6,
              backgroundColor: hovered ? 'rgba(255,255,255,.08)' : 'transparent',
            })}
          >
            <Icon name={copied ? 'checkmark' : 'clipboard'} size={13} color="#C9D1DC" />
            <Txt raw size={12} color="#C9D1DC">
              {copied ? 'Copied' : 'Copy'}
            </Txt>
          </Pressable>
        )}
      </View>
      <ScrollView horizontal contentContainerStyle={{ padding: 14 }}>
        <Text selectable style={{ ...fontFor('400', true), fontSize: 13.5, lineHeight: 21, color: '#E8ECF2' }}>
          {text}
        </Text>
      </ScrollView>
    </View>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  const c = usePalette();
  return (
    <ScrollView horizontal>
      <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: 10, overflow: 'hidden', minWidth: '100%' }}>
        {[head, ...rows].map((r, ri) => (
          <View
            key={ri}
            style={{
              flexDirection: 'row',
              backgroundColor: ri === 0 ? c.soft : 'transparent',
              borderTopWidth: ri ? 1 : 0,
              borderColor: c.line,
            }}
          >
            {head.map((_, ci) => (
              <View key={ci} style={{ minWidth: 110, maxWidth: 260, flex: 1, padding: 8 }}>
                <Inline text={r[ci] ?? ''} size={14} weight={ri === 0 ? '600' : undefined} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function Markdown({ text }: { text: string }) {
  const c = usePalette();
  const blocks = parseBlocks(text);
  return (
    <View style={{ gap: 10 }}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'code':
            return <CodeBlock key={i} lang={b.lang} text={b.text} />;
          case 'h':
            return (
              <View key={i} style={{ marginTop: i ? 6 : 0 }}>
                <Inline text={b.text} size={b.level <= 1 ? 20 : b.level === 2 ? 18 : 16.5} weight="700" />
              </View>
            );
          case 'hr':
            return <View key={i} style={{ height: 1, backgroundColor: c.line, marginVertical: 4 }} />;
          case 'quote':
            return (
              <View key={i} style={{ borderLeftWidth: 3, borderColor: c.edge, paddingLeft: 12 }}>
                <Inline text={b.text} color={c.muted} />
              </View>
            );
          case 'table':
            return <Table key={i} head={b.head} rows={b.rows} />;
          case 'li':
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 8, paddingLeft: 2 + b.depth * 18, marginTop: -4 }}>
                <Txt
                  raw
                  size={b.ordered ? 14 : 16}
                  mono={b.ordered}
                  color={c.muted}
                  style={{ minWidth: b.ordered ? 20 : 12, lineHeight: 25.6 }}
                >
                  {b.ordered ? `${b.n}.` : b.depth ? '◦' : '•'}
                </Txt>
                <View style={{ flex: 1 }}>
                  <Inline text={b.text} />
                </View>
              </View>
            );
          default:
            return <Inline key={i} text={b.text} />;
        }
      })}
    </View>
  );
}
