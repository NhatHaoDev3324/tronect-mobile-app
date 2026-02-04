import { Image } from "expo-image";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SlideWelcome() {
    const inset = useSafeAreaInsets();
    return (
        <View className="flex-1 flex-col items-center" style={{ paddingTop: inset.top + 100, backgroundColor: "#fff" }}>
            <Image
                source={require("@/assets/images/slides/slide1.png")}
                style={{ width: "100%", height: 300 }}
                contentFit="contain"
            />
            <View className="mt-8">
                <Text className="text-4xl font-bold text-center">
                    Nền Tảng Kết Nối
                </Text>
                <Text className="text-4xl font-bold text-center mb-4">
                    Chủ Trọ Và Người Thuê
                </Text>

                <Text className="text-base text-muted-foreground px-6 leading-6 text-center">
                    Nền tảng chuyển đổi số trong việc tìm kiếm và quản lý phòng trọ, hỗ trợ người thuê
                    dễ dàng lựa chọn nơi ở phù hợp, đồng thời hỗ trợ chủ trọ quản lý phòng trọ hiệu quả,
                    tiết kiệm thời gian.
                </Text>


            </View>
        </View>
    );
}
