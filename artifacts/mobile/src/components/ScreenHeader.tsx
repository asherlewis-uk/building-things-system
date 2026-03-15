import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../theme/useTheme";

type Props = {
  title?: string;
  center?: React.ReactNode;
  onBack: () => void;
  trailing?: React.ReactNode;
  backgroundColor?: string;
};

export function ScreenHeader({ title, center, onBack, trailing, backgroundColor }: Props) {
  const { colors, spacing: sp, typography: t, opacity: op, layout } =
    useTheme();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? layout.webTopPadding : insets.top;

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topPad + sp.sm,
          borderBottomColor: colors.separator,
          backgroundColor,
        },
      ]}
    >
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.slot,
          styles.backBtn,
          { opacity: pressed ? op.pressed : 1 },
        ]}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Feather name="arrow-left" size={22} color={colors.label} />
      </Pressable>
      <View style={styles.center}>
        {center ?? <Text style={[t.headline, { color: colors.label }]}>{title}</Text>}
      </View>
      {trailing ?? <View style={styles.slot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  slot: {
    width: 44,
  },
  backBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
