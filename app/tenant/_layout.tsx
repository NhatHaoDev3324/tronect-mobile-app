import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable, type ViewProps } from "react-native";
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
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="chatbot/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="login/index" options={{ headerShown: false }} />
                <Stack.Screen name="register/index" options={{ headerShown: false }} />
                <Stack.Screen
                    name="role-authentication/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="profile/index"
                    options={{
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerBackVisible: false,
                        title: "Hồ sơ của tôi",
                        headerLeft: () => (
                            <Pressable
                                onPress={() => router.back()}
                                style={{ paddingHorizontal: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color={textColor} />
                            </Pressable>
                        ),
                    }}
                />
                <Stack.Screen
                    name="edit-profile/index"
                    options={{
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerBackVisible: false,
                        title: "Chỉnh sửa hồ sơ cá nhân",
                        headerLeft: () => (
                            <Pressable
                                onPress={() => router.back()}
                                style={{ paddingHorizontal: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color={textColor} />
                            </Pressable>
                        ),
                    }}
                />
                <Stack.Screen
                    name="appearance/index"
                    options={{
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerBackVisible: false,
                        title: "Giao diện hiển thị",
                        headerLeft: () => (
                            <Pressable
                                onPress={() => router.back()}
                                style={{ paddingHorizontal: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color={textColor} />
                            </Pressable>
                        ),
                    }}
                />
                <Stack.Screen
                    name="change-password/index"
                    options={{
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerBackVisible: false,
                        title: "Đổi mật khẩu",
                        headerLeft: () => (
                            <Pressable
                                onPress={() => router.back()}
                                style={{ paddingHorizontal: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color={textColor} />
                            </Pressable>
                        ),
                    }}
                />
                <Stack.Screen
                    name="support/index"
                    options={{
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerBackVisible: false,
                        title: "Hỗ trợ khách hàng",
                        headerLeft: () => (
                            <Pressable
                                onPress={() => router.back()}
                                style={{ paddingHorizontal: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color={textColor} />
                            </Pressable>
                        ),
                    }}
                />
                <Stack.Screen
                    name="faq/index"
                    options={{
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerBackVisible: false,
                        title: "Câu hỏi thường gặp",
                        headerLeft: () => (
                            <Pressable
                                onPress={() => router.back()}
                                style={{ paddingHorizontal: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color={textColor} />
                            </Pressable>
                        ),
                    }}
                />
                <Stack.Screen
                    name="saved-posts/index"
                    options={{
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerBackVisible: false,
                        title: "Tin đăng đã lưu",
                        headerLeft: () => (
                            <Pressable
                                onPress={() => router.back()}
                                style={{ paddingHorizontal: 12 }}
                            >
                                <Ionicons name="arrow-back" size={24} color={textColor} />
                            </Pressable>
                        ),
                    }}
                />
                <Stack.Screen
                    name="post-detail/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="panorama360/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="all-service/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="all-service/service"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="all-service/detail"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="manage-posts/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="edit-post/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="room-chat/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="forgot-password/index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="reset-password/index"
                    options={{ headerShown: false }}
                />
            </Stack>
        </GestureHandlerRootView>
    );
}
