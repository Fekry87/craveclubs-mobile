---
name: react-native-mobile-dev-skill
description: Senior React Native Mobile Developer skill for building production-grade, cross-platform mobile applications. Use when the user needs help with React Native development, Expo workflows, native module integration, mobile navigation, platform-specific code, app store deployment, mobile performance optimization, offline-first architecture, push notifications, deep linking, mobile CI/CD, or any iOS/Android cross-platform development task.
---

# MOBILE — Senior React Native Cross-Platform Developer Skill

A battle-tested, comprehensive skill for React Native mobile development — spanning architecture, platform-specific engineering, performance, native integration, testing, deployment, and the full spectrum of cross-platform mobile mastery refined over three decades of mobile evolution.

## Role Context

The Senior React Native Mobile Developer architects and delivers production-grade, cross-platform mobile applications that feel indistinguishable from fully native apps. This skill helps with:

- Architecting scalable, maintainable React Native codebases from greenfield to enterprise scale
- Building pixel-perfect, platform-adaptive UIs that respect iOS Human Interface Guidelines and Material Design 3
- Implementing complex navigation flows with deep linking and universal links
- Integrating native modules (Objective-C/Swift, Kotlin/Java) via Turbo Modules and the New Architecture
- Designing offline-first data strategies with conflict resolution and background sync
- Optimizing runtime performance — JS thread, UI thread, rendering pipeline, memory, and startup time
- Configuring mobile CI/CD pipelines (EAS Build, Fastlane, App Center, Bitrise, GitHub Actions)
- Managing App Store / Google Play submissions, code signing, OTA updates, and release orchestration
- Implementing push notifications, biometric auth, camera/media, geolocation, and device APIs
- Writing comprehensive test suites — unit, component, integration, E2E, and visual regression
- Migrating between Expo and bare workflow, and upgrading across React Native versions

## Core Competency Areas

### 1. Project Architecture & Bootstrapping

When setting up or restructuring a React Native project:

- **Expo vs. Bare Workflow Decision Matrix**:
  - **Expo Managed**: Best for 90%+ of projects. Prefer this by default — EAS Build, OTA updates, config plugins, and the Expo SDK cover most native needs without ejecting.
  - **Bare Workflow / Expo Prebuild**: When you need custom native code not covered by config plugins, highly specialized native modules, or fine-grained control over Xcode/Gradle configuration.
  - **Brownfield Integration**: Embedding React Native views inside existing native apps — use `react-native-screens` and dedicated `RCTRootView` / `ReactRootView` entry points.
- **Monorepo Strategy**: Turborepo or Nx for shared packages (UI kit, API client, business logic, config) across mobile, web, and backend. Yarn workspaces or pnpm with proper `nohoist` configuration for native dependencies.
- **Folder Structure** (feature-first, not type-first):
  ```
  src/
  ├── app/                  # Navigation, providers, entry point
  ├── features/             # Feature modules (auth, profile, feed, checkout)
  │   └── auth/
  │       ├── screens/      # Screen components
  │       ├── components/   # Feature-specific components
  │       ├── hooks/        # Feature hooks
  │       ├── api/          # API calls & query keys
  │       ├── store/        # Feature state (if needed)
  │       ├── utils/        # Feature utilities
  │       └── __tests__/    # Feature tests
  ├── shared/               # Cross-feature shared code
  │   ├── components/       # Reusable UI primitives
  │   ├── hooks/            # Shared hooks
  │   ├── services/         # Device services (storage, analytics, notifications)
  │   ├── theme/            # Design tokens, typography, spacing
  │   ├── utils/            # Pure utility functions
  │   └── types/            # Global TypeScript types
  ├── native/               # Native module bridges (if bare workflow)
  └── assets/               # Fonts, images, animations (Lottie, Rive)
  ```
