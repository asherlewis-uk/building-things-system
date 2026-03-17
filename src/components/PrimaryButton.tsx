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
  opacity,
  radii,
  typography,
} from "../theme/tokens";
import { useHaptics } from "../hooks/useHaptics";
import { useTheme } from "../theme/useTheme";
import { getGlowStyle } from "./themeStyles";

type Props = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  active?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  style,
  disabled = false,
  active = false,
}: Props) {
  const theme = useTheme();
  const { impact } = useHaptics();

  const handlePress = () => {
    if (disabled) return;
    impact();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {({ pressed }) => {
        const emphasized = active || pressed;

        return (
          <View
            style={[
              styles.button,
              getGlowStyle(emphasized ? theme.glow.active : theme.glow.idle),
              {
                backgroundColor: emphasized
                  ? theme.state.active
                  : theme.surface.elevated,
                borderColor: emphasized
                  ? theme.border.active
                  : theme.border.idle,
                opacity: disabled ? opacity.medium : opacity.opaque,
                borderWidth: 1,
              },
              style,
            ]}
          >
            <Text
              style={[
                typography.subheadline,
                  styles.label,
                  {
                    color: emphasized
                      ? theme.palette.white
                      : theme.text.primary,
                  },
                ]}
            >
              {label}
            </Text>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.full,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
  },
});
