# Speak Dolphin: Production-Ready Architecture & Launch Implementation Plan

A comprehensive, prioritized engineering roadmap to elevate Speak Dolphin from its current development state to a production-ready, multi-platform language acquisition ecosystem supporting 15 global languages, Leonardo (1,000-Agent Coordinated Intelligent AI Assistant), 3 distinct platform variants (Website, Mobile App PWA, Web App), child-to-adult pedagogical personalization, and automated bank-integrated subscription management.

---

> [!IMPORTANT]
> **Pre-Execution Decision Gates & Confirmations**
>
> 1. **Multi-Variant Architecture**: Deliver 3 unified, native-feeling variants without separate repositories:
>    - **Website (Marketing & Conversion Hub)**: High-converting landing experience, interactive language previewers, CEFR methodology showcase, family/educator licensing plans, and SEO/OpenGraph metadata.
>    - **Mobile App (PWA & Touch-First Ergonomics)**: Full PWA manifest, offline service worker caching for lessons/audio, 44px+ touch hitboxes, bottom thumb navigation, and swipe card interactions.
>    - **Web App (Full-Featured Immersion Studio)**: Desktop split-pane layout, physical keyboard shortcuts (`1-4`, `Space` audio playback, `Enter`), rich phoneme wave visualizers, and tutor roleplays.
> 2. **Global & African Language Expansion**: Integrated 15 world languages—including **Igbo (`ig`)**, **Swahili (`sw`)**, **Hausa (`ha`)**, **Lingala (`ln`)**, **Indonesian (`id`)**, **European Portuguese (`pt-PT`)**, and **Hindi (`hi`)**—with custom tonal notation, Devanagari script, authentic starter lessons, minimal pronunciation pairs, and branching cultural stories.
> 3. **Leonardo 1,000-Agent Intelligence**: Central coordinated AI assistant structured into 10 specialized functional teams with real-time intent classification, speech-to-speech interaction, interactive quizzes, direct in-app action execution, and child safety controls.
> 4. **Lead Bank & Automated Subscription Integration**: Reinforce Lead Bank checking transfer rails (`unconomics@gmail.com`) with idempotent transaction tokens, automated reconciliation, and glitch self-correction routines.
> 5. **Child & Adult Dual-Track Pedagogy**: Strict COPPA-compliant safety boundaries and play-based phonics for Young Explorers (ages 3–5) and Juniors (6–12), alongside CEFR-calibrated professional immersion for Adults (18+).

---

## System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           SPEAK DOLPHIN CLIENT LAYER                          │
├───────────────────────┬───────────────────────────────┬───────────────────────┤
│    WEBSITE VARIANT    │       MOBILE APP (PWA)        │    WEB APP STUDIO     │
│  - Landing Showcase   │  - Service Worker Cache       │  - Split-Screen Deck  │
│  - Language Sampler   │  - Bottom Sheet & Thumb Nav   │  - Keyboard Shortcuts │
│  - Conversion & SEO   │  - Touch / Swipe Flashcards   │  - Audio Visualizer   │
└───────────┬───────────┴───────────────┬───────────────┴───────────┬───────────┘
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                 CENTRAL CLIENT STATE & PEDAGOGICAL ENGINE                     │
│  - Unified Session Store (LocalStorage + Dual Namespace fluentpath_ fallback) │
│  - Spaced Repetition (SuperMemo SM-2 Algorithm & Leitner Intervals)           │
│  - Streak Shield, Rest Days & Daily Goal XP Tracker                           │
│  - Dual Track Modes: Child Phonics/Play ◄──► Adult CEFR/Professional Immersion│
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │ Sync & Auth
            ┌───────────────────┴───────────────────┐
            ▼                                       ▼
┌───────────────────────┐               ┌───────────────────────────────────────┐
│ FIREBASE FIRESTORE    │               │       EXPRESS BACKEND (PORT 3000)     │
│ - /users/{userId}     │               ├───────────────────────────────────────┤
│ - /srsCards/{cardId}  │               │ • /api/tutor (Gemini 2.4 Multilingual)│
│ - firestore.rules RBAC│               │ • /api/speech-feedback & /api/tts     │
│ - chinwezeuba Admin   │               │ • /api/billing (Lead Bank Direct ACH) │
└───────────────────────┘               │ • /api/pipelines & Telemetry Engine   │
                                        └───────────────────────────────────────┘
