import { Panorama360View } from "@/components/customs/Panorama360Screen";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Panorama360Screen() {
    const { imageUrl } = useLocalSearchParams<{ imageUrl: string }>();
    const insets = useSafeAreaInsets();

    if (!imageUrl) return null;

    return (
        <View className="flex-1 bg-black">
            <View
                style={{ paddingTop: insets.top + 12 }}
                className="flex-row items-center border-b px-4 py-3 bg-[#2baf90]"
            >
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>

                <Text className="ml-4 text-xl font-semibold text-white">
                    Xem phòng 360
                </Text>
            </View>

            <View className="flex-1">
                <Panorama360View imageUrl={imageUrl} />
            </View>
        </View>
    );
}
