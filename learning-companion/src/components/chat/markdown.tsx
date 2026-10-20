// A small markdown renderer for assistant replies: paragraphs, headings, lists,
// **bold**, *italic*, `code`, [links](url) and fenced code blocks with copy.
import React, { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Icon, Txt, fontFor, usePalette } from '../ui';

type Block =
  | { kind: 'code'; lang: string; text: string }
  | { kind: 'h'; level: number; text: string }
  | { kind: 'li'; ordered: boolean; n: number; text: string }
  | { kind: 'p'; text: string };

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
    const fence = /^```(\w*)/.exec(line);
    if (fence) {
      flush();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      out.push({ kind: 'code', lang: fence[1], text: body.join('\n') });
      continue;
    }
    const h = /^(#{1,3})\s+(.*)/.exec(line);
    const ul = /^\s*[-*]\s+(.*)/.exec(line);
    const ol = /^\s*(\d+)[.)]\s+(.*)/.exec(line);
    if (h) {
      flush();
      out.push({ kind: 'h', level: h[1].length, text: h[2] });
    } else if (ul) {
      flush();
      out.push({ kind: 'li', ordered: false, n: 0, text: ul[1] });
    } else if (ol) {
      flush();
      out.push({ kind: 'li', ordered: true, n: Number(ol[1]), text: ol[2] });
    } else if (!line.trim()) flush();
    else para.push(line.trim());
  }
  flush();
  return out;
}

function Inline({ text, size = 17 }: { text: string; size?: number }) {
  const c = usePalette();
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**'))
      parts.push(
        <Text key={k++} style={fontFor('700')}>
          {t.slice(2, -2)}
        </Text>,
      );
    else if (t.startsWith('`'))
      parts.push(
        <Text
          key={k++}
          style={{ ...fontFor('500', true), fontSize: size - 2, backgroundColor: c.soft, color: c.ink }}
        >
          {` ${t.slice(1, -1)} `}
        </Text>,
      );
    else if (t.startsWith('[')) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
      parts.push(
        <Text
          key={k++}
          accessibilityRole="link"
          onPress={() => void Linking.openURL(lm[2])}
          style={{ color: c.accentText, textDecorationLine: 'underline' }}
        >
          {lm[1]}
        </Text>,
      );
    } else
      parts.push(
        <Text key={k++} style={{ fontStyle: 'italic' }}>
          {t.slice(1, -1)}
        </Text>,
      );
    last = m.index + t.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <Txt size={size} raw>
      {parts}
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.dark ? '#070A10' : '#14161A',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          minHeight: 36,
          borderBottomWidth: 1,
          borderColor: 'rgba(255,255,255,.12)',
        }}
      >
        <Txt raw size={13} mono color="#C9D1DC">
          {lang || 'code'}
        </Txt>
        {Platform.OS === 'web' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy code"
            onPress={copy}
            style={{
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
              minHeight: 32,
              paddingHorizontal: 6,
            }}
          >
            <Icon name={copied ? 'checkmark' : 'clipboard'} size={14} color="#C9D1DC" />
            <Txt raw size={13} color="#C9D1DC">
              {copied ? 'Copied' : 'Copy'}
            </Txt>
          </Pressable>
        )}
      </View>
      <ScrollView horizontal contentContainerStyle={{ padding: 14 }}>
        <Text selectable style={{ ...fontFor('400', true), fontSize: 14, lineHeight: 21, color: '#EEF1F5' }}>
          {text}
        </Text>
      </ScrollView>
    </View>
  );
}

export function Markdown({ text }: { text: string }) {
  const c = usePalette();
  return (
    <View style={{ gap: 10 }}>
      {parseBlocks(text).map((b, i) =>
        b.kind === 'code' ? (
          <CodeBlock key={i} lang={b.lang} text={b.text} />
        ) : b.kind === 'h' ? (
          <Txt key={i} size={b.level === 1 ? 21 : 18} weight="600">
            {b.text}
          </Txt>
        ) : b.kind === 'li' ? (
          <View key={i} style={{ flexDirection: 'row', gap: 10, paddingLeft: 4 }}>
            <Txt raw size={16} mono color={c.muted} style={{ minWidth: 18 }}>
              {b.ordered ? `${b.n}.` : '•'}
            </Txt>
            <View style={{ flex: 1 }}>
              <Inline text={b.text} />
            </View>
          </View>
        ) : (
          <Inline key={i} text={b.text} />
        ),
      )}
    </View>
  );
}
