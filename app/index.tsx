import { onboardingSlides } from "@/constants/onboardingSlides";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Pressable,
    Text,
    View
} from "react-native";
const { width } = Dimensions.get("window");

export default function Index() {
    const router = useRouter();
    const ref = useRef<FlatList>(null);

    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const checkOnboarding = async () => {
            const seen = await AsyncStorage.getItem("SeenOnboarding");

            if (seen === "false") {
                router.replace("/tenant/(tabs)");
            }

            setTimeout(() => {
                setLoading(false);
            }, 1500);
        };

        checkOnboarding();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const finishOnboarding = async () => {
        await AsyncStorage.setItem("SeenOnboarding", "true");
        router.replace("/tenant");
    };

    const goNext = () => {
        if (currentIndex < onboardingSlides.length - 1) {
            ref.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            finishOnboarding();
        }
    };

    const goBack = () => {
        if (currentIndex > 0) {
            ref.current?.scrollToIndex({
                index: currentIndex - 1,
                animated: true,
            });
        }
    };

    const skipOnboarding = () => {
        finishOnboarding();
    };


    if (loading) return (
        <View style={{ flex: 1, backgroundColor: "#2baf90", alignItems: "center", justifyContent: "center" }}>
            <View className="flex-col items-center">
                <Image
                    source={require('@/assets/logo/dark-Logo.png')}
                    style={{

                        width: 160,
                        height: 160,
                        resizeMode: 'contain',
                    }}
                />
                <Image
                    source={require('@/assets/logo/dark-word.png')}
                    style={{
                        width: 180,
                        height: 48,
                        marginBottom: 20,
                        resizeMode: 'contain',
                    }}
                />
            </View>
        </View>
    );


    return (
        <View style={{ flex: 1 }}>
            <FlatList
                ref={ref}
                data={onboardingSlides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ width }}>
                        {item.component({ onStart: finishOnboarding })}
                    </View>
                )}
                onMomentumScrollEnd={(e) => {
                    const i = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(i);
                }}
            />
            <Image
                source={require("@/assets/logo/dark-LogoWithWord-v.png")}
                style={{ width: 140, height: 40, position: "absolute", top: 62, left: 20 }}
                contentFit="contain"
            />
            <Pressable onPress={skipOnboarding} style={{ position: "absolute", top: 72, right: 20, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, opacity: 0.8, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "black" }}>
                    Bỏ qua
                </Text>
            </Pressable>
            <View
                style={{
                    position: "absolute",
                    bottom: 100,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: 32,
                }}
            >
                <Pressable onPress={goBack} disabled={currentIndex === 0} className={`flex-row items-center justify-center gap-2 ${currentIndex === 0 ? "opacity-0" : "opacity-100"}`}>
                    <ArrowLeftIcon size={20} color="#fff" />
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
                        Quay lại
                    </Text>
                </Pressable>

                <View style={{
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center", gap: 5
                }}>
                    {onboardingSlides.map((_, dotIndex) => {
                        const isActive = dotIndex === currentIndex;
                        return (
                            <View
                                key={dotIndex}
                                style={{
                                    width: isActive ? 12 : 6,
                                    height: isActive ? 12 : 6,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 99,
                                    backgroundColor: isActive ? "#fff" : "#ffffff80",
                                    marginHorizontal: 4,
                                }}
                            />
                        );
                    })}
                </View>

                <Pressable onPress={goNext} className="flex-row items-center justify-center gap-2">
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
                        {currentIndex === onboardingSlides.length - 1 ? "Bắt đầu" : "Tiếp tục"}
                    </Text>
                    <ArrowRightIcon size={20} color={"#fff"} />
                </Pressable>

            </View>
        </View>
    );
}
