import { Redirect } from 'expo-router';
import { AuthForm } from '../components/auth-form';
import { Screen } from '../components/ui';
import { useAuth } from '../lib/auth';

export default function SignIn() {
  const { session } = useAuth();
  if (session) return <Redirect href="/account" />;
  return (
    <Screen back docTitle="Sign in" width={520}>
      <AuthForm initial="signin" />
    </Screen>
  );
}
