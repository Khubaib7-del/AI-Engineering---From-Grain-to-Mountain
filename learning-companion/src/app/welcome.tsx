import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Icon, Panel, Screen, Txt, usePalette } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useLearning } from '../lib/store';
import { initialAuthLink } from '../lib/supabase';

function Step({ done, label, busy }: { done: boolean; label: string; busy?: boolean }) {
  const c = usePalette();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 36 }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: done ? c.accent : 'transparent',
          borderWidth: done ? 0 : 1.5,
          borderColor: c.faint,
          borderStyle: busy ? 'dashed' : 'solid',
        }}
      >
        {done && <Icon name="checkmark" size={15} color={c.onAccent} />}
      </View>
      <Txt color={done ? c.ink : c.muted}>{label}</Txt>
    </View>
  );
}

/** Landing screen for the email confirmation link. */
export default function Welcome() {
  const c = usePalette();
  const { session, ready } = useAuth();
  const { loaded, syncStatus, guestOffer, state } = useLearning();
  const next = state.profile?.onboarded ? '/today' : '/start';

  if (ready && !session) {
    return (
      <Screen back docTitle="Email confirmed" width={560}>
        <Panel style={{ gap: 16 }}>
          <Txt size={26} weight="700" accessibilityRole="header">
            {initialAuthLink.error ? 'That link did not work' : 'You’re confirmed'}
          </Txt>
          <Txt color={c.muted}>
            {initialAuthLink.error
              ? `${initialAuthLink.error}. Links expire after a while — sign in, or request a new link from the sign-up screen.`
              : 'Your email is confirmed. Sign in on this device to continue.'}
          </Txt>
          <Button title="Sign in" full onPress={() => router.replace('/signin')} />
        </Panel>
      </Screen>
    );
  }

  return (
    <Screen docTitle="You’re confirmed" width={560}>
      <Panel style={{ gap: 18 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: c.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="checkmark" size={30} color={c.onAccent} />
        </View>
        <View style={{ gap: 6 }}>
          <Txt size={28} weight="700" accessibilityRole="header">
            You’re confirmed
          </Txt>
          <Txt color={c.muted}>
            {session?.user.email} is ready. Your path and progress now sync across web and Android.
          </Txt>
        </View>
        <View>
          <Step done label="Email confirmed" />
          <Step
            done={loaded}
            busy={!loaded}
            label={loaded ? 'Notebook ready' : 'Setting up your notebook…'}
          />
          <Step
            done={syncStatus === 'synced'}
            busy={syncStatus === 'syncing'}
            label={
              syncStatus === 'synced'
                ? 'Synced'
                : syncStatus === 'syncing'
                  ? 'Syncing…'
                  : 'Will sync when online'
            }
          />
          {guestOffer && <Step done={false} label="Guest progress found — choose below" />}
        </View>
        <Button
          title={state.profile?.onboarded ? 'Continue to today' : 'Continue — set up your path'}
          icon="arrow-forward"
          full
          disabled={!loaded}
          onPress={() => router.replace(next)}
        />
      </Panel>
    </Screen>
  );
}
