import { Redirect } from 'expo-router';

/** The old Path tab is now the Map. Keep the URL working. */
export default function PathRedirect() {
  return <Redirect href="/map" />;
}
