import { onboardingSlides } from "@/constants/onboardingSlides";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
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
try {
    SplashScreen.preventAutoHideAsync();
} catch (e) {
    console.log(e);
}
export default function Index() {
    const router = useRouter();
    const ref = useRef<FlatList>(null);

    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const checkOnboarding = async () => {
            const seen = await AsyncStorage.getItem("SeenOnboarding");

            if (seen === "true") {
                router.replace("/tenant/(tabs)");
            }

            setLoading(false);
            await SplashScreen.hideAsync();
        };

        checkOnboarding();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const finishOnboarding = async () => {
        await AsyncStorage.setItem("SeenOnboarding", "true");
        router.replace("/tenant/(tabs)");
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


    if (loading) return null;


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
                source={require("@/assets/logo/light-LogoWithWord-v.png")}
                style={{ width: 140, height: 40, position: "absolute", top: 62, left: 20 }}
                contentFit="contain"
            />
            <Pressable onPress={skipOnboarding} style={{ position: "absolute", top: 72, right: 20, backgroundColor: "#000", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, opacity: 0.4, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
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
                    <ArrowLeftIcon size={20} color="#2baf90" />
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#2baf90" }}>
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
                                    backgroundColor: isActive ? "#2baf90" : "#d1d5db",
                                    marginHorizontal: 4,
                                }}
                            />
                        );
                    })}
                </View>

                <Pressable onPress={goNext} className="flex-row items-center justify-center gap-2">
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#2baf90" }}>
                        {currentIndex === onboardingSlides.length - 1 ? "Bắt đầu" : "Tiếp tục"}
                    </Text>
                    <ArrowRightIcon size={20} color={"#2baf90"} />
                </Pressable>

            </View>
        </View>
    );
}
