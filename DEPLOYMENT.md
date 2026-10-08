# Website and mobile builds

## Vercel

Production: **https://ai-engineering-grain-to-mountain.vercel.app**. Published 8 October 2026 and connected to this GitHub repository. Public browser checks passed for `/`, `/path`, `/session/D001` and `/module/M00`, including mobile overflow and runtime-error checks. GitHub's validation workflow passed on the initial publication.

Import this GitHub repository into Vercel. Leave **Root Directory** at the repository root and Framework Preset at **Other**. The root `vercel.json` installs the locked app dependencies, exports the Expo single-page web app and serves `learning-companion/dist`. Its rewrite supports direct links such as `/path`, `/session/D001` and `/module/M00`.

Production and preview builds now use EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, configured on Vercel. These are public client settings; never expose a service-role key. Web accounts are verified: email confirmation, password recovery, independent browser sync, offline preservation and explicit conflict selection passed. Hosted progress belongs to the signed-in account; reminder settings stay on the device. Guest progress remains local. The published Android 1.0 APK remains local-only. Export a backup in Settings before clearing site storage or moving domains. Course links require internet. Web reminders are not native background notifications.

The bundled content under `learning-companion/src/content` is committed, so Vercel does not need to read the research documents at build time. After editing curriculum data, run `npm run sync-content` inside the app and commit both source and bundled JSON.

To deploy from an authenticated CLI, run `npx vercel --prod` from the repository root. This creates a deployment only after authentication and project selection. A config file alone is not a live deployment.

## Android

Download the APK and SHA256 checksum from the [1.0.0 Android prerelease](https://github.com/Khubaib7-del/AI-Engineering---From-Grain-to-Mountain/releases/tag/v1.0.0-preview.1).

See [personal-preview installation and build instructions](learning-companion/releases/README.md) and [observed validation](learning-companion/VALIDATION.md). APK binaries, signing keys, SDK tools and generated native projects are excluded from Git. Distribute APKs as release attachments rather than source-history blobs. The existing preview uses a development test key and targets ARM64 Android 7.0 or later.

## iOS

The Expo source supports an iOS target, but an iOS build, signing, device testing and distribution have not been completed. Do not describe Android's APK as an iPhone download. See the app's `eas.json` for build profiles; Apple signing/distribution requires the appropriate account and setup.

Reference: [Expo website publishing](https://docs.expo.dev/guides/publishing-websites/).


