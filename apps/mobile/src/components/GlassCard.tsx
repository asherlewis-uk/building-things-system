import { BlurView } from "expo-blur";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useSettings } from "@/context/SettingsContext";

import {
  opacity,
  radii,
  spacing,
  typography,
} from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import { glassBlurProps } from "./themeStyles";

type CardTextContent = React.ReactNode;

type Props = {
  title?: CardTextContent;
  description?: CardTextContent;
  meta?: CardTextContent;
  footer?: CardTextContent;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  interactive?: boolean;
};

type CardContentProps = Props & {
  pressed: boolean;
};

const focusBorderColor = "rgba(67, 195, 195, 0.56)";
const overlayByState = {
  idle: "rgba(255, 255, 255, 0.03)",
  focus: "rgba(67, 195, 195, 0.08)",
  active: "rgba(62, 189, 255, 0.14)",
} as const;

function renderCardText(
  value: CardTextContent,
  style: StyleProp<TextStyle>,
) {
  if (value === undefined || value === null || typeof value === "boolean") {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return <Text style={style}>{value}</Text>;
  }

  return value;
}

function CardContent({
  title,
  description,
  meta,
  footer,
  children,
  style,
  contentStyle,
  selected = false,
  pressed,
  disabled = false,
}: CardContentProps) {
  const theme = useTheme();
  const { settings } = useSettings();
  const isCompact = settings.density === "compact";
  const glowToken = selected
    ? theme.glow.active
    : pressed
      ? theme.glow.focus
      : theme.glow.idle;
  const borderColor = selected
    ? theme.border.active
    : pressed
      ? focusBorderColor
      : theme.border.idle;
  const overlayColor = selected
    ? overlayByState.active
    : pressed
      ? overlayByState.focus
      : overlayByState.idle;
  const hasHeader = Boolean(title || description || meta);

  return (
    <View
      style={[
        styles.shadowFrame,
        {
          shadowColor: glowToken.shadowColor,
          shadowOffset: glowToken.shadowOffset,
          shadowOpacity: disabled ? 0 : glowToken.shadowOpacity,
          shadowRadius: glowToken.shadowRadius,
          elevation: disabled ? 0 : glowToken.elevation,
          opacity: disabled ? opacity.medium : opacity.opaque,
        },
        style,
      ]}
    >
      <View style={[styles.frame, { borderColor }]}>
        <BlurView
          {...glassBlurProps}
          intensity={selected ? 40 : 34}
          style={StyleSheet.absoluteFillObject}
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.fallbackTint,
            {
              backgroundColor: theme.surface.glassTint,
            },
          ]}
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.overlay,
            {
              backgroundColor: overlayColor,
            },
          ]}
        />
        <View
          style={[
            styles.content,
            contentStyle,
            {
              gap: isCompact ? spacing.xs : spacing.sm,
              paddingHorizontal: isCompact ? spacing.sm + 4 : spacing.base,
              paddingVertical: isCompact ? spacing.sm + 4 : spacing.base,
            },
          ]}
        >
          {hasHeader ? (
            <View style={styles.headerRow}>
              <View style={styles.headerCopy}>
                {renderCardText(title, [
                  typography.headline,
                  styles.title,
                  { color: theme.text.primary },
                ])}
                {renderCardText(description, [
                  typography.footnote,
                  styles.description,
                  { color: theme.text.secondary },
                ])}
              </View>
              {meta ? (
                <View style={styles.metaWrap}>
                  {renderCardText(meta, [
                    typography.caption1,
                    styles.meta,
                    { color: theme.text.tertiary },
                  ])}
                </View>
              ) : null}
            </View>
          ) : null}
          {children ? (
            <View style={hasHeader ? styles.bodyWithHeader : undefined}>
              {children}
            </View>
          ) : null}
          {footer ? (
            <View
              style={[
                styles.footer,
                {
                  borderTopColor: theme.surface.glassChrome,
                },
              ]}
            >
              {renderCardText(footer, [
                typography.footnote,
                { color: theme.text.secondary },
              ])}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function GlassCard({
  onPress,
  interactive,
  ...props
}: Props) {
  const isInteractive = interactive ?? Boolean(onPress);

  if (!onPress) {
    return (
      <CardContent
        {...props}
        interactive={isInteractive}
        pressed={false}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled, selected: props.selected }}
      disabled={props.disabled}
      onPress={onPress}
    >
      {({ pressed }) => (
        <CardContent
          {...props}
          interactive={isInteractive}
          pressed={pressed}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowFrame: {
    borderRadius: radii.card,
  },
  frame: {
    overflow: "hidden",
    borderRadius: radii.card,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  fallbackTint: {
    borderRadius: radii.card,
  },
  overlay: {
    borderRadius: radii.card,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.base,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    lineHeight: 20,
  },
  metaWrap: {
    maxWidth: 140,
  },
  meta: {
    letterSpacing: 0.8,
    textAlign: "right",
    textTransform: "uppercase",
  },
  bodyWithHeader: {
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
});
