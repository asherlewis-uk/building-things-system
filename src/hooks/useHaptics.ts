import * as Haptics from "expo-haptics";
import { useCallback } from "react";

import { useSettings } from "@/context/SettingsContext";

export function useHaptics() {
  const { settings } = useSettings();

  const selection = useCallback(() => {
    if (!settings.hapticFeedback) {
      return;
    }

    void Haptics.selectionAsync();
  }, [settings.hapticFeedback]);

  const impact = useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      if (!settings.hapticFeedback) {
        return;
      }

      void Haptics.impactAsync(style);
    },
    [settings.hapticFeedback],
  );

  return {
    selection,
    impact,
  };
}