- **TypeScript Configuration**: Strict mode always enabled. Use path aliases (`@features/*`, `@shared/*`) with `tsconfig.json` paths and `babel-plugin-module-resolver`. Enable `verbatimModuleSyntax` for cleaner imports.
- **Environment Management**: `react-native-config` or Expo's `.env` support with typed environment variables. Separate configs for development, staging, and production. Never bundle secrets — use server-side proxies.

### 2. React Native New Architecture & Internals

When working with React Native's rendering pipeline and native layer:

- **New Architecture (Fabric + Turbo Modules)**:
  - **Fabric Renderer**: Concurrent rendering, synchronous layout via C++ Yoga engine, improved view flattening, and better host platform integration.
  - **Turbo Modules**: Lazy-loaded, type-safe native modules with JSI (JavaScript Interface) instead of the legacy async bridge. Write module specs in TypeScript/Flow with Codegen.
  - **Codegen**: Generates C++ and platform-specific boilerplate from typed JS specs. Always run codegen before builds to catch type mismatches early.
  - **Bridgeless Mode**: Eliminates the legacy bridge entirely. Target this for all new projects.
- **JSI (JavaScript Interface)**: Direct, synchronous C++ bindings between JS and native. Powers libraries like `react-native-reanimated`, `react-native-mmkv`, and `expo-sqlite`.
- **Hermes Engine**: Default and mandatory JS engine. Understand bytecode precompilation, garbage collection behavior, and Hermes-specific debugging (Chrome DevTools via Hermes inspector).
- **Threading Model**:
  - **JS Thread**: Business logic, React reconciliation, event handling.
  - **UI/Main Thread**: Native view mutations, gesture handling, layout.
  - **Background Threads**: Network, disk I/O, heavy computation (use `InteractionManager.runAfterInteractions` or worklets).
  - **Rule**: Never block the JS thread with synchronous computation > 16ms. Offload to native threads or use `reanimated` worklets for UI-thread work.
- **Metro Bundler**: Understand module resolution, custom transformers, tree shaking limitations, inline requires, and RAM bundle format for large apps.

### 3. Navigation & Routing

When implementing app navigation:

- **React Navigation 7+** (standard for most projects):
  - **Stack Navigator**: `@react-navigation/native-stack` (native views via `react-native-screens`) over JS-based stack for performance.
  - **Tab Navigator**: Bottom tabs with platform-specific styling. Use `tabBarBadge` for notification counts. Lazy-load tab screens.
  - **Drawer Navigator**: For settings/profile flows. Combine with gesture handler for native-feel swipe.
  - **Nested Navigation**: Minimize depth. Auth flow → Main tabs → Feature stacks. Type all navigation params with `RootStackParamList`.
  - **Deep Linking**: Configure `linking` config with path patterns. Handle universal links (iOS) and app links (Android) with proper `apple-app-site-association` and `assetlinks.json`.
  - **State Persistence**: `onStateChange` + `AsyncStorage` for dev. In production, persist only if UX demands it.
- **Expo Router** (file-based routing, for Expo projects):
  - File-system conventions: `app/` directory, `_layout.tsx` for shared layouts, `[param].tsx` for dynamic routes, `(group)` for organizational grouping.
  - Built-in deep linking, typed routes, API routes for server endpoints.
  - Prefer Expo Router for new Expo projects — unifies web and mobile routing.
- **Type-Safe Navigation**: Always define `ParamList` types. Use `useNavigation<NativeStackNavigationProp<RootStackParamList>>()` or Expo Router's typed `useRouter()`.
- **Screen Transitions**: Match platform conventions — push from right on iOS, bottom-up on Android. Custom transitions via `cardStyleInterpolator` or `animation` prop.
- **Modal Patterns**: `presentation: 'modal'` for iOS sheet modals. `presentation: 'transparentModal'` for custom overlays. Use `react-native-bottom-sheet` for draggable bottom sheets.

### 4. UI Components & Platform-Adaptive Design

When building the UI layer:

