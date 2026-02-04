import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SlideFeature() {
    const inset = useSafeAreaInsets();
    return (
        <View className="flex-1 flex-col items-center" style={{ paddingTop: inset.top + 100, backgroundColor: "#fff" }}>
            <Image
                source={require("@/assets/images/slides/slide2.png")}
                style={{ width: "100%", height: 300 }}
                contentFit="contain"
            />
            <View className="mt-8">
                <Text className="text-4xl font-bold text-center">
                    Minh Bạch Thông Tin,
                </Text>
                <Text className="text-4xl font-bold text-center mb-4">
                    Chuẩn Hóa Tin Cậy
                </Text>

                <Text className="text-base text-muted-foreground px-6 leading-6 text-center">
                    Thông tin phòng trọ được xác thực rõ ràng, từ hình ảnh, địa chỉ, giá thuê đến tiện ích,
                    cho người thuê dễ dàng đưa ra quyết định và tạo sự tin cậy cho chủ trọ.
                </Text>
            </View>
        </View>
    );
}
