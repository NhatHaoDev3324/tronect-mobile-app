import { getByIDPartnerService } from "@/api/partnersServicesApi";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PartnerServiceType } from "@/types/serviceType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DetailServicePage = () => {
    const insets = useSafeAreaInsets();
    const { title, id } = useLocalSearchParams<{
        title?: string;
        id?: string;
    }>();
    const backgroundColor = useThemeColor({}, "background");
    const [data, setData] = useState<PartnerServiceType>();
    const [loading, setLoading] = useState(true);

    const fetchData = async (idItem: string) => {
        setLoading(true);
        try {
            const res = await getByIDPartnerService(idItem)
            setData(res)
        } catch (error) {
            console.log("Error", error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (id) {
            fetchData(id)
        }
    }, [id])

    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View
                style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }}
                className="flex-row items-center justify-between px-4 py-3"
            >
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>

                <Text className="text-xl font-semibold text-white">
                    {title}
                </Text>

                <Pressable >
                    <Ionicons name="refresh" size={22} color="white" />
                </Pressable>
            </View>
            <ScrollView>

            </ScrollView >



            <View
                style={{
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    borderTopWidth: 0.2,
                    borderTopColor: "#d1d5db",
                }}
            >
                <View className="flex-row items-center">
                    {
                        true ?
                            (
                                <View className="w-1/2 h-full flex-row items-center justify-center">
                                    <View className="w-1/2 h-full items-center justify-center border-r border-border">
                                        <Pressable className="items-center justify-center">
                                            <Image
                                                source={require("@/assets/icon/GoogleIcon.png")}
                                                style={{ width: 32, height: 32 }}
                                                contentFit="cover"

                                            />
                                        </Pressable>
                                    </View>
                                    <View className="w-1/2 h-full items-center justify-center border-l border-border">
                                        <Pressable className="items-center justify-center" >
                                            <Image
                                                source={require("@/assets/icon/zalo.svg")}
                                                style={{ width: 40, height: 40 }}
                                                contentFit="cover"

                                            />
                                        </Pressable>
                                    </View>
                                </View>
                            ) : (
                                <View className="w-1/2 h-full items-center justify-center">
                                    <Pressable className="flex-row items-center justify-center gap-2">
                                        <Ionicons
                                            name="chatbubble-ellipses"
                                            size={28}
                                            color="#2baf90"
                                        />
                                        <Text className="text-base font-bold text-foreground">
                                            Nhắn tin
                                        </Text>
                                    </Pressable>
                                </View>
                            )
                    }


                    <View className="w-2/4 h-full items-center justify-center bg-red-600">
                        <Pressable className="flex-row gap-2 items-center justify-center">
                            <Ionicons name="call" size={20} color="white" />
                            <Text className="text-base font-bold text-white">
                                Gọi ngay
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default DetailServicePage;
