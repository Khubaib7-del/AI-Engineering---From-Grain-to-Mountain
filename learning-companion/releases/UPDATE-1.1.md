# Android 1.1: update and connect

Download `AI-Learning-1.1.0-android-arm64.apk` and `SHA256SUMS.txt` from the [GitHub release](https://github.com/Khubaib7-del/AI-Engineering---From-Grain-to-Mountain/releases/tag/v1.1.0-preview.1). The older 1.0 APK does not support accounts or sync.

1. Export a notebook backup from Progress before updating.
2. Share the APK as a file/document through WhatsApp, USB or another file-transfer method. Open it in Files and update **AI Learning**. Do not uninstall first: uninstalling removes local progress.
3. In Settings → Account & sync, sign in using the same account as the website. New-account confirmation and password-reset links open the website; afterward, return to Android to sign in.
4. To move old local progress into your account, choose **Review guest import**, then explicitly confirm replacement. This replaces the account notebook; export it first if you need both. The original guest notebook stays separate.
5. Check **Sync: Up to date** on both devices. Save a note on one, then use **Sync now** on the other. Edits also sync automatically; foreground/polling checks run every 30 seconds.

Offline edits are saved in local SQLite. When both devices change concurrently, choose the cloud or device version explicitly. Reminder preferences stay local. The bundled curriculum works offline; external course links need internet.

Version 1.1.0/code 2 preserves package `com.khubaib.ailearning` and the 1.0 signing certificate. It targets ARM64 Android 7.0/API 24 or newer, target SDK 36. This is a development-test-signed personal preview, not a Play Store release. The original 1.0 APK was reported working on two phones; 1.1 sync was tested on an Android 14 x86_64 emulator using a separately built package. Updated ARM64 physical-phone sync and notification delivery still require device checks. An APK does not install on an iPhone.

## Rebuild

Configure the public Supabase URL and publishable key in ignored `.env.local`. Never bundle a service-role key. Run `scripts/setup-ninja.ps1` on Windows to install official checksum-verified Ninja 1.13.1 locally. The Expo config plugin applies it to the app and native dependencies; no global SDK binary is replaced.

Generate Android with `npx expo prebuild --platform android --no-install`. Before building an update, restore the original private signing keystore to the generated project; prebuild can regenerate/replace that directory. Never commit the keystore. A different signing identity cannot update the existing installation.

From `android/`, run `gradlew.bat :app:assembleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=2`. Then run `scripts/package-android-preview.ps1` from the app root. Verify the signature, version, bundled JS and ARM64-only libraries. The packaging script derives its filename from `app.json`; the checksum identifies the exact artifact.

`AI-Learning-1.1.0-emulator-x86_64.apk`, if locally generated, is only for testing and is not the phone download. APKs, logs, SDK tools and generated native directories are excluded from Git; distribution uses release attachments.
