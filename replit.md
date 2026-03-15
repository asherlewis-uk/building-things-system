# Persona — AI Companions App

An unbranded iOS 26-native Expo mobile app inspired by Character.ai's UX. Full-stack with streaming AI chat via OpenAI (Replit AI Integrations), NativeTabs with liquid glass, 18 pre-built AI persona characters, and a full ChatGPT-inspired settings system with a tokenized iOS-native design system.

## Architecture

**Monorepo** (pnpm workspaces):
- `artifacts/mobile/` — Expo React Native app (iOS/Android/Web)
- `artifacts/api-server/` — Express backend with streaming OpenAI chat
- `lib/integrations-openai-ai-server/` — OpenAI client using Replit AI Integration env vars

## Key Features
- 18 AI personas across 6 categories (Philosophy, Science, Creative, Wellness, Adventure, Comedy)
- Streaming SSE chat with real-time token delivery
- iOS 26 NativeTabs + liquid glass (BlurView fallback)
- Conversation persistence via AsyncStorage
- Full ChatGPT-inspired settings system (theme, haptic feedback, custom instructions)
- Archive/restore/delete conversations with swipe gestures
- Export all data and clear all chats
- Custom instructions (aboutUser + responseStyle) injected into every chat system prompt
- Tokenized design system with iOS semantic colors, typography scale, spacing, radii, elevation

## Design System (`src/theme/`)
- **Tokens** (`tokens.ts`): Full iOS semantic color palette (systemBackground, secondarySystemBackground, label, etc.) for both light/dark modes, typography scale (largeTitle→caption2 + sectionHeader), spacing (xxs→xxxxl), radii, elevation tiers, gradient definitions, hit target minimums
- **Theme Hook** (`useTheme.ts`): React context-based hook returning full theme object
- **Theme Provider** (`ThemeProvider.tsx`): Wraps app, reads theme preference from SettingsContext

## Color System
- **Teal Core** (#2DD4BF): Default tint color — tab icons, accents, interactive elements
- **Spectral Mode** (green→blue→violet gradient): Active/selected states — chips, send button, avatar rings, CTA buttons
- iOS semantic colors: systemBackground, secondarySystemBackground, label, secondaryLabel, separator, fill, etc.

## Reusable Component Library (`src/components/`)
- **Surface**: Background container with variants (default/secondary/grouped/elevated)
- **ListRow**: iOS-style list row with leading icon, title, subtitle, trailing accessory (disclosure/switch/badge), separator insets, 44pt hit targets, haptics
- **SectionHeader**: iOS uppercase section header with secondaryLabel color
- **SegmentedControl**: iOS-faithful segmented control with animated thumb
- **Chip**: Filter pill with spectral gradient selected state

## Routes / Ports
| Service | Port | Path |
|---------|------|------|
| Expo (Metro) | 18115 | `/` |
| API Server | 8080 | `/api` |

## API Endpoints
- `GET /api/healthz` — health check
- `POST /api/chat` — streaming SSE chat, body: `{ messages: [{role, content}] }`

## Mobile App Structure
```
artifacts/mobile/
  app/
    _layout.tsx           # Root: SafeAreaProvider→ErrorBoundary→QueryClient→SettingsProvider→ThemeProvider→ChatsProvider→GestureHandler→KeyboardProvider
    (tabs)/
      _layout.tsx         # NativeTabs with liquid glass + SF Symbols, teal accent tint
      index.tsx           # Discover tab (Large Title, featured carousel, spectral chips, grid)
      chats.tsx           # Chats list tab (swipe-to-archive/delete, empty state with CTA)
      search.tsx          # Search tab (Large Title, search bar, category tiles)
      profile.tsx         # Profile tab (spectral avatar, stats surface, grouped list)
    character/[id].tsx    # Character detail (modal)
    chat/[id].tsx         # Chat screen with SSE streaming + custom instructions
    settings/
      index.tsx           # Settings (iOS grouped list, SegmentedControl theme, Switch haptics)
      custom-instructions.tsx  # Custom instructions editor (grouped surfaces)
      archived-chats.tsx  # Archived conversations manager
  src/
    theme/
      tokens.ts           # Full design token system
      useTheme.ts         # Theme context + hook
      ThemeProvider.tsx    # Theme provider component
    components/
      Surface.tsx         # Background container variants
      ListRow.tsx         # iOS list row with accessories
      SectionHeader.tsx   # Uppercase section headers
      SegmentedControl.tsx # Animated segmented control
      Chip.tsx            # Filter pills with gradient
      index.ts            # Barrel exports
  components/             # App-specific components (CharacterCard, MessageBubble, etc.)
  context/
    ChatsContext.tsx       # AsyncStorage-backed conversation state + archive
    SettingsContext.tsx     # Theme, haptic feedback, custom instructions
  data/characters.ts      # 18 personas with system prompts + greetings
  lib/api.ts              # getApiUrl() helper
```

## AI Integration
- Provider: OpenAI via Replit AI Integration
- Model: `gpt-5.2`, max_completion_tokens: 8192
- Env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`
- Streaming via SSE; client uses `expo/fetch` + ReadableStream reader
- Custom instructions (aboutUser, responseStyle) appended to character system prompts

## Dev Notes
- Inverted FlatList for chat (newest at bottom)
- `react-native-keyboard-controller` KeyboardAvoidingView
- `useSafeAreaInsets()` for header/footer padding
- Web gets +67px top / +34px bottom padding adjustments
- Character state captured before async to avoid stale closure bugs
- Assistant message added on first chunk only, then content updated in-place
- Conversation saved to AsyncStorage only after streaming completes
- Provider hierarchy: SafeAreaProvider → ErrorBoundary → QueryClient → SettingsProvider → ThemeProvider → ChatsProvider → GestureHandler → KeyboardProvider
- Swipe gestures use react-native-gesture-handler Swipeable component
- Archive uses separate AsyncStorage key (ARCHIVE_KEY) from active conversations
- All components use `useTheme()` hook — no direct `Colors.dark` references remain
- All interactive elements have 44pt minimum hit targets
- VoiceOver accessibilityRole/accessibilityLabel on all interactive elements
- GradientColors type ensures LinearGradient colors prop type safety
