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
  opacity,
  radii,
  spacing,
  typography,
} from "../theme/tokens";
import { useHaptics } from "../hooks/useHaptics";
import { useTheme } from "../theme/useTheme";
import { getGlowStyle } from "./themeStyles";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type Props = {
  label: string;
  icon?: FeatherIconName;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function NavigationItem({
  label,
  icon,
  selected = false,
  onPress,
  style,
}: Props) {
  const theme = useTheme();
  const { selection } = useHaptics();

  const handlePress = () => {
    selection();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      {({ pressed }) => {
        const emphasized = selected || pressed;

        return (
          <View
            style={[
              styles.item,
              getGlowStyle(emphasized ? theme.glow.active : theme.glow.idle),
              {
                backgroundColor: emphasized
                  ? theme.surface.elevated
                  : theme.surface.glassTint,
                borderColor: emphasized
                  ? theme.border.active
                  : theme.border.idle,
                opacity: pressed ? opacity.pressed : opacity.opaque,
                borderWidth: 1,
              },
              style,
            ]}
          >
            {icon ? (
              <Feather
                name={icon}
                size={18}
                color={emphasized ? theme.state.active : theme.state.idle}
              />
            ) : null}
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
  },
  label: {
    fontFamily: "Inter_500Medium",
  },
});
