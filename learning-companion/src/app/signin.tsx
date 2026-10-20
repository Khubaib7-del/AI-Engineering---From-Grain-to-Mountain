import { Redirect } from 'expo-router';
import { AuthForm } from '../components/auth-form';
import { Screen } from '../components/ui';
import { AuthShell } from '../components/auth-shell';
import { useAuth } from '../lib/auth';

export default function SignIn() {
  const { session } = useAuth();
  if (session) return <Redirect href="/account" />;
  return (
    <Screen back docTitle="Sign in" width={1080}>
      <AuthShell title="Sign in">
        <AuthForm initial="signin" />
      </AuthShell>
    </Screen>
  );
}
