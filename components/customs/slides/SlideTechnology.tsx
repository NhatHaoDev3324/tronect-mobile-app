import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SlideTechnology() {
    const inset = useSafeAreaInsets();
    return (
        <View className="flex-1 flex-col items-center" style={{ paddingTop: inset.top + 100, backgroundColor: "#2baf90" }}>
            <Image
                source={require("@/assets/images/slides/slide3.2.png")}
                style={{ width: "100%", height: 300 }}
                contentFit="contain"
            />
            <View className="mt-8">
                <Text className="text-4xl font-bold text-center text-white mb-2">
                    Chatbot AI
                </Text>
                <Text className="text-4xl font-bold text-center mb-4 text-white">
                    Tối Ưu Tìm Kiếm
                </Text>

                <Text className="text-base text-white px-6 leading-6 text-center">
                    Ứng dụng Chatbot AI giúp tối ưu hóa quá trình tìm kiếm và cung cấp tư vấn phòng trọ phù hợp cho người thuê.
                </Text>
            </View>
        </View>
    );
}
