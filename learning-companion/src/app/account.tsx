import { useState } from 'react';
import { Platform, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AuthForm } from '../components/auth-form';
import {
  Button,
  Icon,
  Panel,
  Screen,
  Section,
  SyncChip,
  Txt,
  inputStyle,
  usePalette,
} from '../components/ui';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useLearning } from '../lib/store';

function Recovery() {
  const c = usePalette();
  const auth = useAuth();
  const { showToast } = useLearning();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const save = async () => {
    if (password.length < 8) return setMessage('Use at least 8 characters.');
    setBusy(true);
    const { error } = await supabase!.auth.updateUser({ password });
    setBusy(false);
    if (error) return setMessage(error.message);
    auth.finishRecovery();
    setPassword('');
    showToast('Password updated.');
  };
  return (
    <Panel>
      <Txt size={24} weight="700" accessibilityRole="header">
        Choose a new password
      </Txt>
      <TextInput
        accessibilityLabel="New password"
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={() => void save()}
        style={inputStyle(c)}
      />
      {!!message && <Txt color={c.danger}>{message}</Txt>}
      <Button title="Save new password" full busy={busy} onPress={() => void save()} />
    </Panel>
  );
}

export default function Account() {
  const c = usePalette();
  const auth = useAuth();
  const learning = useLearning();
  const [busy, setBusy] = useState<'' | 'sync' | 'signout' | 'guest'>('');
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  if (!auth.session) {
    return (
      <Screen back docTitle="Sign in" width={520}>
        {auth.recovery ? <Recovery /> : <AuthForm initial="signin" />}
      </Screen>
    );
  }

  const signOut = async () => {
    if (learning.dirty && !confirmSignOut) {
      setConfirmSignOut(true);
      return;
    }
    setBusy('signout');
    const { error } = await supabase!.auth.signOut({ scope: 'local' });
    setBusy('');
    if (error) return learning.showToast(error.message);
    // The notebook provider switches to the guest notebook in place and shows the toast.
    router.replace(Platform.OS === 'web' ? '/' : '/today');
  };

  return (
    <Screen back docTitle="Account" title="Account & sync" width={640}>
      {auth.recovery && <Recovery />}
      <Panel>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: c.soft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="user" />
          </View>
          <View style={{ flex: 1 }}>
            <Txt weight="600">{auth.session.user.email}</Txt>
            <Txt size={13} color={c.muted}>
              Signed in · progress syncs across web and Android
            </Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SyncChip />
          <Button
            title={learning.syncStatus === 'syncing' ? 'Syncing…' : 'Sync now'}
            compact
            secondary
            icon="refresh"
            busy={busy === 'sync' || learning.syncStatus === 'syncing'}
            onPress={() => {
              setBusy('sync');
              void learning.syncNow({ announce: true }).finally(() => setBusy(''));
            }}
          />
        </View>
        <Txt size={13} color={c.muted}>
          Changes sync right after you make them and every 30 seconds. Theme and reminders stay on each
          device.
        </Txt>
      </Panel>

      {learning.syncStatus === 'conflict' && (
        <Panel style={{ borderColor: c.danger }}>
          <Section title="Choose the notebook to keep" />
          <Txt>
            Both this device and another one changed since the last sync. Export a backup from Progress first
            if you need both. Both snapshots are also kept in local recovery storage.
          </Txt>
          <Button
            title="Use the cloud version on this device"
            full
            onPress={() => void learning.resolveConflict('cloud')}
          />
          <Button
            title="Replace the cloud with this device"
            secondary
            full
            onPress={() => void learning.resolveConflict('local')}
          />
        </Panel>
      )}

      <Panel>
        <Section title="Guest progress on this device" />
        <Txt size={14} color={c.muted}>
          Progress you made before signing in stays in a separate guest notebook on this device. Merging adds
          it to your account without replacing anything.
        </Txt>
        <Button
          title="Review guest progress"
          secondary
          busy={busy === 'guest'}
          onPress={() => {
            setBusy('guest');
            void learning.reviewGuest().then(found => {
              setBusy('');
              if (!found) learning.showToast('There is no guest progress on this device.');
            });
          }}
        />
      </Panel>

      <Panel>
        <Section title="Sign out" />
        {confirmSignOut ? (
          <>
            <Txt>
              Some changes have not synced yet. They stay saved in this account’s notebook on this device and
              sync the next time you sign in here.
            </Txt>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Button title="Sign out anyway" busy={busy === 'signout'} onPress={() => void signOut()} />
              <Button title="Cancel" secondary onPress={() => setConfirmSignOut(false)} />
            </View>
          </>
        ) : (
          <>
            <Txt size={14} color={c.muted}>
              After signing out, this device shows its guest notebook. Your account notebook stays safe in the
              cloud.
            </Txt>
            <Button
              title="Sign out on this device"
              secondary
              icon="logout"
              busy={busy === 'signout'}
              onPress={() => void signOut()}
            />
          </>
        )}
      </Panel>
      <Button title="Privacy & your data" ghost onPress={() => router.push('/privacy')} />
    </Screen>
  );
}
