import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};
const PricingScreen = (props: ThemedViewProps) => {
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor(
        { light: props.lightColor, dark: props.darkColor },
        "background"
    );
    return (
        <View className="flex-1" style={{ backgroundColor: backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                        onPress={() => router.back()}
                        style={{ paddingHorizontal: 12 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-xl font-bold text-white">Bảng giá dịch vụ</Text>
                </View>
            </View>
            <ScrollView>
                <View className="mt-6 mb-2 px-4">
                    <Text className="text-2xl font-bold">Bảng giá dịch vụ Tronect</Text>
                    <Text className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Tất cả mức phí được áp dụng cho việc đăng tin cho thuê phòng trên nền tảng Tronect.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default PricingScreen;