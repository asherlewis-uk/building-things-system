# UI Fidelity Checklist — Persona App (iOS-Native Redesign)

## Design Token System
- [x] Semantic color tokens (light + dark) mapped to iOS names
- [x] Typography scale: largeTitle, title1-3, headline, body, callout, subheadline, footnote, caption1-2, sectionHeader
- [x] Spacing scale (xxs through xxxxl)
- [x] Radii scale (none through full)
- [x] Elevation tiers (none, sm, md, lg, xl)
- [x] Gradient tokens with proper tuple typing (spectral, spectralFull, spectralVertical, spectralDiagonal)
- [x] Opacity scale
- [x] Hit target minimum (44pt)
- [x] Row height tokens (standard 44, tall 56, extraTall 64)
- [x] Screen inset tokens

## Component Library
- [x] Surface: 4 variants (default, secondary, grouped, elevated)
- [x] ListRow: icon, title, subtitle, 4 accessory types (disclosure, switch, badge, none), separator insets, haptics, destructive style
- [x] SectionHeader: uppercase styling, secondaryLabel color, accessibilityRole="header"
- [x] SegmentedControl: animated thumb, spring physics, tab accessibility
- [x] Chip: spectral gradient selected, outline unselected, 44pt targets

## Navigation Patterns
- [x] Large Title typography on all tab screens (Discover, Chats, Search, Profile)
- [x] iOS edge-swipe back gesture (fullScreenGestureEnabled)
- [x] Tab bar: single teal accent tint, BlurView material background
- [x] SF Symbols via expo-symbols (iOS) / Feather fallback (Android/Web)
- [x] NativeTabs + liquid glass path on iOS 26

## Settings Screen (iOS Grouped List)
- [x] Grouped background (groupedBackground token)
- [x] Surface variant="grouped" sections
- [x] SectionHeader components (GENERAL, PERSONALIZATION, DATA & STORAGE, ABOUT)
- [x] SegmentedControl for theme picker (System/Light/Dark)
- [x] Native Switch for haptics toggle
- [x] ListRow with disclosure indicators, badge counts, destructive styling
- [x] Separator insets aligned to icon edge

## Discover Screen
- [x] Featured carousel with horizontal scroll + snap
- [x] Spectral gradient filter chips
- [x] Persona grid with tokenized cards
- [x] Section header with count badge

## Empty & Error States
- [x] Chats empty state: icon, title, subtitle, spectral CTA button
- [x] Archived chats empty state: icon, title, subtitle
- [x] Search no-results state: title, helpful subtitle
- [x] Chat error state: error message bubble on stream failure
- [x] Character not found fallback

## Accessibility
- [x] accessibilityRole on all interactive elements (button, switch, search, header, tab, tablist)
- [x] accessibilityLabel on icons, toggles, action buttons
- [x] accessibilityState (selected, disabled, checked) where applicable
- [x] 44pt minimum hit targets on all pressable elements
- [x] VoiceOver-navigable settings rows, chat actions, filter chips
- [x] Text content uses semantic typography tokens (supports Dynamic Type scaling)

## Color System Consistency
- [x] All screens use useTheme() hook — zero direct Colors.dark references
- [x] Teal tint for inactive/default states
- [x] Spectral gradient for active/selected/CTA states
- [x] iOS semantic colors for backgrounds, labels, separators, fills
- [x] Featured badge uses tintGhost/tintSubtle tokens
- [x] Destructive actions use destructive token (#FF453A dark / #FF3B30 light)

## Platform Adaptations
- [x] Web: +67px top / +34px bottom padding adjustments
- [x] iOS: BlurView tab bar, SF Symbols, edge swipe gestures
- [x] Android: solid background tab bar, Feather icons
- [x] NativeTabs liquid glass path for iOS 26+
