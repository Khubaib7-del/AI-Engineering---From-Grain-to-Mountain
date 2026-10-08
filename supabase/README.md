# Accounts and notebook sync — setup pending

The client implementation is prepared. No hosted Supabase project or schema has been created yet. OAuth authorization succeeded on 8 October 2026 for the official `https://mcp.supabase.com/mcp` connection, but the running Codex session cannot load newly registered MCP tools until refreshed. Resume project provisioning after reloading Codex; do not mistake OAuth success for a working backend.

## Next implementation steps

1. List organizations/projects through the connected Supabase tools. Create a dedicated free project if available; check the quoted cost before creation. Do not change an unrelated project or purchase a paid plan.
2. Apply `migrations/202610080001_notebooks.sql`. Test actual authenticated and unauthenticated access: account A cannot read/write B, stale revision writes fail, concurrent first writes serialize, oversized/malformed payloads fail.
3. Configure the auth site URL as `https://ai-engineering-grain-to-mountain.vercel.app` and allow `/account` as a confirmation/recovery redirect. Keep email confirmation enabled. Public signup requires a verified email delivery setup: the default Supabase sender is restricted and is not a production SMTP service. Do not claim anyone can sign up until tested.
4. Add the project URL and **publishable** key as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel and in the app's ignored `.env.local` for builds. These are public client settings; never put service-role keys, database passwords or SMTP credentials into Expo variables or Git.
5. Test sign-up/confirmation/sign-in/password recovery, two independent clients syncing one account, offline changes/reconnection, conflicting edits, switching users and guest import against the real backend. Add integration coverage. The current tests cover policy decisions and storage isolation, not real authentication/RLS.
6. Update the public copy after verification. Build a new Android package with these settings and SecureStore; the 1.0 APK remains local-only. iOS still needs signing and a device test. Native account screens have not been simulator-tested yet.

## Sync contract

Each account owns one progress snapshot. Reads use row-level security. Writes go through `save_learning_notebook` with an expected revision and expected authenticated user ID; direct client writes to the table are not granted. A row lock and revision check reject stale overwrites. The app saves locally first and retries every 30 seconds/on foreground. It preserves unsynced data when offline, and keeps guest/accounts in separate storage keys/tables.

Concurrent changes require an explicit choice of cloud or device snapshot. This is intentionally conservative, not automatic field merging. Both versions are stored locally before a choice is applied; exporting a user-readable backup first is recommended. Reminder permission, scheduling preferences and theme never enter the cloud payload. Sign-out hides the local account cache but does not erase it; see the privacy screen for shared-device limits.

## Publication state

The public product homepage is `/`; Today moved to `/today`. Existing `/path`, `/library`, `/progress`, `/session/:id` and `/module/:id` routes remain. `/download` links the existing local-only Android prerelease and labels iOS as coming soon. `/account` is disabled honestly until client configuration exists. The production website remains on the earlier release while the new backend is unverified.

Sources: [Supabase React Native auth](https://supabase.com/docs/guides/auth/quickstarts/react-native), [password flows](https://supabase.com/docs/guides/auth/passwords), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).