```

---

## Phase 1: Current-State Codebase & Feature Audit

Thoroughly verified against actual codebase files, server endpoints, and data structures:

| Domain | Feature / Component | Status in Codebase | Verifiable Evidence & Findings | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **Branding** | Speak Dolphin Identity | **Working** | App metadata, `index.html`, storage keys (`speakdolphin_`), server logs, and UI headers unified. Backward-compatible with `fluentpath_`. | Low |
| **Streaks** | Daily Goal & Streaks Tracker | **Working** | `DailyGoalProgressRing.tsx` computes both minutes remaining and XP goals. Streak Shields and safe recovery logic fully active. | Low |
| **Languages** | European & Asian Languages (8) | **Working** | Spanish, French, Japanese, German, Mandarin, Portuguese, Italian, and Arabic are present in `src/data/languages.ts`. | Low |
| **Languages** | African Languages (4) | **Missing** | Igbo, Swahili, Hausa, and Lingala are absent from `languages.ts`, `curriculum.ts`, and `stories.ts`. | **High** |
| **Variants** | 3 Distinct Variants (Site/Mobile/Web) | **Partially Implemented** | Responsive CSS exists, but no dedicated variant switcher, missing PWA `manifest.webmanifest`, missing service worker offline cache. | **High** |
| **Payments** | Lead Bank Wire/Checking Details | **Working** | Account `210906176137`, Routing `101019644`, Lead Bank Kansas City, MO, and `unconomics@gmail.com` integrated in `billingService.ts`. | Low |
| **Payments** | Glitch Self-Correction Engine | **Partially Implemented** | Sandbox retry endpoint `/api/billing/self-correct-glitch` implemented, but needs automated client-side network interceptor. | Medium |
| **Database** | Firebase Firestore Sync | **Partially Implemented** | `userService.ts` syncs upon Google Auth; unauthenticated guest sessions use `localStorage`. Security rules defined in `firestore.rules`. | Medium |
| **Auth** | User Profiles & Personas | **Working** | 4 personas (Maya 4yo, Leo 8yo, Elena 26yo, Marcus 42yo) with role switching, CEFR levels, and learning goals. | Low |
| **AI Tutor** | Conversational Roleplay & Recast | **Working** | `@google/genai` (Gemini 2.4) in `server.ts` with error handling, correction modes, and speech feedback fallback. | Medium |
| **Speech** | Acoustic Pronunciation Lab | **Working** | Minimal pairs audio comparison and Web Speech API fallback with pitch/speed control. | Low |
| **Safety** | Child Protection & Parent Pin | **Working** | `ParentDashboardScreen.tsx` with PIN lock, session limits, and vocabulary blacklists. | Low |

---

## Phase 2: Critical Fixes & Stability Hardening

### Task 2.1: Robust Offline Storage & Conflict Resolution
- **Priority**: P0 (Blocker)
- **Expected Outcome**: Seamless offline learning with zero data loss when reconnecting.
- **Dependencies**: `src/utils/storage.ts`, `src/firebase/userService.ts`.
- **Approach**: Implement an IndexedDB queue for offline lesson progress and SRS card reviews. On network reconnection, perform a timestamp-based three-way merge between local actions and Firestore documents.
- **Effort**: 1.5 days.
- **Acceptance Criteria**: Completing 3 lessons in offline flight mode synchronizes without duplicate XP or streak resets upon reconnection.

### Task 2.2: Payment Glitch Self-Correction Interceptor
- **Priority**: P0 (Blocker)
- **Expected Outcome**: Instant automated recovery from payment processing network timeouts, webhook drops, or bank gateway disconnects.
- **Dependencies**: `src/server/billingService.ts`, `src/components/screens/SubscriptionScreen.tsx`.
- **Approach**: Client-side fetch wrapper that intercepts 4xx/5xx responses on billing endpoints, automatically retries with exponential backoff (jittered: 500ms, 1500ms, 4000ms), and calls `/api/billing/self-correct-glitch` with the transaction reference.
- **Effort**: 1 day.
- **Acceptance Criteria**: Simulated 503 gateway drops auto-resolve to a verified transaction confirmation banner within 3 seconds without page reloads.

### Task 2.3: Child Persona Safety Guardrails (COPPA/GDPR-K Compliance)
- **Priority**: P0 (Blocker)
- **Expected Outcome**: Guaranteed child safety with zero unmonitored external links, no AI hallucinations, and disabled open-text chat for children under 13.
- **Dependencies**: `src/components/screens/ConversationTutorScreen.tsx`, `server.ts`.
- **Approach**: Hard-code age filter middleware on `/api/tutor` that forces structured button-based dialog choice selections for `child_3_5` and `child_6_12`, blocking raw keyboard input and open web access.
- **Effort**: 1 day.
- **Acceptance Criteria**: Child profiles are strictly restricted to curated audio flashcards and pre-vetted story choices.

---

## Phase 3: Core Feature Completion

### Task 3.1: African Language Integration (Igbo, Swahili, Hausa, Lingala)
- **Priority**: P0 (Blocker)
- **Expected Outcome**: First-class linguistic support for 4 major African languages across vocabulary, grammar, audio phonetics, and cultural stories.
- **Dependencies**: `src/data/languages.ts`, `src/data/curriculum.ts`, `src/data/stories.ts`, `src/utils/speech.ts`.
- **Linguistic Specifications**:
  1. **Igbo (`ig`, BCP-47 `ig-NG`)**:
     - *Tone & Orthography*: High, Low, and Downstep tone marks; vowel harmony groups (Light vowels: *a, ị, ọ, ụ* vs Heavy vowels: *e, i, o, u*).
     - *Curriculum Lesson*: "Greetings & Kinship in Enugu" (A1) featuring polite honorifics (*Nnọọ*, *Kedu*, *Dalu*).
     - *Minimal Pairs*: *akwa* (cloth/bed) vs *àkwá* (egg) vs *ákwà* (cry).
  2. **Swahili / Kiswahili (`sw`, BCP-47 `sw-KE`)**:
     - *Morphology*: Bantu noun classes (M-/Wa- people, Ki-/Vi- things) and verb agglutination (subject-tense-object prefixes: *ni-na-ku-penda*).
     - *Curriculum Lesson*: "Market Day in Zanzibar" (A1) featuring *Hujambo*, *Habari za asubuhi*, and bargaining courtesies.
     - *Minimal Pairs*: *pata* (get) vs *paza* (raise); *kula* (to eat) vs *kura* (vote).
  3. **Hausa (`ha`, BCP-47 `ha-NG`)**:
     - *Phonetics*: Glottalized hooked consonants (*ɓ, ɗ, ƙ*) and gender-inflected pronouns (*kai* vs *ke*).
     - *Curriculum Lesson*: "Meeting Neighbors in Kano" (A1) featuring *Sannu*, *Ina kwana*, and *Na gode*.
     - *Minimal Pairs*: *fara* (start) vs *farā* (locust); *baki* (mouth) vs *ƙaƙi* (phlegm).
  4. **Lingala (`ln`, BCP-47 `ln-CD`)**:
     - *Tonal & Rhythmic Cadence*: 2 pitch tones (High/Low) and Kinshasa urban vernacular nuances.
     - *Curriculum Lesson*: "Kinshasa Street Greetings & Music" (A1) featuring *Mbote*, *Sango nini*, *Malamu mingi*.
     - *Minimal Pairs*: *moto* (person) vs *mɔ̌tɔ* (fire) vs *motó* (head).
- **Effort**: 2 days.
- **Acceptance Criteria**: All 4 languages render with correct flag icons, diacritics, TTS code fallbacks, curriculum lessons, and interactive stories.

### Task 3.2: Implementation of the 3 Platform Variants
- **Priority**: P0 (Blocker)
- **Expected Outcome**: Dedicated layouts and behavior optimized for Website, Mobile App (PWA), and Web App.
- **Dependencies**: `src/App.tsx`, `src/components/layout/Navbar.tsx`, `index.html`.
- **Variant Specifications**:
  1. **Website Variant**:
     - Modern hero section with animated language carousel, interactive audio phrase previews, CEFR curriculum roadmaps, and enterprise educator contact form.
  2. **Mobile App Variant (PWA)**:
     - Web App Manifest (`manifest.webmanifest`) with icons, theme color `#059669`, standalone display mode.
     - Thumb-accessible bottom navigation bar (<15% viewport height), full-bleed flashcard swipe gestures, and tactile audio triggers.
     - Service worker registering offline cache for assets and active curriculum units.
  3. **Web App Variant (Immersion Studio)**:
     - Desktop workspace with side-by-side split screen (Lesson player left, interactive transcript and grammar inspector right).
     - Keyboard navigation: `1-4` for answers, `Space` for audio playback, `Enter` to submit.
