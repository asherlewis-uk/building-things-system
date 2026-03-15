import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../theme/useTheme";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type AccessoryType = "disclosureIndicator" | "switch" | "badge" | "none";

type Props = {
  icon?: FeatherIconName;
  iconColor?: string;
  title: string;
  subtitle?: string;
  accessory?: AccessoryType;
  badgeText?: string;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  showSeparator?: boolean;
  separatorInset?: number;
  style?: StyleProp<ViewStyle>;
};

export function ListRow({
  icon,
  iconColor,
  title,
  subtitle,
  accessory = "none",
  badgeText,
  switchValue,
  onSwitchChange,
  onPress,
  destructive = false,
  disabled = false,
  showSeparator = true,
  separatorInset = 0,
  style,
}: Props) {
  const { colors, spacing: sp, typography: t, hitTarget, rowHeight, opacity: op } =
    useTheme();

  const isInteractive = !!onPress || accessory === "switch";
  const labelColor = destructive
    ? colors.destructive
    : disabled
      ? colors.tertiaryLabel
      : colors.label;
  const resolvedIconColor = iconColor ?? (destructive ? colors.destructive : colors.tint);

  const handlePress = () => {
    if (disabled || !onPress) return;
    Haptics.selectionAsync();
    onPress();
  };

  const content = (
    <View
      style={[
        styles.row,
        {
          minHeight: hitTarget.minimum,
          paddingHorizontal: sp.base,
        },
        style,
      ]}
    >
      {icon && (
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: destructive
                ? "rgba(255,59,48,0.12)"
                : colors.tintGhost,
              borderRadius: 7,
            },
          ]}
        >
          <Feather name={icon} size={16} color={resolvedIconColor} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[t.body, { color: labelColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[t.caption1, { color: colors.secondaryLabel }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.trailing}>
        {accessory === "disclosureIndicator" && (
          <View style={styles.disclosureRow}>
            {badgeText !== undefined && (
              <Text style={[t.body, { color: colors.secondaryLabel }]}>
                {badgeText}
              </Text>
            )}
            <Feather
              name="chevron-right"
              size={14}
              color={colors.tertiaryLabel}
            />
          </View>
        )}
        {accessory === "badge" && badgeText && (
          <Text style={[t.body, { color: colors.secondaryLabel }]}>
            {badgeText}
          </Text>
        )}
        {accessory === "switch" && (
          <Switch
            value={switchValue}
            onValueChange={(val) => {
              Haptics.selectionAsync();
              onSwitchChange?.(val);
            }}
            trackColor={{
              false: colors.fill,
              true: colors.tint,
            }}
            thumbColor={colors.onTint}
            disabled={disabled}
            accessibilityLabel={`${title} toggle`}
            accessibilityRole="switch"
          />
        )}
      </View>
    </View>
  );

  if (isInteractive && accessory !== "switch") {
    return (
      <View>
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          style={({ pressed }) => [{ opacity: pressed ? op.pressed : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={{ disabled }}
        >
          {content}
        </Pressable>
        {showSeparator && (
          <View
            style={[
              styles.separator,
              {
                backgroundColor: colors.separator,
                marginLeft: separatorInset || (icon ? 56 : sp.base),
              },
            ]}
          />
        )}
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={title}
    >
      {content}
      {showSeparator && (
        <View
          style={[
            styles.separator,
            {
              backgroundColor: colors.separator,
              marginLeft: separatorInset || (icon ? 56 : sp.base),
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
  },
  disclosureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
