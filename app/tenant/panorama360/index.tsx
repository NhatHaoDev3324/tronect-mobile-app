import { Panorama360View } from "@/components/customs/Panorama360Screen";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Panorama360Screen() {
    const params = useLocalSearchParams<{ imageUrl?: string }>();
    const insets = useSafeAreaInsets();

    const imageUrl = params.imageUrl
        ? decodeURIComponent(params.imageUrl).replace(/^"+|"+$/g, "")
        : null;

    if (!imageUrl) return null;

    return (
        <View className="flex-1 bg-black">
            <LinearGradient
                colors={["#3b82f6", "#7c3aed", "#a78bfa"]}
                start={[0, 0]}
                end={[1, 1]}
                style={{
                    paddingTop: insets.top + 12,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 28,
                    paddingVertical: 12,
                }}
            >
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>

                <Text className="ml-4 text-xl font-semibold text-white">
                    Xem phòng 360
                </Text>
            </LinearGradient>

            <View className="flex-1">
                <Panorama360View imageUrl={imageUrl} />
            </View>
        </View>
    );
}
