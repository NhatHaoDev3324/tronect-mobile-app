import { tenantMyProfile } from "@/api/authTenantApi";
import { HapticTab } from "@/components/haptic-tab";
import { useAuthStore } from "@/store/useAuthStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function TabLayout() {
    const { userID } = useAuthStore()
    const setUserID = useAuthStore((s) => s.setUserID);
    const setRole = useAuthStore((s) => s.setRole);
    const setUserName = useAuthStore((s) => s.setUserName);
    const setUrlImg = useAuthStore((s) => s.setUrlImg);
    const setPhone = useAuthStore((s) => s.setPhone);
    const setProvider = useAuthStore((s) => s.setProvider);
    const setCreated = useAuthStore((s) => s.setCreated);

    useEffect(() => {
        const init = async () => {
            try {
                const token = await AsyncStorage.getItem("accessToken");

                if (!token) {
                    return;
                }

                if (!userID) {
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
            } catch (error) {
                console.log("Error loading profile:", error);
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
                        tabBarIcon: ({ color }: { color: string }) => (
                            <AntDesign name="home" size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="search"
                    options={{
                        title: "Tìm kiếm",
                        tabBarIcon: ({ color }: { color: string }) => (
                            <Feather name="search" size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="post"
                    options={{
                        title: "Đăng bài",
                        tabBarIcon: ({ color }: { color: string }) => (
                            <AntDesign name="plus-circle" size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="chat"
                    options={{
                        title: "Nhắn tin",
                        tabBarIcon: ({ color }: { color: string }) => (
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={24}
                                color={color}
                            />
                        ),
                        tabBarBadge: 100 > 0 ? 100 >= 10 ? "9+" : 100 : undefined,
                        tabBarBadgeStyle: {
                            backgroundColor: "#dc2626",
                            color: "white",
                            fontSize: 10,
                        },
                    }}
                />

                <Tabs.Screen
                    name="account"
                    options={{
                        title: "Tài khoản",
                        tabBarIcon: ({ color }: { color: string }) => (
                            <Feather name="user" size={24} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}