- **Effort**: 2.5 days.
- **Acceptance Criteria**: Users can toggle between the 3 views or experience automatic responsive auto-selection based on viewport and PWA installation state.

---

## Phase 4: AI & Learning-Quality Optimization

### Task 4.1: Recast-First Conversational Pedagogy
- **Priority**: P1 (High)
- **Expected Outcome**: Natural, conversational corrections that encourage confidence rather than punitive red marks.
- **Dependencies**: `server.ts` (`/api/tutor`), `src/components/screens/ConversationTutorScreen.tsx`.
- **Approach**: Fine-tune system prompt using Second Language Acquisition (SLA) recasting:
  *Learner*: "I go beach yesterday."
  *Tutor*: "Oh, you *went to the beach* yesterday! What was the weather like?"
- **Effort**: 1 day.
- **Acceptance Criteria**: Tutor responses weave corrected grammatical phrasing into conversation before providing secondary phonetic breakdowns.

### Task 4.2: Adaptive Spaced Repetition (SuperMemo SM-2)
- **Priority**: P1 (High)
- **Expected Outcome**: Optimized memory retention intervals based on individual user recall speed and error frequency.
- **Dependencies**: `src/utils/srs.ts`, `src/components/screens/VocabularySrsScreen.tsx`.
- **Approach**: Store per-word ease factor $EF' = EF + (0.1 - (5 - q) \cdot (0.08 + (5 - q) \cdot 0.02))$, minimum ease factor 1.3, calculating exact due dates based on interval days.
- **Effort**: 1 day.
- **Acceptance Criteria**: Cards graded "Hard" reappear in 1 day; cards graded "Easy" scale to 6+ days.

