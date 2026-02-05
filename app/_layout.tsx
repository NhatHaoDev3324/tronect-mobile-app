import { useEffect, useMemo } from "react";
import { Appearance } from "react-native";

import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useColorScheme as useNWColorScheme } from "nativewind";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import "../global.css";

import ChatRealtimeProvider from "@/providers/ChatRealtimeProvider";
import { useThemeStore } from "@/store/useThemeStore";

export const unstable_settings = {
    anchor: "(tabs)",
};
try {
    SplashScreen.preventAutoHideAsync();
} catch (e) {
    console.log(e);
}
export default function RootLayout() {
    const { mode, hydrate } = useThemeStore();
    const { setColorScheme } = useNWColorScheme();

    const systemScheme = Appearance.getColorScheme() ?? "light";

    const effectiveScheme = useMemo(() => {
        if (mode === "system") return systemScheme;
        return mode;
    }, [mode, systemScheme]);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        setColorScheme(mode);
    }, [mode, setColorScheme]);

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <ThemeProvider value={effectiveScheme === "dark" ? DarkTheme : DefaultTheme}>
            <ChatRealtimeProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="tenant" />
                </Stack>

                <PortalHost />
                <Toast topOffset={60} />
                <StatusBar style="auto" />
                <PortalHost />
            </ChatRealtimeProvider>
        </ThemeProvider>
    );
}
