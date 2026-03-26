import { BlurView } from "expo-blur";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  hitTarget,
  opacity,
  radii,
  typography,
} from "../theme/tokens";
import { useHaptics } from "../hooks/useHaptics";
import { useTheme } from "../theme/useTheme";
import { glassBlurProps } from "./themeStyles";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const focusBorderColor = "rgba(67, 195, 195, 0.54)";
const overlayByState = {
  idle: "rgba(255, 255, 255, 0.02)",
  focus: "rgba(67, 195, 195, 0.12)",
  active: "rgba(62, 189, 255, 0.18)",
} as const;

export function ActionChip({
  label,
  selected,
  onPress,
  disabled = false,
  style,
}: Props) {
  const theme = useTheme();
  const { selection } = useHaptics();

  const handlePress = () => {
    if (disabled) return;
    selection();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
    >
      {({ pressed }) => {
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
                  styles.chip,
                    {
                      borderColor,
                    },
                ]}
              >
                <BlurView
                  {...glassBlurProps}
                  intensity={selected ? 38 : 30}
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
              <Text
                style={[
                    typography.subheadline,
                    styles.label,
                    {
                      color: selected
                        ? theme.palette.white
                        : theme.text.primary,
                    },
                  ]}
              >
                {label}
              </Text>
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowFrame: {
    borderRadius: radii.full,
  },
  chip: {
    minHeight: hitTarget.minimum,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  fallbackTint: {
    borderRadius: radii.full,
  },
  overlay: {
    borderRadius: radii.full,
  },
  label: {
    fontFamily: "Inter_500Medium",
  },
});
