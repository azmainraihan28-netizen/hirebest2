# HireBest Android app

A [Capacitor](https://capacitorjs.com) shell that opens **https://hirebest.online**
full-screen as a native Android app. Because the app loads the live site,
every website deploy updates the app too — no new APK needed for content or
feature changes.

| | |
|---|---|
| App name | HireBest |
| Package ID | `online.hirebest.app` |
| Version | 1.0 (versionCode 1) — `android/app/build.gradle` |
| Min Android | 7.0 (API 24) |

## Get the APK (no local setup)

Every push that touches `mobile/` runs **GitHub Actions → Android app**.
Open the run, scroll to **Artifacts**, download `hirebest-debug-apk`, unzip,
and install `app-debug.apk` on a phone (allow "Install unknown apps").
You can also start a build by hand: Actions → Android app → Run workflow.

## One-time setup

1. **Supabase redirect URL (needed for Google / SSO login in the app).**
   Supabase dashboard → Authentication → URL Configuration → Redirect URLs →
   add `online.hirebest.app://auth/callback`.
   Google refuses to sign in inside an embedded WebView, so the app opens
   Google sign-in in the phone's browser and returns through that deep link
   (`src/lib/native.ts`). Email + password login works without this step.

2. **Play Store signing (only when you're ready to publish).** Create a key once
   and keep it safe — losing it means you can never update the app:

   ```bash
   keytool -genkey -v -keystore hirebest-release.jks -alias hirebest \
     -keyalg RSA -keysize 2048 -validity 10000
   base64 -w0 hirebest-release.jks   # copy the output
   ```

   Add these GitHub secrets (Settings → Secrets and variables → Actions):
   `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`,
   `ANDROID_KEY_PASSWORD`. The workflow then also produces a signed `.aab`
   (upload this to Play Console) in the `hirebest-release` artifact.

## Local development

Needs Node 22, JDK 21 and Android Studio (Android SDK 36).

```bash
cd mobile
npm install
npx cap sync android
npx cap open android        # opens Android Studio → Run ▶
npm run build:debug         # or build from the command line
```

- Change the icon/splash: replace the files in `assets/`, then `npm run icons`.
- Release a new app version: bump `versionCode` and `versionName` in
  `android/app/build.gradle` (only needed for native changes or Play updates).
- `www/offline.html` is shown when the phone has no internet.
