import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Building2, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IMAGES = {
    tenant: require("@/assets/images/thuetro.jpg"),
    landlord: require("@/assets/images/chutro.jpg"),
};

export default function RoleAuthentication() {
    const colorScheme = useColorScheme();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function preloadAssets() {
            try {
                const assetPromises = [
                    Asset.fromModule(IMAGES.tenant).downloadAsync(),
                    Asset.fromModule(IMAGES.landlord).downloadAsync(),
                ];
                await Promise.all(assetPromises);
            } catch (e) {
                console.warn("Error preloading assets:", e);
            } finally {
                setIsReady(true);
            }
        }
        preloadAssets();
    }, []);

    const logoSource =
        colorScheme === "dark"
            ? require("@/assets/logo/dark-LogoWithWord-v.png")
            : require("@/assets/logo/light-LogoWithWord-v.png");

    if (!isReady) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-background">
                <View className="items-center">
                    <Image
                        source={logoSource}
                        style={{ height: 60, width: 200, opacity: 0.5 }}
                        contentFit="contain"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-background pb-4">
            <View className="px-10">
                <View className="items-center mb-6">
                    <Image
                        source={logoSource}
                        style={{ height: 60, width: 280 }}
                        contentFit="contain"
                        priority="high"
                    />
                    <View className="items-center w-64 mt-3">
                        <Text className="text-muted-foreground text-center px-6">
                            Bạn sử dụng Tronect với tư cách là người thuê hay chủ trọ?
                        </Text>
                    </View>
                </View>

                <View className="flex-col gap-4">
                    <Pressable
                        onPress={() => router.push("/tenant/login")}
                        className="overflow-hidden rounded-2xl bg-card border border-border/50 shadow-xl shadow-black/10 active:opacity-90 active:scale-[0.98]"
                    >
                        <View className="h-40 w-full relative">
                            <Image
                                source={IMAGES.tenant}
                                style={StyleSheet.absoluteFill}
                                contentFit="cover"
                                priority="high"
                                cachePolicy="memory-disk"
                            />
                            <LinearGradient
                                colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]}
                                style={StyleSheet.absoluteFill}
                            />
                            <View className="flex-1 justify-end px-6 py-4">
                                <View className="flex-row items-center gap-3">
                                    <User color="white" size={24} />
                                    <Text className="text-white text-xl font-bold mt-1">
                                        Người thuê / Tìm trọ
                                    </Text>
                                </View>
                                <Text className="text-white/80 leading-5">
                                    Dành cho người đang tìm kiếm phòng trọ, nhà ở hoặc ký túc xá.
                                </Text>
                            </View>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push("/landlord/login")}
                        className="overflow-hidden rounded-2xl bg-card border border-border/50 shadow-xl shadow-black/10 active:opacity-90 active:scale-[0.98]"
                    >
                        <View className="h-40 w-full relative">
                            <Image
                                source={IMAGES.landlord}
                                style={StyleSheet.absoluteFill}
                                contentFit="cover"
                                priority="high"
                                cachePolicy="memory-disk"
                            />
                            <LinearGradient
                                colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]}
                                style={StyleSheet.absoluteFill}
                            />
                            <View className="flex-1 justify-end px-6 py-4">
                                <View className="flex-row items-center gap-3">
                                    <Building2 color="white" size={24} />
                                    <Text className="text-white text-xl font-bold mt-1">
                                        Chủ trọ
                                    </Text>
                                </View>
                                <Text className="text-white/80 leading-5">
                                    Dành cho chủ nhà, quản lý trọ muốn đăng bài và quản lý người thuê.
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                </View>

                <Pressable
                    onPress={() => router.back()}
                    className="mt-10 self-center flex-row items-center gap-1"
                >
                    <Ionicons name="chevron-back" size={18} color="gray" />
                    <Text className="text-muted-foreground text-base">Quay lại</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
