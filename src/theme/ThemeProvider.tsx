import React, { useMemo } from "react";
import { useColorScheme } from "react-native";

import { useSettings } from "../../context/SettingsContext";
import { createTheme } from "./tokens";
import { ThemeContext } from "./useTheme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const osScheme = useColorScheme();

  const theme = useMemo(() => {
    let mode: "dark" | "light";
    if (settings.theme === "light") {
      mode = "light";
    } else if (settings.theme === "dark") {
      mode = "dark";
    } else {
      mode = osScheme === "light" ? "light" : "dark";
    }
    return createTheme(mode);
  }, [settings.theme, osScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
