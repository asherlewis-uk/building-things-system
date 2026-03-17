import { Feather } from "@expo/vector-icons";
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
import { getGlowStyle } from "./themeStyles";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type Props = {
  icon: FeatherIconName;
  label?: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  label,
  onPress,
  active = false,
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
      accessibilityLabel={label ?? icon}
      accessibilityState={{ disabled, selected: active }}
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
                  : theme.surface.glassTint,
                borderColor: emphasized
                  ? theme.border.active
                  : theme.border.idle,
                opacity: disabled ? opacity.medium : opacity.opaque,
              },
              style,
            ]}
          >
            <Feather
              name={icon}
              size={18}
              color={emphasized ? theme.palette.white : theme.text.primary}
            />
            {label ? (
              <Text
                style={[
                  typography.caption2,
                  styles.label,
                  {
                    color: emphasized
                      ? theme.palette.white
                      : theme.text.secondary,
                  },
                ]}
              >
                {label}
              </Text>
            ) : null}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: hitTarget.minimum,
    minHeight: hitTarget.minimum,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    textAlign: "center",
  },
});
