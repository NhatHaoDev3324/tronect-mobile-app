import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";

export default function TenantLayout() {  
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal/index"
        options={{
          title: "Modal",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons name="close" size={24} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="login/index" options={{ headerShown: false }}/>
      <Stack.Screen name="register/index" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password/index" options={{ headerShown: false }} />
      <Stack.Screen name="role-authentication/index" options={{ headerShown: false }} />
    </Stack>
  );
}