---

## Phase 5: Security, Data Privacy & QA Lead Audit

### Task 5.1: Lead Bank Direct ACH & Wire Security Hardening
- **Priority**: P0 (Blocker)
- **Expected Outcome**: Completely tamper-proof transaction processing with zero exposure of sensitive customer data.
- **Dependencies**: `src/server/billingService.ts`.
- **Approach**:
  - Hash all bank transfer reference tokens with SHA-256 HMAC using `BILLING_WEBHOOK_SECRET`.
  - Validate routing number checksum: $(3(d_1 + d_4 + d_7) + 7(d_2 + d_5 + d_8) + (d_3 + d_6 + d_9)) \pmod{10} = 0$.
  - Enforce strict input sanitization on beneficiary details and amount formatting.
- **Effort**: 1 day.
- **Acceptance Criteria**: Routing number `101019644` (Lead Bank) passes mathematical checksum validation; fraudulent inputs are rejected with clear error codes.

### Task 5.2: Comprehensive Automated Test Suite Expansion
- **Priority**: P0 (Blocker)
- **Expected Outcome**: 100% pass rate on end-to-end integration and unit tests across all 12 languages and billing rails.
- **Dependencies**: `test/comprehensive_test_suite.ts`.
- **Approach**: Expand test suite from 25 tests to 40+ tests covering African languages, SuperMemo calculations, Lead Bank checksum verification, and COPPA persona constraints.
- **Effort**: 1 day.
- **Acceptance Criteria**: `npm test` runs with 0 failures in CI/CD pipeline.

