import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack } from "expo-router";
import { type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};
export default function TenantLayout({
    lightColor,
    darkColor,
}: ThemedViewProps) {
    const textColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "text"
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack>
                <Stack.Screen
                    name="login/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="forgot-password/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="register/index"
                    options={{ headerShown: false }}
                />
            </Stack>
        </GestureHandlerRootView>
    );
}
