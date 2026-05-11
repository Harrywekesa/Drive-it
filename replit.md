# Drive It Kenya

A post-license driver education mobile app (Android/iOS) that embeds supervised driving sessions inside existing ride-hailing journeys. Learners book sessions through Uber, Bolt, or Wasili, and a certified instructor rides along to coach them through real traffic.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with Expo Router file-based navigation
- State: React Context + AsyncStorage (persisted local state)
- Fonts: Inter via @expo-google-fonts/inter
- Icons: @expo/vector-icons (Feather)
- Haptics: expo-haptics

## Where things live

- `artifacts/drive-it/` — Expo mobile app
  - `app/` — Expo Router screens
    - `(tabs)/index.tsx` — Home dashboard
    - `(tabs)/sessions.tsx` — Sessions list with filters
    - `(tabs)/profile.tsx` — Profile, achievements, transaction history
    - `book.tsx` — 4-step booking flow with M-Pesa payment
    - `session/[id].tsx` — Session detail, lifecycle controls, rating
    - `edit-profile.tsx` — Profile editor
  - `components/` — Shared UI components
    - `MpesaModal.tsx` — Animated M-Pesa STK push simulation
    - `SessionCard.tsx` — Reusable session summary card
    - `StatCard.tsx` — Metric display card
  - `context/AppContext.tsx` — Global state (sessions, transactions, user profile)
  - `constants/colors.ts` — Drive It Kenya brand colours

## Architecture decisions

- **No backend required for MVP** — all state lives in AsyncStorage on-device; ready to swap to a real API
- **M-Pesa simulated client-side** — STK push flow is animated/timed simulation; real integration needs Daraja API server-side
- **Context + AsyncStorage** over Redux — simple enough for current scale, persists across restarts
- **File-based routing** via Expo Router — each screen is a file, modals are stack presentations
- **Seed data** pre-populated on first launch to demonstrate the full UX without requiring real accounts

## Product Features

- Home dashboard — greeting, book CTA, progress stats, safety tip, upcoming/recent sessions
- Session booking — 4-step wizard: platform → route → instructor → confirm & M-Pesa pay
- M-Pesa payment modal — full STK push simulation with animated states (sending → waiting for PIN → processing → success with receipt)
- Session lifecycle — Upcoming → Start → Active → Complete → Rate
- Session detail — route, instructor info with call button, skills, pricing, M-Pesa receipt, star rating + feedback
- Sessions tab — filterable list (All / Upcoming / Completed)
- Profile — license card, stats, achievements, transaction history, edit profile
- Transaction history — M-Pesa receipts with reference numbers and status badges
- 5 certified instructors across Uber, Bolt, Wasili platforms

## User preferences

- Prefer real, simulated functionality over placeholders
- App targets Android (APK) as primary output — use EAS Build for production APK
- Kenyan market context: M-Pesa, Nairobi areas, KSh pricing

## Gotchas

- For APK: run `eas build -p android --profile preview` from `artifacts/drive-it/` with an Expo account
- M-Pesa real integration requires Safaricom Daraja API (server-side STK push endpoint)
- Expo web preview shows the app but targets Android/iOS — use Expo Go or EAS for native testing

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- GitHub: https://github.com/Harrywekesa/Drive-it