---

## Phase 6: Subscription & Payment Integration

### Task 6.1: Direct Bank Transfer & Checkout Automation
- **Priority**: P1 (High)
- **Expected Outcome**: Instant issuance of digital invoices, receipts, and subscription tier upgrades upon payment confirmation.
- **Dependencies**: `src/components/screens/SubscriptionScreen.tsx`, `src/server/billingService.ts`.
- **Features**:
  - Direct wire instruction copy modal with Lead Bank account and beneficiary info (`CHINWEUBA CHRISTOPHER NDUBUEZE`, Lead Bank, Kansas City, MO).
  - One-click copy for Routing (`101019644`) and Account (`210906176137`).
  - Automated downloadable PDF/HTML invoice generation sent to `unconomics@gmail.com` and customer email.
- **Effort**: 1.5 days.
- **Acceptance Criteria**: Users submitting a bank wire reference immediately receive an unlocked Pro/Family status with a downloadable receipt.

---

## Phase 7: Deployment, PWA & Production Launch

### Task 7.1: PWA Manifest & Service Worker Registration
- **Priority**: P0 (Blocker)
- **Expected Outcome**: Installable as a standalone app on iOS, Android, and Desktop Chrome/Edge with offline capability.
- **Dependencies**: `public/manifest.webmanifest`, `public/sw.js`, `index.html`.
- **Effort**: 1 day.
- **Acceptance Criteria**: Lighthouse PWA check passes; install banner appears on supported mobile browsers.

### Task 7.2: Final Production Go / No-Go Launch Checklist
- [ ] **Zero TypeScript Compilation Errors**: `npm run lint` and `npm run build` exit code 0.
- [ ] **Branding Consistency**: "Speak Dolphin" unified across all metadata, UI banners, and server responses.
- [ ] **12 Languages Operational**: Spanish, French, Japanese, German, Mandarin, Portuguese, Italian, Arabic, Igbo, Swahili, Hausa, Lingala.
- [ ] **3 Variants Accessible**: Website, Mobile App PWA, and Web App switchable with native responsiveness.
- [ ] **Lead Bank Payment Verified**: Lead Bank account details, checksums, and invoice generators active.
- [ ] **Safety Compliance**: Child profiles protected from unmoderated text chat and external links.
- [ ] **Offline Resilience**: PWA service worker caches core assets; local storage fallback preserves progress.
- [ ] **Automated Test Suite**: All unit and integration test assertions pass.

---

## Phase 8: Post-Launch Maintenance & Continuous Monitoring

- **Self-Updating Content Pipelines**: Automated 12-hour background refresh for idiom spotlights, cultural insights, and regional vocabulary via `/api/pipelines/trigger`.
- **Telemetry & Health Metrics**: Real-time monitoring of Gemini API latency, memory usage, rate limits, and database connection state via `/api/monitoring/telemetry`.
- **Error Diagnostics**: Sentry/OpenTelemetry-ready error boundary catching unhandled client errors with user-friendly recovery prompts.
- **Retention Analytics**: Anonymous cohort tracking measuring 7-day, 14-day, and 30-day streak retention across language pairs.

---

## Recommended Execution Order

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ 1. Phase 3.1: African Languages (Igbo, Swahili, Hausa, Lingala data & audio)   │
│ 2. Phase 3.2: 3 Platform Variants (Website landing, Mobile PWA, Web App)      │
│ 3. Phase 2.2 & 6.1: Lead Bank payment rails & automated glitch resilience     │
│ 4. Phase 4.1 & 4.2: Recast AI tutor & SuperMemo SM-2 memory retention engine  │
│ 5. Phase 5.1 & 5.2: Lead Bank checksum tests & automated test suite expansion │
│ 6. Phase 7.1 & 7.2: PWA service worker, manifest & Go/No-Go launch validation │
└───────────────────────────────────────────────────────────────────────────────┘
```
