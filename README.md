# CarIQ — AI Car Research & Buyer’s Guide

A cross-platform mobile app (iOS & Android) that researches any car and generates a full structured buyer’s report — powered by AI, localised to your market and currency.

---

## Features

- **Any car, any market** — type any make, model, year, and variant
- **6 markets** — South Africa, UK, USA, Australia, UAE, Germany (currency auto-sets)
- **Full AI report** covering 8 sections:
  - Generation Overview — year range, phases, engines available
  - Reliability Scores — 7 metrics with animated colour-coded bars
  - Known Issues — expandable cards with severity, frequency, repair cost
  - Best Model Year — buy / engine pick / avoid with reasons
  - Running Costs — service, fuel, insurance, road tax, tyres
  - Finance Analysis — Recommend / Caution / Avoid verdict
  - Competitor Comparison — pros/cons grid, head-to-head table
  - Final Verdict — buy-if vs consider-alternative summary
- **3 AI providers** — Claude (Anthropic), Gemini (Google), ChatGPT (OpenAI)
- **Export PDF** — full styled PDF generated natively on-device
- **Report caching** — results cached 7 days per car/market combo
- **In-app API key management** — no config files, keys stored on-device only

---

## Getting Started

### Prerequisites

- Node.js 20+
- **Expo Go** app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Install & run

```bash
git clone https://github.com/Aadilkho/Aadilkho.git
cd Aadilkho
git checkout claude/cariq-react-native-app-9JSgA
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Add your API key

On first launch a prompt appears. Tap **Set up API Key** and add at least one key:

| Provider | Where to get it | Key format |
|----------|----------------|------------|
| **Claude** *(recommended)* | console.anthropic.com | `sk-ant-...` |
| **Gemini** | aistudio.google.com | `AIza...` |
| **ChatGPT** | platform.openai.com | `sk-...` |

Keys are stored **only on your device** and sent directly to the provider’s API.

Switch providers anytime via the **Settings** screen (⚙️ icon on the home screen).

---

## Build the APK

### Automatic — GitHub Actions

Every push to the branch triggers a build automatically.

1. Go to the **Actions** tab → **Build Android APK**
2. Click the latest run → scroll to **Artifacts**
3. Download and extract to get the `.apk`

To trigger manually: **Actions → Build Android APK → Run workflow** → choose `debug` or `release`.

### Local build

```bash
npm install
npx expo prebuild --platform android   # generates native Android project
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Requires Java 17 and Android SDK (API 34).

---

## Project Structure

```
app/
  _layout.tsx       Root navigation layout
  index.tsx         Home / Search screen
  loading.tsx       Two-step loading screen
  report.tsx        Full scrollable report + PDF export button
  settings.tsx      API key management (all 3 providers)

components/
  ReliabilityBar    Animated score bar (green/amber/red)
  IssueCard         Expandable known issue card
  SectionCard       Generic section wrapper
  FinanceBadge      Verdict badge

services/
  anthropicApi.ts   Core research logic (2 AI calls, JSON merge)
  providers.ts      API implementations for Claude / Gemini / OpenAI
  apiKeys.ts        On-device key & provider storage
  storage.ts        Recent searches & report cache (7-day TTL)
  pdfExport.ts      HTML → PDF builder

constants/
  markets.ts        6-country config (currency, fuel unit, market notes)
  prompts.ts        AI prompt templates
  theme.ts          Design tokens

.github/workflows/
  build-apk.yml     GitHub Actions APK pipeline
```

---

## How the AI research works

Two separate API calls per research (prevents JSON truncation):

1. **Reliability call** → generation overview, reliability scores, known issues, best model year, running costs
2. **Finance call** → finance analysis, competitor comparison, final verdict

Each prompt includes market-specific context — SA road conditions and load-shedding, UK ULEZ and VED, UAE desert heat, Australian LCT, German TUV requirements, etc. — so costs and recommendations are localised.

---

## Disclaimer

For informational purposes only. Always verify with a qualified mechanic before purchase.

---

*Built by [@Aadilkho](https://github.com/Aadilkho) · Cars · Crypto · Engineering · F1*
