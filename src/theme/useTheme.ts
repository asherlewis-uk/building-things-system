import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import { createTheme, type Theme } from "./tokens";

const ThemeContext = createContext<Theme>(createTheme("dark"));

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export { ThemeContext, createTheme };
export type { Theme };
