import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SlideTechnology() {
    const inset = useSafeAreaInsets();
    return (
        <View className="flex-1 flex-col items-center" style={{ paddingTop: inset.top + 80, backgroundColor: "#fff" }}>
            <Image
                source={require("@/assets/images/slides/slide3.png")}
                style={{ width: "100%", height: 300 }}
                contentFit="contain"
            />
            <View className="mt-8">
                <Text className="text-4xl font-bold text-center">
                    Công Nghệ Hiện Đại,
                </Text>
                <Text className="text-4xl font-bold text-center mb-4">
                    Trải Nghiệm Mượt Mà
                </Text>

                <Text className="text-base text-muted-foreground px-6 leading-6 text-center">
                    Ứng dụng Trí tuệ Nhân tạo cùng với tính năng xem phòng trọ 360°, mang đến cái nhìn
                    trực quan, giúp người thuê đánh giá chính xác và lựa chọn nhanh chóng hơn.
                </Text>
            </View>
        </View>
    );
}
