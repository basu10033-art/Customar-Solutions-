# Customar Solutions — Android APK Build

This project is prepared to package the existing React/Vite app as an Android app using Capacitor.

## Requirements
- Node.js 20+
- Android Studio + Android SDK
- Java 17+

## Build

```bash
npm install
npm run build:mobile
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

The debug APK will normally be at:

`android/app/build/outputs/apk/debug/app-debug.apk`

For later updates:

```bash
npm run build:mobile
npx cap sync android
```

The app keeps the existing web/Firebase architecture, so it can use the same online Firebase backend as the web version.
