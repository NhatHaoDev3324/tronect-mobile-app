import { HapticTab } from "@/components/haptic-tab";
import { useThemeColor } from "@/hooks/use-theme-color";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from '@expo/vector-icons/Octicons';
import { Tabs, router } from "expo-router";
import React from "react";
import { Pressable, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function TabLayout({
  lightColor,
  darkColor,
}: ThemedViewProps) {
   const insets = useSafeAreaInsets();
   const textColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      "text"
    );
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
            headerShown: true,
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
        onPress={() => router.push("/tenant/modal")}
        style={{
          position: "absolute",
          right: 20,
          bottom: insets.bottom + 64,
          width: 48,
          height: 48,
          borderRadius: 28,
          backgroundColor: textColor+"20",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Octicons name="dependabot" size={24} color={textColor} />
      </Pressable>
    </View>
  );
}
