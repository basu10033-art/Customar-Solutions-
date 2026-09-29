# Customar Solutions — Build APK from Phone

This project includes a GitHub Actions workflow at `.github/workflows/build-apk.yml`.

## From an Android phone
1. Create/sign in to a GitHub account.
2. Create a new repository (for example `customar-solutions`).
3. Upload all files from this ZIP to the repository. Make sure `.github/workflows/build-apk.yml` is uploaded too.
4. Open the repository → **Actions** → **Build Android APK**.
5. Tap **Run workflow** (if needed, first enable Actions).
6. Wait for the workflow to finish with a green check.
7. Open the completed workflow run and scroll to **Artifacts**.
8. Download **Customar-Solutions-debug-apk** and extract it. The APK is `app-debug.apk`.
9. Open the APK on your Android phone and install it.

## Important
- This creates a debug APK for testing.
- If Firebase uses environment variables, add the required GitHub Actions secrets or place the needed public Firebase configuration in the project before building.
- Never commit private API keys, service-account JSON files, passwords, or other secrets to a public repository.
