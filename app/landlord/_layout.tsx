import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function TenantLayout() {

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
                <Stack.Screen
                    name="pricing/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="payments/index"
                    options={{ headerShown: false }}
                />
            </Stack>
        </GestureHandlerRootView>
    );
}
