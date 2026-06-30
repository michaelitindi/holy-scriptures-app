# Holy Scriptures Mobile App

A clean, premium mobile reading application built to browse and search the Holy Scriptures (including the King James Version with Apocrypha, and the Book of Jasher) offline. The interface is optimized for speed, distraction-free reading, and native gesture-based workflows on both Android and iOS.

## Features

*   **Offline Scripture Library:** Full reading access to the Old Testament, New Testament, Apocrypha, and the Book of Jasher.
*   **Fuzzy & Citation Search:** Instant offline search indexes. Quickly match text phrases or jump straight to exact verses using short-hand citations (e.g., `Gen 1:1`, `John 3:16`, `1 Jn 5:7`).
*   **Tactile Navigation:** Fluid native transitions, animated active bottom tab bar indicators, and physical swipe/tap actions.
*   **Simpler Aesthetics:** Optimized typography with system sans-serif font overrides, clean spacing parameters, and high-contrast night/day modes.
*   **Reader Controls:** Instantly decrease or increase text sizing from the settings section.
*   **Dynamic Progress Routing:** Easy back and forward traversal linking books, chapter picks, and specific verses cleanly.

---

## Technologies Used

*   **Framework:** React 18, TypeScript, and Vite.
*   **Styling:** TailwindCSS with customized premium variables (HSL palettes) for warm gradients and gold-accent styling.
*   **Mobile Wrapper:** Capacitor JS (native engine linking web builds to mobile code bases).
*   **Icons:** Lucide React icons.
*   **Database:** Structured IndexedDB caching layers to speed up startup load times.

---

## Installation & Setup

### Prerequisites
*   Install [Node.js](https://nodejs.org/) (v18 or higher recommended).
*   Install Android Studio (for Android) or Xcode (for iOS on macOS).

To install project dependencies locally, run:
```bash
npm install
```

### Run Locally (Web browser)
To test the web application interface:
```bash
npm run dev
```

---

## Deploying to Android

1.  **Build the Web Application Assets:**
    ```bash
    npm run build
    ```

2.  **Sync Web Assets into the Android Project:**
    ```bash
    npx cap sync android
    ```

3.  **Compile the APK / Bundle:**
    *   Open the `/android` folder in **Android Studio** to run, debug, or generate a signed bundle.
    *   Alternatively, compile a local release APK directly using Gradle:
        ```bash
        cd android
        ./gradlew assembleRelease -x lint
        ```
    *   The generated APK will be available under:  
        `android/app/build/outputs/apk/release/app-release.apk`

---

## Deploying to iOS (macOS required)

1.  **Add the iOS Platform Wrapper:**
    ```bash
    npx cap add ios
    ```

2.  **Build and Sync Web Assets:**
    ```bash
    npm run build
    npx cap sync ios
    ```

3.  **Open the Project in Xcode:**
    ```bash
    npx cap open ios
    ```

4.  **Compile & Run on Device/Simulator:**
    *   In Xcode, select your connected iPhone or a simulator target.
    *   Configure your developer signing profile under **Signing & Capabilities**.
    *   Click the **Play/Build** button to launch or compile the app.