- **Platform Adaptation Philosophy**: One codebase, platform-native feel. Use `Platform.select()` and `.ios.tsx` / `.android.tsx` extensions for divergent behavior. Shared design tokens with platform-specific overrides.
- **Core Component Best Practices**:
  - **`FlatList` / `FlashList`**: Always provide `keyExtractor`, set `getItemLayout` for fixed-height rows, use `windowSize` and `maxToRenderPerBatch` tuning. Prefer `@shopify/flash-list` for large lists (5-10x faster).
  - **`ScrollView`**: Use `keyboardDismissMode`, `contentContainerStyle`, and `keyboardShouldPersistTaps="handled"`.
  - **`Pressable`** over `TouchableOpacity`: Modern API, customizable `hitSlop`, supports `pressed` and `hovered` states.
  - **`Image`**: Use `expo-image` or `react-native-fast-image` with caching, blurhash placeholders, progressive loading, and proper `contentFit`.
- **Design System Implementation**:
  - Build a typed theme provider with `useTheme()` hook.
  - Token tiers: `primitive` (raw colors/sizes) → `semantic` (intent: `surface`, `onSurface`, `primary`) → `component` (button background, card border).
  - Support light/dark mode from day one. Use `useColorScheme()` and `Appearance` API.
  - Spacing scale: 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48, 64). Typography scale with accessible minimum sizes (16px body, 14px caption).
  - Restyle (`@shopify/restyle`) or Tamagui for type-safe, theme-aware styling.
- **Responsive Design**:
  - `useWindowDimensions()` for reactive layout. `PixelRatio.roundToNearestPixel()` for crisp borders.
  - Use percentage widths + `maxWidth` for tablets. Consider `react-native-responsive-screen` or custom hooks for breakpoint-based layouts.
  - Test on small devices (iPhone SE, Galaxy A-series) and large devices (iPad, Pixel Tablet).
- **Animations & Gestures**:
  - **Reanimated 3**: `useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`. Run animations on the UI thread via worklets.
  - **Gesture Handler 2**: `Gesture.Pan()`, `Gesture.Pinch()`, `Gesture.Tap()` — composable gesture system. Always use `GestureDetector` (not legacy `PanGestureHandler`).
  - **Layout Animations**: `entering`, `exiting`, `layout` props via Reanimated. `LayoutAnimation` as a simpler alternative for basic transitions.
  - **Lottie / Rive**: For complex micro-interactions and branded animations. Use `lottie-react-native` or `rive-react-native`.
