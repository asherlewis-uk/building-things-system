import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextInputKeyPressEventData,
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

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSend?: () => void;
  placeholder?: string;
  disabled?: boolean;
  sending?: boolean;
  style?: StyleProp<ViewStyle>;
  footerContent?: React.ReactNode;
  leadingAccessory?: React.ReactNode;
  submitLabel?: string;
  inputLabel?: string;
};

const focusBorderColor = "rgba(67, 195, 195, 0.62)";
const composerOverlayByState = {
  idle: "rgba(255, 255, 255, 0.03)",
  focus: "rgba(67, 195, 195, 0.08)",
  ready: "rgba(62, 189, 255, 0.1)",
  active: "rgba(62, 189, 255, 0.14)",
} as const;

function renderFooterContent(
  value: React.ReactNode,
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

export function Composer({
  value,
  onChangeText,
  onSend,
  placeholder = "Start a temporary chat",
  disabled = false,
  sending = false,
  style,
  footerContent,
  leadingAccessory,
  submitLabel = "Send",
  inputLabel,
}: Props) {
  const [focused, setFocused] = useState(false);
  const theme = useTheme();
  const { settings } = useSettings();
  const canSend = value.trim().length > 0 && !disabled && !sending;
  const isCompact = settings.density === "compact";
  const composerState = disabled
    ? "disabled"
    : sending
      ? "sending"
      : focused
        ? canSend
          ? "ready"
          : "focus"
        : canSend
          ? "ready"
          : "idle";
  const glowToken =
    composerState === "sending" || composerState === "ready"
      ? theme.glow.active
      : composerState === "focus"
        ? theme.glow.focus
        : theme.glow.idle;
  const borderColor =
    composerState === "sending" || composerState === "ready"
      ? theme.border.active
      : composerState === "focus"
        ? focusBorderColor
        : theme.border.idle;
  const overlayColor =
    composerState === "sending"
      ? composerOverlayByState.active
      : composerState === "ready"
        ? composerOverlayByState.ready
        : composerState === "focus"
          ? composerOverlayByState.focus
        : composerOverlayByState.idle;

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (!settings.sendWithEnter || Platform.OS !== "web" || !canSend) {
      return;
    }

    const nativeEvent = event.nativeEvent as TextInputKeyPressEventData & {
      shiftKey?: boolean;
    };

    if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
      event.preventDefault();
      onSend?.();
    }
  };

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
      <View
        style={[
          styles.container,
          {
            borderColor,
          },
        ]}
      >
        <BlurView
          {...glassBlurProps}
          intensity={composerState === "sending" ? 42 : 36}
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
        <View style={styles.topRow}>
          {leadingAccessory ? (
            <View style={styles.leadingAccessory}>{leadingAccessory}</View>
          ) : null}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.text.tertiary}
            editable={!disabled}
            multiline
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyPress={handleKeyPress}
            accessibilityLabel={inputLabel ?? placeholder}
            textAlignVertical="top"
            returnKeyType={
              settings.sendWithEnter && Platform.OS === "web" ? "send" : "default"
            }
            style={[
              typography.body,
              styles.input,
              {
                color: theme.text.primary,
                minHeight: isCompact ? 60 : 76,
                maxHeight: isCompact ? 140 : 160,
                paddingBottom: isCompact ? spacing.xs : spacing.sm,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.footerRow,
            {
              borderTopColor: theme.surface.glassChrome,
            },
          ]}
        >
          <View style={styles.footerCopy}>
            {renderFooterContent(footerContent ?? "Composer", [
              typography.caption1,
              styles.footerLabel,
              { color: theme.text.tertiary },
            ])}
          </View>
          <Pressable
            accessibilityLabel={sending ? "Sending" : submitLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSend, busy: sending }}
            disabled={!canSend}
            onPress={canSend ? onSend : undefined}
          >
            {({ pressed }) => {
              const buttonEmphasized = sending || pressed || canSend;
              const buttonGlowToken = buttonEmphasized
                ? theme.glow.active
                : theme.glow.idle;

              return (
                <View
                  style={[
                    styles.sendButtonShadow,
                    {
                      shadowColor: buttonGlowToken.shadowColor,
                      shadowOffset: buttonGlowToken.shadowOffset,
                      shadowOpacity:
                        !buttonEmphasized ? 0 : buttonGlowToken.shadowOpacity,
                      shadowRadius: buttonGlowToken.shadowRadius,
                      elevation:
                        !buttonEmphasized ? 0 : buttonGlowToken.elevation,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.sendButton,
                      {
                        backgroundColor: canSend
                          ? theme.state.active
                          : theme.surface.elevated,
                        borderColor: canSend
                          ? theme.border.active
                          : theme.border.idle,
                        minHeight: isCompact ? 36 : 40,
                        minWidth: isCompact ? 80 : 88,
                        paddingHorizontal: isCompact ? spacing.sm + 2 : spacing.base,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption1,
                        styles.sendLabel,
                        {
                          color: canSend
                            ? theme.palette.white
                            : theme.text.secondary,
                        },
                      ]}
                    >
                      {sending ? "Sending" : submitLabel}
                    </Text>
                  </View>
                </View>
              );
            }}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowFrame: {
    borderRadius: radii.panel,
  },
  container: {
    borderRadius: radii.panel,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  fallbackTint: {
    borderRadius: radii.panel,
  },
  overlay: {
    borderRadius: radii.panel,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  leadingAccessory: {
    paddingTop: spacing.xs,
  },
  input: {
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.base,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
    borderTopWidth: 1,
  },
  footerCopy: {
    flex: 1,
  },
  footerLabel: {
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sendButtonShadow: {
    borderRadius: radii.full,
  },
  sendButton: {
    minWidth: 88,
    minHeight: 40,
    paddingHorizontal: spacing.base,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sendLabel: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
