import { useNavigation } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSettings } from "@/context/SettingsContext";

import { layout, spacing, typography } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import { IconButton } from "./IconButton";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  leadingControl?: React.ReactNode;
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

type DrawerNavigation = {
  openDrawer: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  leadingControl,
  trailing,
  style,
}: Props) {
  const theme = useTheme();
  const { settings } = useSettings();
  const navigation = useNavigation<DrawerNavigation>();
  const insets = useSafeAreaInsets();
  const isCompact = settings.density === "compact";
  const topPad =
    Platform.OS === "web"
      ? layout.webTopPadding - (isCompact ? spacing.sm : 0)
      : insets.top + (isCompact ? spacing.xs : spacing.sm);
  const resolvedLeading =
    leadingControl ??
    (onBack ? (
      <IconButton icon="arrow-left" label="Back" onPress={onBack} />
    ) : (
      <IconButton
        icon="menu"
        label="Menu"
        onPress={() => navigation.openDrawer()}
      />
    ));

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topPad,
          paddingBottom: isCompact ? spacing.sm : spacing.base,
          gap: isCompact ? spacing.xxs : spacing.xs,
        },
        style,
      ]}
    >
      <View style={styles.toolbar}>
        <View style={styles.leading}>{resolvedLeading}</View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
      <Text
        style={[
          typography.caption1,
          styles.eyebrow,
          { color: theme.text.secondary },
        ]}
      >
        ai.mine
      </Text>
      <Text style={[typography.title1, styles.title, { color: theme.text.primary }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            typography.footnote,
            styles.subtitle,
            { color: theme.text.secondary },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  toolbar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  leading: {
    alignItems: "flex-start",
  },
  trailing: {
    alignItems: "flex-end",
  },
  eyebrow: {
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.32,
  },
  subtitle: {
    maxWidth: 560,
    lineHeight: 20,
  },
});
