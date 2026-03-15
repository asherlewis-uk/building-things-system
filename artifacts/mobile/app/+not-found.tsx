import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

export default function NotFoundScreen() {
  const { colors, typography: t } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View
        style={[styles.container, { backgroundColor: colors.systemBackground }]}
      >
        <Text style={[t.title3, { color: colors.label }]}>
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={[t.subheadline, { color: colors.tint }]}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
