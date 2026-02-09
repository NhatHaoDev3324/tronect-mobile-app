import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SlideStart() {
    const inset = useSafeAreaInsets()
    return (
        <View className="flex-1 flex-col items-center" style={{ paddingTop: inset.top + 80, backgroundColor: "#2baf90" }}>
            <Image
                source={require("@/assets/images/slides/slide4.4.png")}
                style={{ width: "100%", height: 300 }}
                contentFit="contain"
            />
            <View className="mt-6">
                <Text className="text-4xl font-bold text-center mb-2 text-white">
                    Bạn Sẵn Sàng Chưa?
                </Text>
                <Text className="text-base text-white px-6 leading-6 text-center">
                    Đăng ký tài khoản để bắt đầu hành trình tìm kiếm và quản lý phòng trọ của bạn ngay hôm nay!
                </Text>
                <View className="flex-col justify-center mt-8 items-center">
                    <Text className="text-sm text-white mb-2">
                        Bạn chưa có tài khoản?
                    </Text>

                    <Pressable
                        onPress={async () => {
                            await AsyncStorage.setItem("SeenOnboarding", "true");
                            router.push("/tenant/role-authentication")
                        }}
                        className="w-1/2 py-2 rounded-full"
                        style={{ backgroundColor: "#fff" }}
                    >
                        <Text className="text-base font-medium text-black text-center">
                            Đăng ký ngay
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={async () => {
                            await AsyncStorage.setItem("SeenOnboarding", "true");
                            router.push("/tenant/role-authentication")
                        }}
                        className="mt-3"
                    >
                        <Text className="text-sm text-white">
                            Đã có tài khoản? <Text className="text-white font-medium underline">Đăng nhập</Text>
                        </Text>
                    </Pressable>
                </View>

            </View>
        </View>
    );
}   
