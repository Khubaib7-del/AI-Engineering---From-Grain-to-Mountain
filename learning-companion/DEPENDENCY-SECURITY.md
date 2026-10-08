# Dependency security review · 2026-10-07

## Applied fix

Added a scoped npm override for `xcode -> uuid`: 7.0.3 to 11.1.1. This retains CommonJS support and the v4 API Xcode uses. The checked-in lockfile records the resolution. A regression test exercises Xcode's 24-character identifier generator and the patched v5 short-buffer rejection.

Audit findings dropped from 28 (18 high, 10 moderate) to 21 (18 high, 3 moderate). Those numbers include dependent packages affected by a root advisory; they are not 21 independent vulnerabilities. The raw post-fix result is `dependency-audit.json`.

## Remaining blockers

| Root package | Installed | Status |
|---|---|---|
| braces | 3.0.3 | Latest published release; no patched version in the advisory. Pulled through Metro's glob matching. |
| node-forge | 1.4.0 | Latest published release; no patched version in the advisory. Pulled through Expo CLI/certificate tooling. |
| decode-uri-component | 0.2.2 | Patched 0.5.0 exists, but is ESM-only. Router 57 uses query-string 7's callable CommonJS require. A direct override breaks that integration. |

Sources: [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [node-forge advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv), [URI decoder advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr), [UUID advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq). Package registry versions and module formats were checked directly with npm.

The remaining advisories are not suppressed. Expo 44/React Native 0.72 downgrades suggested by audit are incompatible with the current app. Router 58 alone is not installed into SDK 57. An SDK migration needs its own compatibility and native-device verification. A homegrown crypto patch is not substituted for upstream review.

Treat public distribution as pending this review. Keep development servers local and use trusted project glob patterns and certificate inputs; these reduce exposure but do not fix the affected packages. The URI decoder can process navigation input in the app, so it must not be dismissed as build-only.

## Verification

Expo Doctor passed all 21 checks after installation. Run `npm run typecheck`, `npm run lint` and `npm test` to reproduce checks, including the targeted regression. Native signing and an APK/IPA build were not performed by this dependency task.
