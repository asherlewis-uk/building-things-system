/**
 * Source of truth: artifacts/app/src/styles/tokens.css
 *
 * React Native cannot consume CSS custom properties or OKLCH directly, so the
 * web tokens are translated here into explicit sRGB hex/rgba values.
 */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  control: 16,
  card: 20,
  panel: 24,
  full: 9999,
} as const;

export const opacity = {
  transparent: 0,
  ghost: 0.05,
  subtle: 0.1,
  muted: 0.25,
  dim: 0.4,
  medium: 0.6,
  pressed: 0.75,
  strong: 0.8,
  opaque: 1,
} as const;

const typeFace = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const typography = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontFamily: typeFace.bold,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: typeFace.bold,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: typeFace.bold,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: typeFace.semibold,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: typeFace.semibold,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: typeFace.regular,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: typeFace.regular,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: typeFace.regular,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typeFace.regular,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typeFace.regular,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: typeFace.regular,
    letterSpacing: 0.07,
  },
  sectionHeader: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typeFace.semibold,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
} as const;

export type TypographyRole = keyof typeof typography;

const darkPalette = {
  tealCore: "#43C3C3",
  spectral: "#3EBDFF",
  danger: "#F7655E",
  canvas: "#041215",
  shadow: "#000000",
  white: "#FFFFFF",
} as const;

const lightPalette = {
  tealCore: "#0F8F8F",
  spectral: "#177EB6",
  danger: "#CF4C45",
  canvas: "#F2F8F8",
  shadow: "#123238",
  white: "#FFFFFF",
} as const;

export const palette = darkPalette;

const darkSurface = {
  base: "#041215",
  glass: "rgba(16, 34, 38, 0.72)",
  glassTint: "rgba(11, 28, 32, 0.34)",
  glassChrome: "rgba(255, 255, 255, 0.06)",
  elevated: "rgba(10, 27, 31, 0.84)",
} as const;

const lightSurface = {
  base: "#F2F8F8",
  glass: "rgba(255, 255, 255, 0.76)",
  glassTint: "rgba(244, 250, 250, 0.72)",
  glassChrome: "rgba(13, 29, 33, 0.08)",
  elevated: "rgba(255, 255, 255, 0.92)",
} as const;

export const surface = darkSurface;

const darkBorder = {
  idle: "rgba(45, 85, 87, 0.4)",
  active: "rgba(68, 194, 228, 0.72)",
} as const;

const lightBorder = {
  idle: "rgba(71, 100, 104, 0.22)",
  active: "rgba(23, 126, 182, 0.42)",
} as const;

export const border = darkBorder;

type GlowToken = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
  ringColor: string;
  ringWidth: number;
};

type GlowMap = Record<"idle" | "panel" | "focus" | "active" | "danger", GlowToken>;

const darkGlow = {
  idle: {
    shadowColor: darkPalette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
    elevation: 8,
    ringColor: "rgba(67, 195, 195, 0.1)",
    ringWidth: 1,
  },
  panel: {
    shadowColor: darkPalette.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 45,
    elevation: 14,
    ringColor: "rgba(255, 255, 255, 0.03)",
    ringWidth: 1,
  },
  focus: {
    shadowColor: darkPalette.tealCore,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    ringColor: "rgba(67, 195, 195, 0.48)",
    ringWidth: 1,
  },
  active: {
    shadowColor: darkPalette.spectral,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 12,
    ringColor: "rgba(62, 189, 255, 0.5)",
    ringWidth: 1,
  },
  danger: {
    shadowColor: darkPalette.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 10,
    ringColor: "rgba(247, 101, 94, 0.46)",
    ringWidth: 1,
  },
} as const satisfies GlowMap;

const lightGlow = {
  idle: {
    shadowColor: lightPalette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    ringColor: "rgba(15, 143, 143, 0.08)",
    ringWidth: 1,
  },
  panel: {
    shadowColor: lightPalette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 8,
    ringColor: "rgba(13, 29, 33, 0.04)",
    ringWidth: 1,
  },
  focus: {
    shadowColor: lightPalette.tealCore,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
    ringColor: "rgba(15, 143, 143, 0.28)",
    ringWidth: 1,
  },
  active: {
    shadowColor: lightPalette.spectral,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
    ringColor: "rgba(23, 126, 182, 0.32)",
    ringWidth: 1,
  },
  danger: {
    shadowColor: lightPalette.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
    ringColor: "rgba(207, 76, 69, 0.28)",
    ringWidth: 1,
  },
} as const satisfies GlowMap;

export const glow = darkGlow;

const darkText = {
  primary: "#E8F0F3",
  secondary: "#ACBAC0",
  tertiary: "#849297",
} as const;

const lightText = {
  primary: "#0D1D21",
  secondary: "#42585D",
  tertiary: "#6D8085",
} as const;

export const text = darkText;

const darkState = {
  idle: darkPalette.tealCore,
  active: darkPalette.spectral,
  focused: darkPalette.spectral,
  disabled: "rgba(132, 146, 151, 0.35)",
  danger: darkPalette.danger,
} as const;

const lightState = {
  idle: lightPalette.tealCore,
  active: lightPalette.spectral,
  focused: lightPalette.spectral,
  disabled: "rgba(109, 128, 133, 0.28)",
  danger: lightPalette.danger,
} as const;

export const state = darkState;

export const hitTarget = {
  minimum: 44,
} as const;

export const rowHeight = {
  standard: 44,
  tall: 56,
  extraTall: 64,
} as const;

export const screenInsets = {
  horizontal: spacing.base,
  groupedHorizontal: spacing.base,
  sectionHeaderLeading: spacing.base,
} as const;

export const layout = {
  webTopPadding: 67,
  bottomSpacerHeight: 100,
  gridItemWidth: "47%" as const,
} as const;

type PaletteTokens = Record<keyof typeof darkPalette, string>;
type SurfaceTokens = Record<keyof typeof darkSurface, string>;
type BorderTokens = Record<keyof typeof darkBorder, string>;
type GlowTokens = GlowMap;
type TextTokens = Record<keyof typeof darkText, string>;
type StateTokens = Record<keyof typeof darkState, string>;

export type Theme = {
  colorScheme: "dark" | "light";
  palette: PaletteTokens;
  surface: SurfaceTokens;
  border: BorderTokens;
  glow: GlowTokens;
  text: TextTokens;
  state: StateTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  opacity: typeof opacity;
  typography: typeof typography;
  hitTarget: typeof hitTarget;
  rowHeight: typeof rowHeight;
  screenInsets: typeof screenInsets;
  layout: typeof layout;
  isDark: boolean;
};

const theme: Theme = {
  colorScheme: "dark",
  palette: darkPalette,
  surface: darkSurface,
  border: darkBorder,
  glow: darkGlow,
  text: darkText,
  state: darkState,
  spacing,
  radii,
  opacity,
  typography,
  hitTarget,
  rowHeight,
  screenInsets,
  layout,
  isDark: true,
};

export function createTheme(_mode: "dark" | "light" = "dark"): Theme {
  if (_mode === "light") {
    return {
      ...theme,
      colorScheme: "light",
      palette: lightPalette,
      surface: lightSurface,
      border: lightBorder,
      glow: lightGlow,
      text: lightText,
      state: lightState,
      isDark: false,
    };
  }

  return theme;
}
