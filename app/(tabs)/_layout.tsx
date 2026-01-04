import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {

  return (
     <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,  
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Trang chủ',
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Tìm kiếm",
          headerShown: true,
          tabBarIcon: ({ color }) => <Feather name="search" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="post"
        options={{
          title: "Đăng bài",
          headerShown: true,
          tabBarIcon: ({ color }) => <AntDesign name="plus-circle" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Nhắn tin",
          headerShown: true,
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
