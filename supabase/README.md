# Accounts and notebook sync

Dedicated project: Grain to Mountain, Khubaib7-del's Org, ap-south-1. Reference: pftnuyrgczlxeidhipmu. Created 8 October 2026 at the quoted $0/month cost.

## Verified web behavior

Email signup requires confirmation. The owner received and confirmed the dedicated test account email through the configured Gmail SMTP sender. Password recovery reached the public website; Auth recorded a successful password update and the old test password was rejected.

Two independent API clients verified shared notebook snapshots, stale conflict rejection and wrong-owner denial. Desktop and phone-sized browser sessions using the rebuilt app and hosted backend verified sign-in, synced notes, offline local preservation, explicit cloud conflict selection and sign-out to the guest notebook. Android 1.1 emulator checks also passed actual native/web notes in both directions, secure-session/offline SQLite cold restart, explicit conflict selection, sign-out and guest preservation. Physical-phone sync remains a separate device check. See the app validation record for the test-driver corrections and exact limits.

## Deployment configuration

Site URL: https://ai-engineering-grain-to-mountain.vercel.app
Exact confirmation/recovery redirect: https://ai-engineering-grain-to-mountain.vercel.app/account

Public client variables EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY are configured in Vercel production/preview and ignored local .env.local. Never expose service-role keys, Google app passwords or SMTP credentials in Expo variables or Git. The user entered the SMTP password directly in Supabase. Gmail was selected for this personal app; the dashboard notes it is a personal email provider rather than a dedicated transactional sender.

## Sync contract

Each account owns one progress snapshot. Reads use RLS. Direct client updates and anonymous reads/writes are not granted. Writes use save_learning_notebook with an expected user ID and revision. The function checks auth.uid ownership, locks the row and rejects stale writes. Its intentionally authenticated SECURITY DEFINER interface uses an empty search_path and restricted execution grants.

The original stale response used SQLSTATE 40001. Real API tests exposed the documented PostgREST transaction retry loop. Migration 20261008125444_notebook_conflict_http_status.sql now returns PT409 / HTTP 409. The client recognizes this conflict and disables automatic write retries.

The app saves locally first and retries on foreground/every 30 seconds. Guest and account caches are isolated. Conflicts require choosing cloud or device state; both snapshots are saved locally before replacement. Theme and reminder preferences stay local. Sign-out hides but does not erase the local account cache. See the privacy screen for shared-device limits.

## Checks and remaining native work

- supabase/tests/notebook-access.sql: rollback-only owner, grants, malformed/oversized payload and revision checks; passed remotely.
- learning-companion/scripts/sync-access-check.mjs: Auth reachable, confirmation enabled, anonymous reads/writes denied; passed.
- account-live-check.mjs uses the dedicated +grain-test identity; its original password is invalid after the human recovery test. account-browser-check.mjs also supports --native-fixture for an isolated +grain-native identity. Credentials reside only in ignored local files. Never test with personal learning accounts or commit those files.
- android-web-sync-check.mjs exercises the installed standalone emulator APK and the hosted backend. Seed the old guest notebook with --seed-guest before updating; --account-exit is the focused asynchronous sign-out/guest-preservation check. Wait for account actions to complete before navigation. Keep fixture-mutating browser and native checks sequential.
- Android 1.0 remains local-only. Android 1.1 adds accounts/sync and preserves update signing. SecureStore chunks avoid historical native payload limits; requests are bounded to 15 seconds; a first uncached account pulls before becoming editable. iOS still requires signing, device testing and distribution.

Sources: [SMTP requirements](https://supabase.com/docs/guides/auth/auth-smtp), [password flows](https://supabase.com/docs/guides/auth/passwords), [PostgREST retry-loop fix](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b), [intentional privileged RPC advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
