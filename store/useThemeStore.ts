import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  hydrate: () => Promise<void>;
};

const STORAGE_KEY = "app_theme_mode";

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",

  setMode: async (mode) => {
    set({ mode });
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  },

  hydrate: async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      set({ mode: saved });
    }
  },
}));