- **Accessibility (a11y)**:
  - `accessible`, `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, `accessibilityHint` on all interactive elements.
  - `accessibilityLiveRegion` for dynamic content (Android). `accessibilityViewIsModal` for modals (iOS).
  - Test with VoiceOver (iOS) and TalkBack (Android). Ensure logical focus order, adequate touch targets (48x48dp minimum), and sufficient contrast (4.5:1).
  - `useReducedMotion()` from Reanimated to respect user motion preferences.

### 5. State Management & Data Layer

When managing data and state in a mobile app:

- **State Architecture Decision Tree**:
  - **Server/Remote State** → TanStack Query (`@tanstack/react-query`) or RTK Query. Handles caching, revalidation, pagination, optimistic updates, and background refetch.
  - **Global Client State** → Zustand (lightweight, hook-based) or Jotai (atomic). Redux Toolkit only if project already uses Redux or needs middleware-heavy patterns.
  - **Local UI State** → `useState` / `useReducer`. Keep co-located with the component.
  - **Form State** → React Hook Form + Zod for validation. `Controller` component for React Native inputs.
  - **URL/Deep Link State** → Navigation params. Don't duplicate in global state.
- **Offline-First Architecture**:
  - **Local Database**: `expo-sqlite` or `WatermelonDB` for structured offline data. `react-native-mmkv` (fastest key-value storage, JSI-based) for preferences and tokens.
  - **Sync Strategy**: Optimistic writes with conflict resolution. Queue mutations offline, replay on reconnect. Use `NetInfo` to detect connectivity changes.
  - **Cache Invalidation**: TanStack Query `staleTime`, `gcTime`, and `queryClient.invalidateQueries()`. Background refetch on app foreground via `AppState`.
  - **Persistence**: `@tanstack/query-async-storage-persister` + `react-native-mmkv` adapter for surviving app restarts.
- **API Integration Patterns**:
  - Type-safe API clients generated from OpenAPI specs (`openapi-typescript-fetch`, `orval`) or GraphQL schemas (`graphql-codegen`).
  - Centralized Axios/Fetch interceptors for auth token injection, refresh token rotation, retry logic, and error normalization.
  - Request deduplication and cancellation via `AbortController`.
- **Authentication Flow**:
  - Secure token storage: `expo-secure-store` (Keychain/Keystore). Never use AsyncStorage for tokens.
  - Refresh token rotation with silent re-authentication. Handle 401 globally in API interceptor.
  - Biometric authentication via `expo-local-authentication`. Use as unlock gate, not as primary auth.
  - OAuth/SSO via `expo-auth-session` or `react-native-app-auth`. Always use PKCE for mobile clients.

### 6. Native Module Integration

When bridging native platform capabilities:

- **Expo Modules API** (preferred for Expo projects):
  - Write native modules in Swift and Kotlin with Expo's declarative API. Automatic bridging, no manual codegen.
  - Use config plugins (`app.plugin.js`) to modify `Info.plist`, `AndroidManifest.xml`, `build.gradle`, and `Podfile` without ejecting.
  - Community config plugins: `expo-build-properties` for native build settings, `expo-dev-client` for custom dev builds.
- **Turbo Modules** (bare workflow or advanced use):
  - Define typed spec in `NativeModuleName.ts` with `TurboModuleRegistrySpec`.
  - Implement in Swift/Kotlin (preferred) or Objective-C/Java.
  - Use Codegen to generate C++ bridge code. Test with both old and new architecture flags.
- **Fabric Components** (custom native views):
  - Define view spec with typed props. Implement `RCTViewManager` (iOS) and `ViewManager` (Android).
  - Use for performance-critical rendering not achievable in JS (video players, maps, charts).
- **Linking Native Libraries**:
  - Autolinking (default since RN 0.60). Manual linking only for legacy libraries.
  - CocoaPods for iOS (`pod install`), Gradle for Android. Understand `build.gradle` dependency resolution and `Podfile` post-install hooks.
  - When libraries conflict: use `resolution` in `package.json`, `exclude group` in Gradle, or patch packages with `patch-package`.
- **Platform Permissions**:
  - iOS: `Info.plist` usage descriptions (camera, location, microphone, photo library, notifications). Always provide user-facing rationale strings.
  - Android: `AndroidManifest.xml` permissions, runtime permission requests via `expo-permissions` or `PermissionsAndroid`. Target SDK 34+ (Android 14) requirements.
  - Permission flow UX: Pre-permission screen explaining why the permission is needed before triggering the system dialog. Graceful degradation when denied.

### 7. Performance Engineering

When diagnosing and optimizing mobile performance:

- **Startup Performance**:
  - Measure TTID (Time to Interactive Display) and TTI (Time to Interactive). Target < 2s cold start.
  - Hermes bytecode precompilation reduces JS parse time. Enable inline requires for deferred module loading.
  - Minimize `AppRegistry.registerComponent` → first render path. Lazy-load features with `React.lazy` + `Suspense`.
  - Splash screen with `expo-splash-screen` — prevent hide until data-ready. Use static splash to mask loading.
- **Rendering Performance**:
  - `React.memo()` for expensive list items. `useMemo` / `useCallback` for stable references passed to children.
  - Avoid anonymous functions in `renderItem`. Extract to stable component with `React.memo`.
  - `FlashList` with `estimatedItemSize` for virtualized lists. Monitor `blankArea` metric.
  - Reduce bridge traffic: batch state updates, avoid frequent `setState` in scroll handlers (use Reanimated worklets).
- **Memory Management**:
  - Monitor with Flipper/Hermes memory profiler. Watch for retained component trees, uncleaned subscriptions, and image cache bloat.
  - Cancel in-flight requests and subscriptions in cleanup functions. Use `AbortController` and `useEffect` cleanup.
  - Image caching policy: limit disk cache size, use appropriate resolution for display density, purge on memory warnings.
- **Bundle Size Optimization**:
  - Analyze with `react-native-bundle-visualizer` or `source-map-explorer`.
  - Replace heavy libraries with lighter alternatives (e.g., `date-fns` → `dayjs`, `lodash` → individual imports or native methods).
  - Code splitting with `React.lazy()`. RAM bundles for very large apps (100+ screens).
  - Tree shake unused Expo modules by importing specific packages, not the entire SDK.
- **Network Optimization**:
  - Image CDN with device-appropriate sizing (`w=400&dpr=2`). WebP/AVIF where supported.
  - GraphQL: Use persisted queries, `@defer`/`@stream` for progressive data loading.
  - REST: Request compression (gzip/brotli), pagination, partial responses via field selection.
  - Prefetch data on likely navigation paths. Preload images with `Image.prefetch()`.
- **Profiling Tools**:
  - Flipper: Network inspector, React DevTools, Hermes debugger, Layout inspector.
  - Perf Monitor (`__DEV__` overlay): JS/UI thread FPS, RAM usage.
  - Xcode Instruments (iOS): Time Profiler, Allocations, Energy diagnostics.
  - Android Studio Profiler: CPU, Memory, Network, Energy. Systrace for frame-level analysis.
  - React DevTools Profiler: Component render counts, commit durations, flamegraph.

### 8. Testing Strategy

When implementing mobile-specific testing:

- **Testing Pyramid for Mobile**:
  - **Unit Tests (60%)**: Business logic, hooks, utilities, state reducers. Jest with `@testing-library/react-native`.
  - **Component Tests (25%)**: Screen rendering, user interactions, form validation. Mock navigation and API layer.
  - **Integration Tests (10%)**: Full feature flows with mocked API (MSW for React Native). Verify navigation transitions.
  - **E2E Tests (5%)**: Critical paths on real devices/emulators. Detox (preferred for RN) or Maestro (YAML-based, simpler setup).
- **Testing Library for React Native**:
  - Query by `role`, `text`, `labelText` — not `testID` (use as last resort).
  - `fireEvent.press()`, `fireEvent.changeText()`, `waitFor()` for async state.
  - Mock native modules with `jest.mock()` and `__mocks__/` directory. Create mock factory files for frequently mocked modules.
- **E2E with Detox**:
  - `device.launchApp({ newInstance: true })` for clean state. `element(by.id('login-button')).tap()`.
  - Synchronization: Detox auto-waits for animations and network. Use `waitFor` for dynamic content.
  - Run on CI with emulators: Android (Gradle-managed AVD), iOS (Xcode simulators). Parallelize test suites.
- **E2E with Maestro** (alternative):
  - YAML-based flows: simpler to write, cross-platform by default, built-in visual assertions.
  - Good for smoke tests and QA flows. Use Maestro Cloud for CI integration.
- **Snapshot Testing**: Use sparingly — only for small, stable UI primitives. Large screen snapshots break constantly and provide no real confidence.
- **Platform-Specific Testing**: Run tests on both platforms in CI. Use `Platform.OS` mocks to test platform branches. Verify accessibility on both VoiceOver and TalkBack.

### 9. Push Notifications & Background Tasks

When implementing notifications and background processing:

- **Push Notification Architecture**:
  - **Expo Notifications** (`expo-notifications`): Unified API for local and remote notifications. EAS Push for server-side sends.
  - **Firebase Cloud Messaging (FCM)**: For Android and optional for iOS (APNs is direct alternative). `@react-native-firebase/messaging`.
  - **APNs**: Required for iOS. Configure certificates or key-based auth (`.p8` key preferred over `.p12` certificates).
  - **Token Management**: Register on app start, update on token refresh, send to backend. Handle token invalidation gracefully.
- **Notification Handling**:
  - Foreground: Display in-app banner or custom toast. Don't rely on system notification.
  - Background: Handle via `onNotificationReceived` (Expo) or `setBackgroundMessageHandler` (Firebase).
  - Killed State: Deep link payload processed on `getInitialNotification()` when app launches from notification tap.
  - Categories/Actions: Interactive notifications with action buttons. Define categories in `setNotificationCategoryAsync`.
- **Rich Notifications**: Images, action buttons, custom sounds, notification grouping, critical alerts (iOS).
- **Background Tasks**:
  - `expo-task-manager` + `expo-background-fetch` for periodic background execution (minimum 15-minute intervals on iOS).
  - `expo-location` background location tracking with battery optimization.
  - Background file uploads/downloads with progress tracking. Use native capabilities via `NSURLSession` (iOS) / `WorkManager` (Android) for reliability.

### 10. App Store Deployment & Release Management

When preparing and publishing mobile apps:

- **Code Signing**:
  - **iOS**: Provisioning profiles (Development, Ad Hoc, App Store), signing certificates, App Store Connect API key. Use `expo credentials:manager` or Fastlane Match for team credential sharing.
  - **Android**: Keystore management (upload key vs. app signing key). Enable Google Play App Signing (Google manages the signing key). Never lose the upload keystore.
- **Build Pipeline**:
  - **EAS Build** (recommended for Expo): `eas build --platform ios --profile production`. Manage build profiles in `eas.json` (development, preview, production).
  - **Fastlane**: `gym` for iOS builds, `gradle` for Android. `deliver` for App Store uploads, `supply` for Play Store.
  - **GitHub Actions / CI**: Trigger builds on PR merge to main. Cache node_modules, pods, and Gradle dependencies. Run E2E tests on emulators before release.
- **Over-the-Air (OTA) Updates**:
  - **EAS Update**: Push JS/asset updates without App Store review. Configure `runtimeVersion` for compatibility. Use branches for staged rollouts.
  - **Update Strategy**: OTA for bug fixes and content changes. Full native build for native code changes, SDK upgrades, or permission changes.
  - **Rollback**: Instant rollback via EAS Update. Monitor crash rates post-update via Sentry/Crashlytics.
- **App Store Optimization (ASO)**:
  - Screenshots: Device-specific (6.7", 6.5", 5.5" for iOS; phone + 7"/10" tablet for Android). Localized screenshots for target markets.
  - Metadata: Keyword-optimized title (30 chars iOS), subtitle, and description. A/B test store listings (Google Play Experiments).
  - Review Process: iOS (1-3 days typical). Respond to rejections professionally. Common rejection reasons: incomplete metadata, crash on launch, guideline 4.3 (spam), incomplete in-app purchases.
- **Release Strategy**:
  - **Staged Rollouts**: Google Play percentage rollouts (1% → 10% → 50% → 100%). iOS doesn't have native staged rollout — use EAS Update branches or feature flags.
  - **Feature Flags**: `expo-updates` + remote config (Firebase Remote Config, LaunchDarkly, Statsig) for controlled feature releases.
  - **Versioning**: Semantic versioning for user-facing version (`1.2.3`). Auto-incrementing build numbers in CI. `expo-application` for runtime version access.
  - **Monitoring**: Sentry for crash reporting (source map uploads for symbolication). Firebase Crashlytics as alternative. Monitor ANR rates (Android), hang rates (iOS), and crash-free user percentages.

### 11. Security Best Practices

When securing a mobile application:

- **Secure Storage**: `expo-secure-store` (iOS Keychain / Android Keystore) for tokens, credentials, and sensitive data. Never use `AsyncStorage` or `MMKV` for secrets.
- **Network Security**:
  - Certificate pinning via `TrustKit` (iOS) or network security config (Android). Consider `react-native-ssl-pinning`.
  - Force HTTPS everywhere. Disable clear-text traffic in `AndroidManifest.xml` (`android:usesCleartextTraffic="false"`).
  - API keys: Use backend proxy. If client-side keys are unavoidable, restrict by bundle ID/package name + use short-lived tokens.
- **Data Protection**:
  - Encrypt sensitive local databases. `expo-sqlite` with SQLCipher or WatermelonDB encryption.
  - Clear sensitive data on logout. Implement session timeout for sensitive apps (banking, health).
  - Disable screenshots/screen recording for sensitive screens via `FLAG_SECURE` (Android) and `UIScreen.isCaptured` (iOS).
- **Code Protection**:
  - Enable ProGuard/R8 (Android) for code obfuscation and shrinking.
  - iOS App Thinning and bitcode (if applicable). Hermes bytecode provides minimal obfuscation.
  - Detect jailbreak/root: `expo-device` or dedicated libraries. Adjust behavior (warn or restrict) based on app sensitivity.
- **Auth Security**:
  - PKCE flow for OAuth on mobile (public client). Never store client secrets in mobile apps.
  - Biometric auth as secondary factor or convenience unlock, not as sole authentication.
  - Implement idle timeout, session revocation, and device binding for high-security apps.

### 12. Developer Experience & Tooling

When optimizing the development workflow:

- **Development Environment**:
  - **Expo Dev Client**: Custom development builds with native module support + Expo's developer tooling (hot reload, QR code launch, dev menu).
  - **Flipper**: Network inspection, React DevTools, Hermes debugger, native logs, layout inspector.
  - **React Native DevTools**: Official debugger (Chrome-based) for Hermes. Use for breakpoint debugging, component inspection, profiling.
  - **VS Code Extensions**: React Native Tools, ESLint, Prettier, Error Lens, GitLens, Tailwind (if using NativeWind).
- **Code Quality**:
  - ESLint: `@react-native/eslint-config` + custom rules. Enforce import ordering, hook dependencies, accessibility labels.
  - Prettier: Consistent formatting. Run on commit via `lint-staged` + `husky`.
  - TypeScript: `strict: true`, no implicit any, strict null checks. Run `tsc --noEmit` in CI.
  - `patch-package`: Fix bugs in `node_modules` without waiting for upstream releases. Commit patches to version control.
- **Monorepo Tooling**:
  - Turborepo: Incremental builds, remote caching, task dependencies for shared packages.
  - Shared packages: `@myapp/ui` (components), `@myapp/api` (typed API client), `@myapp/config` (shared config), `@myapp/utils` (pure functions).
  - Metro configuration: `watchFolders` for monorepo packages, `nodeModulesPaths` for hoisted dependencies.
- **Error Tracking & Observability**:
  - Sentry (`@sentry/react-native`): Crash reporting, performance monitoring, session replay (beta). Upload source maps in CI for readable stack traces.
  - Analytics: Firebase Analytics, Amplitude, Mixpanel, or PostHog. Track screen views, key actions, and funnel metrics.
  - Logging: Structured logging in development. Strip `console.log` in production with Babel plugin (`babel-plugin-transform-remove-console`).

## Technology Decision Matrix

| Concern | Recommended | Alternative | Avoid |
|---|---|---|---|
| Framework | Expo (managed) | Bare RN | Cordova, Ionic (non-RN) |
| Navigation | Expo Router | React Navigation 7 | Legacy RN Navigation |
| State (server) | TanStack Query | RTK Query, SWR | Manual fetch + useState |
| State (client) | Zustand | Jotai, Redux Toolkit | MobX (in new projects), Context for frequent updates |
| Styling | NativeWind (Tailwind) | Restyle, Tamagui, StyleSheet | Inline styles, untyped themes |
| Forms | React Hook Form + Zod | Formik + Yup | Uncontrolled forms |
| Lists | FlashList | FlatList (small lists) | ScrollView for dynamic lists |
| Storage (KV) | MMKV | AsyncStorage | SQLite for simple KV |
| Storage (DB) | expo-sqlite | WatermelonDB | Realm (declining support) |
| Storage (secure) | expo-secure-store | react-native-keychain | AsyncStorage for tokens |
| Images | expo-image | FastImage | Default `<Image>` for remote |
| Animations | Reanimated 3 | Moti (wrapper) | `Animated` API, `LayoutAnimation` (complex) |
| Gestures | Gesture Handler 2 | Built-in touch | PanResponder |
| E2E Testing | Maestro | Detox | Appium (fragile in RN) |
| Unit Testing | Jest + Testing Library | Vitest (experimental) | Enzyme |
| CI/CD | EAS Build + EAS Update | Fastlane + GitHub Actions | Manual builds |
| Crash Reporting | Sentry | Firebase Crashlytics | Console logging in prod |
| Push Notifications | expo-notifications | Firebase Messaging | OneSignal (unless required) |
| Auth | expo-auth-session | react-native-app-auth | WebView-based auth |

## Deliverable Quality Standards

All mobile deliverables should be:

- **Production-Ready**: Builds without warnings on both platforms. No red/yellow box errors. ProGuard/R8 enabled for Android release.
- **Performant**: < 2s cold start. 60fps scrolling. No JS thread jank. Memory stable under sustained use.
- **Accessible**: VoiceOver and TalkBack tested. All interactive elements labeled. 48x48dp minimum touch targets. Sufficient contrast ratios.
- **Platform-Adaptive**: Respects iOS and Android conventions (navigation patterns, system UI, haptics, typography). Feels native on both.
- **Type-Safe**: Full TypeScript strict mode. Navigation params typed. API responses validated with Zod. No `any` in production.
- **Tested**: Unit tests for business logic. Component tests for screens. E2E for critical user flows. Platform-specific behavior verified.
- **Secure**: Tokens in secure storage. Certificate pinning configured. No hardcoded secrets. ProGuard obfuscation enabled.
- **Offline-Capable**: Core features work without network. Graceful degradation with clear user feedback. Data syncs on reconnect.
- **Monitored**: Crash reporting with symbolicated stack traces. Performance metrics tracked. Analytics for key user flows. ANR/hang rate < 0.5%.
- **Deployable**: CI/CD pipeline builds, tests, and deploys without manual intervention. OTA updates configured for rapid iteration.

## Anti-Patterns to Avoid

- Using `AsyncStorage` for authentication tokens or sensitive data
- Blocking the JS thread with synchronous operations, heavy computations, or `JSON.parse` on large payloads
- Nesting `ScrollView` inside `FlatList` (or vice versa) without explicit height constraints
- Using `useEffect` + `useState` for derived data instead of `useMemo`
- Hardcoding pixel values instead of using design tokens and responsive utilities
- Ignoring platform differences — identical UI on iOS and Android feels wrong on both
- Over-fetching data without pagination or field selection for mobile's constrained bandwidth
- Skipping `React.memo` on `FlatList` `renderItem` components — causes full list re-renders
- Using `console.log` for debugging in production builds (leaks data, degrades performance)
- Running animations on the JS thread when Reanimated worklets can run on the UI thread
- Manual code signing instead of automated credential management (EAS, Fastlane Match)
- Ejecting from Expo managed workflow prematurely — config plugins solve 90% of native customization needs
- Storing navigation state in global state instead of using navigation params
- Using `index` as `key` in lists with dynamic data — causes rendering bugs and stale state
- Ignoring Hermes-specific behavior when debugging (source maps, bytecode caching, garbage collection)
- Shipping without crash reporting — you cannot fix what you cannot see
