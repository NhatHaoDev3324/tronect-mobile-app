import { tenantMyProfile } from "@/api/authTenantApi";
import { HapticTab } from "@/components/haptic-tab";
import { useAuthStore } from "@/store/useAuthStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    const setUserID = useAuthStore((s) => s.setUserID);
    const setRole = useAuthStore((s) => s.setRole);
    const setUserName = useAuthStore((s) => s.setUserName);
    const setUrlImg = useAuthStore((s) => s.setUrlImg);
    const setPhone = useAuthStore((s) => s.setPhone);
    const setProvider = useAuthStore((s) => s.setProvider);
    const setCreated = useAuthStore((s) => s.setCreated);
    const reset = useAuthStore((s) => s.reset);

    useEffect(() => {
        const init = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                if (token) {
                    const res = await tenantMyProfile();
                    const profile = res.data || res;
                    setUserID(profile.id);
                    setRole(profile.role);
                    setUserName(profile.username);
                    setUrlImg(profile.picture);
                    setPhone(profile.phone);
                    setProvider(profile.provider);
                    setCreated(profile.created_at);
                }
            } catch (err) {
                console.error("Auto-login failed:", err);
                reset();
                await AsyncStorage.removeItem("token");
            } finally {
                router.replace("/tenant");
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarButton: HapticTab,
                    tabBarInactiveTintColor: "#9CA3AF",
                    tabBarActiveTintColor: "#2baf90",
                    tabBarLabelStyle: {
                        fontSize: 12,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Trang chủ",
                        tabBarIcon: ({ color }) => (
                            <AntDesign name="home" size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="search"
                    options={{
                        title: "Tìm kiếm",
                        tabBarIcon: ({ color }) => (
                            <Feather name="search" size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="post"
                    options={{
                        title: "Đăng bài",
                        headerShown: true,
                        tabBarIcon: ({ color }) => (
                            <AntDesign name="plus-circle" size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="chat"
                    options={{
                        title: "Nhắn tin",
                        headerShown: true,
                        tabBarIcon: ({ color }) => (
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="account"
                    options={{
                        title: "Tài khoản",
                        tabBarIcon: ({ color }) => (
                            <Feather name="user" size={24} color={color} />
                        ),
                    }}
                />
            </Tabs>
            <Pressable
                onPress={() => router.push("/tenant/chatbot")}
                style={{
                    position: "absolute",
                    right: 20,
                    bottom: insets.bottom + 64,
                    width: 48,
                    height: 48,
                    borderRadius: 28,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: 0,
                    backgroundColor: "#2baf90",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* <Octicons name="dependabot" size={24} color={textColor} /> */}

                <Image
                    source={require("@/assets/images/chatbot.png")}
                    style={{ width: 52, height: 52, marginBottom: 8 }}
                    contentFit="cover"
                />
            </Pressable>
        </View>
    );
}
