import "react-native-gesture-handler";

const defaultGlobalErrorHandler =
  typeof ErrorUtils !== "undefined" ? ErrorUtils.getGlobalHandler() : undefined;

if (typeof ErrorUtils !== "undefined") {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("FATAL GLOBAL ERROR:", error);
    if (typeof defaultGlobalErrorHandler === "function") {
      defaultGlobalErrorHandler(error, isFatal);
    }
  });
}

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChatsProvider } from "@/context/ChatsContext";
import { LibraryProvider } from "@/context/LibraryContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/src/theme/ThemeProvider";
import { useSettings } from "@/context/SettingsContext";

const SPLASH_SCREEN_FALLBACK_MS = 2000;

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { settings } = useSettings();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: settings.reducedMotion ? "none" : "default",
        ...(Platform.OS === "ios"
          ? { gestureEnabled: true, fullScreenGestureEnabled: true }
          : {}),
      }}
    >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="temporary-chat"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const hasHiddenSplash = useRef(false);

  const hideSplash = useCallback(() => {
    if (hasHiddenSplash.current) return;

    hasHiddenSplash.current = true;
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error("Failed to load Inter fonts during startup.", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      hideSplash();
      return;
    }

    const timeoutId = setTimeout(() => {
      console.warn(
        "Inter fonts did not finish loading during startup. Continuing without blocking navigation."
      );
      hideSplash();
    }, SPLASH_SCREEN_FALLBACK_MS);

    return () => clearTimeout(timeoutId);
  }, [fontError, fontsLoaded, hideSplash]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <SettingsProvider>
              <ThemeProvider>
                <LibraryProvider>
                  <ChatsProvider>
                    <KeyboardProvider>
                      <RootLayoutNav />
                    </KeyboardProvider>
                  </ChatsProvider>
                </LibraryProvider>
              </ThemeProvider>
            </SettingsProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
