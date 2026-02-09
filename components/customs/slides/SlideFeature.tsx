import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SlideFeature() {
    const inset = useSafeAreaInsets();
    return (
        <View className="flex-1 flex-col items-center" style={{ paddingTop: inset.top + 92, backgroundColor: "#2baf90" }}>
            <Image
                source={require("@/assets/images/slides/slide2.2.png")}
                style={{ width: "100%", height: 300 }}
                contentFit="contain"
            />
            <View className="mt-10">
                <Text className="text-4xl font-bold text-center text-white mb-2">
                    Thông Tin Phòng Trọ
                </Text>
                <Text className="text-4xl font-bold text-center mb-4 text-white">
                    Minh Bạch
                </Text>

                <Text className="text-base text-white px-6 leading-6 text-center">
                    Thông tin phòng trọ được xác thực rõ ràng, từ hình ảnh, địa chỉ, giá thuê đến tiện ích,
                    tạo sự tin cậy cho chủ trọ.
                </Text>
            </View>
        </View>
    );
}
