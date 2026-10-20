import { useEffect, useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Icon, Panel, Txt, inputStyle, usePalette } from './ui';
import { supabase, confirmRedirect, accountRedirect } from '../lib/supabase';
import { useLearning } from '../lib/store';

type Mode = 'signin' | 'signup' | 'reset';
const validEmail = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim());

function Field({
  label,
  children,
  aside,
}: {
  label: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 24 }}
      >
        <Txt size={14} weight="500">
          {label}
        </Txt>
        {aside}
      </View>
      {children}
    </View>
  );
}

/** "Check your inbox" state after sign-up: address, resend with cooldown, Gmail shortcut, reassurance. */
export function CheckInbox({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const c = usePalette();
  const { showToast } = useLearning();
  const [cooldown, setCooldown] = useState(60);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  const resend = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: confirmRedirect() },
    });
    setBusy(false);
    if (error) showToast(error.message);
    else {
      showToast(`Sent a new confirmation link to ${email.trim()}.`);
      setCooldown(60);
    }
  };
  return (
    <Panel style={{ gap: 18 }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: c.soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="mail" size={26} />
      </View>
      <View style={{ gap: 6 }}>
        <Txt size={24} weight="700" accessibilityRole="header">
          Check your inbox
        </Txt>
        <Txt color={c.muted}>
          We sent a confirmation link to <Txt weight="600">{email.trim()}</Txt>. Open it on this device to
          finish creating your account.
        </Txt>
      </View>
      <View style={{ gap: 10 }}>
        <Button
          title="Open Gmail"
          icon="open-outline"
          full
          onPress={() =>
            void Linking.openURL('https://mail.google.com/mail/u/0/#search/in%3Aanywhere+grain+to+mountain')
          }
        />
        <Button
          title={cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend confirmation link'}
          secondary
          full
          busy={busy}
          disabled={cooldown > 0}
          onPress={() => void resend()}
        />
      </View>
      <Txt size={13} color={c.muted}>
        Nothing after a minute? Check spam or promotions.{' '}
        <Txt size={13} weight="600" color={c.ink} onPress={onChangeEmail} accessibilityRole="link">
          Wrong email?
        </Txt>
      </Txt>
      <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 14, backgroundColor: c.soft }}>
        <Icon name="info" size={18} color={c.muted} />
        <Txt size={13} color={c.muted} style={{ flex: 1 }}>
          Your guest progress is safe on this device. After you confirm, you can merge it into your account.
        </Txt>
      </View>
    </Panel>
  );
}

export function AuthForm({ initial }: { initial: Mode }) {
  const c = usePalette();
  const [mode, setMode] = useState<Mode>(initial);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const { state } = useLearning();

  const submit = async () => {
    setMessage('');
    if (!supabase)
      return setMessage('Accounts are not connected in this build. Your local notebook still works.');
    if (!validEmail(email)) return setMessage('Enter a valid email address.');
    if (mode !== 'reset' && password.length < 8)
      return setMessage('Use at least 8 characters for your password.');
    setBusy(true);
    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: accountRedirect(),
        });
        if (error) throw error;
        setMessage('If an account exists for that address, a reset link is on its way.');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: confirmRedirect() },
        });
        if (error) throw error;
        setPassword('');
        if (data.session) router.replace('/welcome');
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setPassword('');
        router.replace(state.profile?.onboarded ? '/today' : '/start');
      }
    } catch (e) {
      const text = e instanceof Error ? e.message : 'The request failed.';
      setMessage(
        /Email not confirmed/i.test(text)
          ? 'Confirm your email first — check your inbox for the link.'
          : text,
      );
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <CheckInbox
        email={email}
        onChangeEmail={() => {
          setSent(false);
          setMode('signup');
        }}
      />
    );

  const heading =
    mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back';
  const sub =
    mode === 'signup'
      ? 'Free forever. Sync your path and progress across web and Android.'
      : mode === 'reset'
        ? 'We will email you a link to choose a new password.'
        : 'Sign in to sync your notebook across devices.';
  return (
    <Panel style={{ gap: 18 }}>
      <View style={{ gap: 6 }}>
        <Txt size={24} weight="700" accessibilityRole="header">
          {heading}
        </Txt>
        <Txt size={14} color={c.muted}>
          {sub}
        </Txt>
      </View>
      <Field label="Email">
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={c.faint}
          style={inputStyle(c)}
        />
      </Field>
      {mode !== 'reset' && (
        <Field
          label="Password"
          aside={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={show ? 'Hide password' : 'Show password'}
              onPress={() => setShow(v => !v)}
              style={{ minHeight: 32, justifyContent: 'center' }}
            >
              <Txt size={13} color={c.muted}>
                {show ? 'Hide' : 'Show'}
              </Txt>
            </Pressable>
          }
        >
          <TextInput
            accessibilityLabel="Password"
            secureTextEntry={!show}
            autoCapitalize="none"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => void submit()}
            placeholder={mode === 'signup' ? 'At least 8 characters' : ''}
            placeholderTextColor={c.faint}
            style={inputStyle(c)}
          />
        </Field>
      )}
      {!!message && (
        <Txt
          size={14}
          color={/sent|on its way/.test(message) ? c.ink : c.danger}
          accessibilityLiveRegion="polite"
        >
          {message}
        </Txt>
      )}
      <Button
        title={mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
        full
        busy={busy}
        disabled={!supabase}
        onPress={() => void submit()}
      />
      <View style={{ gap: 8, alignItems: 'center' }}>
        {mode === 'signin' && (
          <>
            <Txt size={14} color={c.muted}>
              New here?{' '}
              <Txt size={14} weight="600" accessibilityRole="link" onPress={() => router.replace('/start')}>
                Get started
              </Txt>{' '}
              or{' '}
              <Txt
                size={14}
                weight="600"
                accessibilityRole="link"
                onPress={() => {
                  setMode('signup');
                  setMessage('');
                }}
              >
                create an account
              </Txt>
            </Txt>
            <Txt
              size={14}
              weight="500"
              color={c.muted}
              accessibilityRole="link"
              onPress={() => {
                setMode('reset');
                setMessage('');
              }}
            >
              Forgot password?
            </Txt>
          </>
        )}
        {mode !== 'signin' && (
          <Txt size={14} color={c.muted}>
            Already have an account?{' '}
            <Txt
              size={14}
              weight="600"
              accessibilityRole="link"
              onPress={() => {
                setMode('signin');
                setMessage('');
              }}
            >
              Sign in
            </Txt>
          </Txt>
        )}
      </View>
    </Panel>
  );
}
