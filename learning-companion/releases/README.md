# Android personal preview

`AI-Learning-1.0.0-android-arm64.apk` was built successfully on 8 October 2026 (47,748,479 bytes). Its APK v2 signature verifies and it contains the JavaScript bundle and ARM64 native libraries. See `../VALIDATION.md` for startup-test results and limitations; `SHA256SUMS.txt` identifies this exact file.

## Install a completed APK

1. Transfer `AI-Learning-1.0.0-android-arm64.apk` to your Android phone using USB, a private drive or another file-transfer method. Send it as a file/document, not an image.
2. Open the APK in Files. If Android asks, allow that file manager to install this app, then install.
3. Launch **AI Learning**. The curriculum, notes and progress work locally without the desktop preview or Metro. Linked courses/videos need internet.
4. Reminders require notification permission and are scheduled through Settings. Hardware delivery still needs checking on your phone.

This build targets ARM64 Android devices running Android 7.0 (API 24) or later; target SDK is 36. It is a personal preview signed with the generated development test key, not a Play Store release. Keep backups from Settings before replacing/uninstalling builds. An APK does not install on an iPhone; that requires a separately signed iOS build/distribution route. Physical-phone startup and notification delivery still need verification.

## Rebuild

On Windows, first run `scripts/setup-ninja.ps1`. It installs official Ninja 1.13.1 locally after verifying GitHub's SHA256 digest. The Expo config plugin uses it when present and shortens native staging paths; the SDK's old Ninja 1.10.2 failed on generated filenames longer than 260 characters. No global SDK binary is replaced.

From the application root run `npx expo prebuild --platform android --no-install`, then from `android/` run `gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=2`. Use the installed Java/Android SDK. Expo generates the native project; do not hand-edit generated files. Run `scripts/package-android-preview.ps1` only after success, then validate the APK signature, manifest, bundled JS and native libraries. `SHA256SUMS.txt` identifies the actual artifact.

The current `eas.json` also supports an internal APK via the preview profile when authenticated with Expo. No cloud build or store submission is implied by this local package.
