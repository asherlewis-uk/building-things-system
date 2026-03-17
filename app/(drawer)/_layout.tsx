import { Drawer } from "expo-router/drawer";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NavigationItem, ProfileRow } from "@/src/components";
import { spacing } from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

type DrawerContentProps = NonNullable<
  React.ComponentProps<typeof Drawer>["drawerContent"]
> extends (props: infer Props) => React.ReactNode
  ? Props
  : never;

const topLevelRoutes = [
  { name: "home", label: "Home", icon: "home" },
  { name: "chats", label: "Chats", icon: "message-square" },
  { name: "library", label: "Library", icon: "book-open" },
  { name: "models", label: "Models", icon: "cpu" },
  { name: "settings", label: "Settings", icon: "settings" },
] as const;

function CustomDrawerContent({ navigation, state }: DrawerContentProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.drawerScrollContent,
        {
          paddingTop: insets.top + spacing.base,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
      style={[styles.drawerScrollView, { backgroundColor: theme.surface.elevated }]}
    >
      <View style={styles.drawerContent}>
        <ProfileRow
          initials="AI"
          name="ai.mine"
          subtitle="Local profile"
        />
        <View style={styles.navigationList}>
          {topLevelRoutes.map((route) => (
            <NavigationItem
              key={route.name}
              icon={route.icon}
              label={route.label}
              onPress={() => navigation.navigate(route.name)}
              selected={activeRouteName === route.name}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export default function DrawerLayout() {
  const theme = useTheme();

  return (
    <Drawer
      drawerContent={(props: DrawerContentProps) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.surface.elevated,
          borderRightWidth: 0,
        },
        drawerActiveTintColor: theme.text.primary,
        drawerInactiveTintColor: theme.text.primary,
        sceneStyle: {
          backgroundColor: theme.surface.base,
        },
      }}
    >
      <Drawer.Screen name="home" options={{ title: "Home" }} />
      <Drawer.Screen name="chats" options={{ title: "Chats" }} />
      <Drawer.Screen name="library" options={{ title: "Library" }} />
      <Drawer.Screen name="models" options={{ title: "Models" }} />
      <Drawer.Screen name="settings" options={{ title: "Settings" }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerScrollView: {
  },
  drawerScrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.base,
  },
  drawerContent: {
    flex: 1,
    gap: spacing.xl,
  },
  navigationList: {
    gap: spacing.sm,
  },
});
