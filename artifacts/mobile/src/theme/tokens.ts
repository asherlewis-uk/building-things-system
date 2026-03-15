import { Platform } from "react-native";

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
  full: 9999,
} as const;

export const elevation = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
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

const teal = {
  base: "#2DD4BF",
  dim: "rgba(45,212,191,0.6)",
  muted: "rgba(45,212,191,0.35)",
  subtle: "rgba(45,212,191,0.15)",
  ghost: "rgba(45,212,191,0.08)",
} as const;

export const spectralColors = {
  green: "#34D399",
  blue: "#60A5FA",
  violet: "#C084FC",
  pink: "#F472B6",
  orange: "#FB923C",
} as const;

type GradientColors = [string, string, ...string[]];

export const gradients = {
  spectral: {
    colors: ["#34D399", "#60A5FA", "#C084FC"] as GradientColors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  spectralFull: {
    colors: [
      "#34D399",
      "#60A5FA",
      "#C084FC",
      "#F472B6",
      "#FB923C",
    ] as GradientColors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  spectralVertical: {
    colors: ["#34D399", "#60A5FA", "#C084FC"] as GradientColors,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  spectralDiagonal: {
    colors: ["#34D399", "#60A5FA", "#C084FC"] as GradientColors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

export type SemanticColors = {
  systemBackground: string;
  secondarySystemBackground: string;
  tertiarySystemBackground: string;
  groupedBackground: string;
  secondaryGroupedBackground: string;
  label: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  quaternaryLabel: string;
  placeholderText: string;
  separator: string;
  opaqueSeparator: string;
  fill: string;
  secondaryFill: string;
  tertiaryFill: string;
  quaternaryFill: string;
  tint: string;
  tintDim: string;
  tintMuted: string;
  tintSubtle: string;
  tintGhost: string;
  destructive: string;
  success: string;
  warning: string;
  cardBackground: string;
  cardBackgroundAlt: string;
  navBarMaterial: string;
  tabBarMaterial: string;
  onTint: string;
};

export const darkColors: SemanticColors = {
  systemBackground: "#000000",
  secondarySystemBackground: "#1C1C1E",
  tertiarySystemBackground: "#2C2C2E",
  groupedBackground: "#000000",
  secondaryGroupedBackground: "#1C1C1E",
  label: "#FFFFFF",
  secondaryLabel: "rgba(235,235,245,0.6)",
  tertiaryLabel: "rgba(235,235,245,0.3)",
  quaternaryLabel: "rgba(235,235,245,0.18)",
  placeholderText: "rgba(235,235,245,0.3)",
  separator: "rgba(84,84,88,0.65)",
  opaqueSeparator: "#38383A",
  fill: "rgba(120,120,128,0.36)",
  secondaryFill: "rgba(120,120,128,0.32)",
  tertiaryFill: "rgba(118,118,128,0.24)",
  quaternaryFill: "rgba(118,118,128,0.18)",
  tint: teal.base,
  tintDim: teal.dim,
  tintMuted: teal.muted,
  tintSubtle: teal.subtle,
  tintGhost: teal.ghost,
  destructive: "#FF453A",
  success: "#30D158",
  warning: "#FFD60A",
  cardBackground: "#1C1C1E",
  cardBackgroundAlt: "#2C2C2E",
  navBarMaterial: "rgba(30,30,30,0.72)",
  tabBarMaterial: "rgba(30,30,30,0.72)",
  onTint: "#FFFFFF",
};

export const lightColors: SemanticColors = {
  systemBackground: "#FFFFFF",
  secondarySystemBackground: "#F2F2F7",
  tertiarySystemBackground: "#FFFFFF",
  groupedBackground: "#F2F2F7",
  secondaryGroupedBackground: "#FFFFFF",
  label: "#000000",
  secondaryLabel: "rgba(60,60,67,0.6)",
  tertiaryLabel: "rgba(60,60,67,0.3)",
  quaternaryLabel: "rgba(60,60,67,0.18)",
  placeholderText: "rgba(60,60,67,0.3)",
  separator: "rgba(60,60,67,0.29)",
  opaqueSeparator: "#C6C6C8",
  fill: "rgba(120,120,128,0.2)",
  secondaryFill: "rgba(120,120,128,0.16)",
  tertiaryFill: "rgba(118,118,128,0.12)",
  quaternaryFill: "rgba(118,118,128,0.08)",
  tint: teal.base,
  tintDim: teal.dim,
  tintMuted: teal.muted,
  tintSubtle: teal.subtle,
  tintGhost: teal.ghost,
  destructive: "#FF3B30",
  success: "#34C759",
  warning: "#FFCC00",
  cardBackground: "#FFFFFF",
  cardBackgroundAlt: "#F2F2F7",
  navBarMaterial: "rgba(249,249,249,0.94)",
  tabBarMaterial: "rgba(249,249,249,0.94)",
  onTint: "#FFFFFF",
};

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

export type Theme = {
  colors: SemanticColors;
  spacing: typeof spacing;
  radii: typeof radii;
  elevation: typeof elevation;
  opacity: typeof opacity;
  typography: typeof typography;
  gradients: typeof gradients;
  hitTarget: typeof hitTarget;
  rowHeight: typeof rowHeight;
  screenInsets: typeof screenInsets;
  layout: typeof layout;
  isDark: boolean;
};

export function createTheme(mode: "dark" | "light"): Theme {
  return {
    colors: mode === "dark" ? darkColors : lightColors,
    spacing,
    radii,
    elevation,
    opacity,
    typography,
    gradients,
    hitTarget,
    rowHeight,
    screenInsets,
    layout,
    isDark: mode === "dark",
  };
}
