import {
  Linking,
  Pressable,
  ScrollView,
  View,
  type ViewProps,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function SupportScreen({
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const phoneNumber = "0832500785";
  const zaloLink = "https://zalo.me/0832500785";

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <ThemedView className="mt-8 mb-4 px-4">
        <Text className="text-xl font-bold text-foreground">
          Hỗ trợ khách hàng Tronect
        </Text>
        <Text className="text-sm text-muted-foreground mt-2">
          Chúng tôi sẵn sàng hỗ trợ bạn. Nếu bạn cần trợ giúp, vui lòng liên hệ:
        </Text>
      </ThemedView>

      <View className="items-center mt-6 mb-12 ">
        <Image
          source={require("@/assets/images/help.png")}
          style={{ width: 260, height: 260 }}
          resizeMode="contain"
        />
      </View>

      <ThemedView className="px-4 gap-4">
        <Pressable
          onPress={() => Linking.openURL(`tel:${phoneNumber}`)}
          className="flex-row items-center justify-center rounded-xl bg-[#2bb58a] py-2"
        >
          <Ionicons name="call" size={20} color="white" />
          <Text className="ml-2 text-white font-semibold">
            Gọi qua điện thoại
          </Text>
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL(zaloLink)}
          className="flex-row items-center justify-center rounded-xl bg-[#2f7cf6] py-2"
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          <Text className="ml-2 text-white font-semibold">Zalo</Text>
        </Pressable>
      </ThemedView>

      <ThemedView className="mt-4 px-4">
        <Text className="text-center text-xs text-muted-foreground">
          ⏰ Thời gian hỗ trợ: 8:00 - 22:00 (Thứ 2 - Chủ nhật)
        </Text>
      </ThemedView>
    </ScrollView>
  );
}
