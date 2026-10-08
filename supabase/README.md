# Accounts and notebook sync — integration in progress

The dedicated **Grain to Mountain** project was created on 8 October 2026 in **Khubaib7-del's Org**, region **ap-south-1**, at the quoted cost of **$0/month**. Project reference: `pftnuyrgczlxeidhipmu`. The notebook migration is applied and the ignored local environment is configured with the public client settings.

Database transaction checks passed for owner isolation, stale revision rejection and malformed payload rejection. Test fixtures were rolled back. Anonymous reads/writes and direct authenticated updates are not granted. These checks do not establish working email delivery or cross-device authentication.

## Next implementation steps

1. Project provisioning is complete. Keep this dedicated project separate from unrelated projects; do not purchase a paid plan without authorization.
2. Migration is applied. Ownership, stale revision and malformed payload checks passed with transaction fixtures. Oversized payload rejection also passed with zero partial rows. Still test concurrent first writes.
3. Saved the auth site URL as `https://ai-engineering-grain-to-mountain.vercel.app` and allowed the exact `/account` confirmation/recovery redirect in the dashboard. Keep email confirmation enabled. Public signup requires a verified email delivery setup: the default Supabase sender is restricted and is not a production SMTP service. Do not claim anyone can sign up until tested.
4. Add the project URL and **publishable** key as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel (production and preview are configured); the app's ignored `.env.local` is configured for local builds. These are public client settings; never put service-role keys, database passwords or SMTP credentials into Expo variables or Git.
5. Test sign-up/confirmation/sign-in/password recovery, two independent clients syncing one account, offline changes/reconnection, conflicting edits, switching users and guest import against the real backend. Add integration coverage. The current tests cover policy decisions and storage isolation, not real authentication/RLS.
6. Update the public copy after verification. Build a new Android package with these settings and SecureStore; the 1.0 APK remains local-only. iOS still needs signing and a device test. Native account screens have not been simulator-tested yet.

## Sync contract

Each account owns one progress snapshot. Reads use row-level security. Writes go through `save_learning_notebook` with an expected revision and expected authenticated user ID; direct client writes to the table are not granted. A row lock and revision check reject stale overwrites. The app saves locally first and retries every 30 seconds/on foreground. It preserves unsynced data when offline, and keeps guest/accounts in separate storage keys/tables.

Concurrent changes require an explicit choice of cloud or device snapshot. This is intentionally conservative, not automatic field merging. Both versions are stored locally before a choice is applied; exporting a user-readable backup first is recommended. Reminder permission, scheduling preferences and theme never enter the cloud payload. Sign-out hides the local account cache but does not erase it; see the privacy screen for shared-device limits.

## Publication state

The public product homepage is `/`; Today moved to `/today`. Existing `/path`, `/library`, `/progress`, `/session/:id` and `/module/:id` routes remain. `/download` links the existing local-only Android prerelease and labels iOS as coming soon. `/account` is connected to the configured backend and displays an accounts-preview notice. The product/account UI is being published with an explicit accounts-preview notice. This does not certify email flows or cross-device sync.

Sources: [Supabase React Native auth](https://supabase.com/docs/guides/auth/quickstarts/react-native), [password flows](https://supabase.com/docs/guides/auth/passwords), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).


The security advisor reports the intentionally authenticated SECURITY DEFINER write endpoint. It remains an explicit ownership-checked interface; generic callers cannot write other users' notebooks. Review: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable



