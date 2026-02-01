import { getByIDPartnerService } from "@/api/partnersServicesApi";
import { DividerCustom } from "@/components/customs/DividerCustom";
import { LoadingData } from "@/components/customs/LoadingData";
import RequireAuthOnEnter from "@/components/customs/RequireAuthOnEnter";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PartnerServiceType } from "@/types/serviceType";
import { formatTimeAgo } from "@/utils/formatDateTime";
import { getOpenStatusUI } from "@/utils/getOpenStatus";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
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
    const openStatus = getOpenStatusUI(data?.working_hours ?? "");


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
                <RequireAuthOnEnter enabled={true} />
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>

                <Text className="text-xl font-semibold text-white">
                    {title}
                </Text>

                <View className="w-4" />
            </View>

            {
                loading ? (
                    <View className="flex-1 items-center justify-center">
                        <LoadingData />
                    </View>
                ) :
                    (
                        <ScrollView>
                            <View className="relative">
                                <Image
                                    source={{ uri: data?.image }}
                                    style={{ width: "100%", height: 260 }}
                                    contentFit="cover"
                                />
                                <View
                                    style={[
                                        {
                                            position: "absolute",
                                            top: 12,
                                            right: 12,
                                            borderRadius: 999,
                                            paddingHorizontal: 12,
                                            paddingVertical: 4,
                                        },
                                        openStatus.style,
                                    ]}
                                >
                                    <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                                        {openStatus.label}
                                    </Text>
                                </View>


                            </View>
                            <View className="px-4 py-2 flex-col mt-2 gap-1">
                                <Text
                                    className="text-2xl font-bold leading-6 text-foreground"
                                    numberOfLines={2}
                                >
                                    {data?.title}
                                </Text>

                                <View className="flex-row items-center justify-between flex-wrap">
                                    <Text className="text-red-500 text-base font-bold">
                                        Giá từ {Number(data?.price_note).toLocaleString()} đồng
                                    </Text>
                                    <Text className={"text-muted-foreground"}>
                                        {formatTimeAgo(data?.updated_at)}
                                    </Text>
                                </View>

                                <View className="flex-row items-start gap-2 ">
                                    <Ionicons
                                        name="location-outline"
                                        size={16}
                                        color="#6b7280"
                                        style={{ marginTop: 2 }}
                                    />
                                    <Text
                                        className="text-sm text-muted-foreground flex-1"
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        {data?.address}
                                    </Text>
                                </View>
                            </View>

                            <View className="py-1">
                                <DividerCustom />
                            </View>

                            <View className="w-full py-2 px-4">

                                <View className="flex-row py-1">
                                    <Text className="w-32 font-medium text-foreground">Thời gian mở cửa:</Text>
                                    <Text className="flex-1 text-foreground">
                                        {data?.working_hours}
                                    </Text>
                                </View>

                                <View className="flex-row py-1">
                                    <Text className="w-32 font-medium text-foreground">Tỉnh/TP:</Text>
                                    <Text className="flex-1 text-foreground">{data?.province}</Text>
                                </View>


                                <View className="flex-row py-1">
                                    <Text className="w-32 font-medium text-foreground">Quận/Huyện:</Text>
                                    <Text className="flex-1 text-foreground">{data?.district}</Text>
                                </View>


                                <View className="flex-row py-1">
                                    <Text className="w-32 font-medium text-foreground">Phường/Xã:</Text>
                                    <Text className="flex-1 text-foreground">{data?.ward}</Text>
                                </View>


                                <View className="flex-row py-1">
                                    <Text className="w-32 font-medium text-foreground">Đường:</Text>
                                    <Text className="flex-1 text-foreground">{data?.street}</Text>
                                </View>


                                <View className="flex-row py-1">
                                    <Text className="w-32 font-medium text-foreground">Số nhà:</Text>
                                    <Text className="flex-1 text-foreground">{data?.house_number}</Text>
                                </View>
                            </View>

                            <View className="py-1">
                                <DividerCustom />
                            </View>

                            <View className="px-4 py-2 flex-col gap-1">
                                <Text className="text-lg font-bold text-foreground">
                                    Vị trí & bản đồ
                                </Text>
                                <View className="flex-row items-start gap-2 ">
                                    <Ionicons
                                        name="location-outline"
                                        size={16}
                                        color="#6b7280"
                                        style={{ marginTop: 2 }}
                                    />
                                    <Text
                                        className="text-sm text-muted-foreground flex-1"
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        Địa chỉ: {data?.address}
                                    </Text>
                                </View>
                                <View className="w-full rounded-xl overflow-hidden">
                                    <MapView
                                        style={{ width: "100%", height: 300 }}
                                        initialRegion={{
                                            latitude: Number(data?.lat),
                                            longitude: Number(data?.lng),
                                            latitudeDelta: 0.005,
                                            longitudeDelta: 0.005,
                                        }}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: Number(data?.lat),
                                                longitude: Number(data?.lng),
                                            }}
                                            title={data?.title}
                                        />
                                    </MapView>
                                </View>
                            </View>

                            <View className="py-1">
                                <DividerCustom />
                            </View>
                            <View className="px-4 py-2 flex-col gap-1">
                                <Text className="text-lg font-bold text-foreground">
                                    Thông tin mô tả
                                </Text>
                                <Text className="text-base text-foreground">
                                    {data?.description}
                                </Text>
                            </View>


                        </ScrollView >

                    )
            }

            <View
                style={{
                    height: 52 + insets.bottom,
                    paddingBottom: insets.bottom,
                    borderTopWidth: 0.2,
                    borderTopColor: "#d1d5db",
                }}
            >
                <View className="flex-row items-center">
                    {data?.zalo ?
                        (
                            <View className="w-1/2 h-full flex-row items-center justify-center">
                                <View className="w-1/2 h-12 items-center justify-center border-r border-border">
                                    <Pressable className="items-center justify-center" onPress={() => { Linking.openURL(`https://www.google.com/maps?q=${data?.lat},${data?.lng}`) }}>
                                        <Image
                                            source={require("@/assets/icon/GoogleIcon.png")}
                                            style={{ width: 32, height: 32 }}
                                            contentFit="cover"
                                        />
                                    </Pressable>
                                </View>
                                <View className="w-1/2 h-12 items-center justify-center border-l border-border">
                                    <Pressable className="items-center justify-center" onPress={() => { Linking.openURL(`https://zalo.me/${data?.zalo}`) }} >
                                        <Image
                                            source={require("@/assets/icon/zalo.svg")}
                                            style={{ width: 40, height: 40 }}
                                            contentFit="cover"
                                        />
                                    </Pressable>
                                </View>
                            </View>
                        ) : (
                            <View className="w-1/2 h-12 items-center justify-center">
                                <Pressable className="flex-row items-center justify-center gap-2" onPress={() => { Linking.openURL(`https://www.google.com/maps?q=${data?.lat},${data?.lng}`) }}>
                                    <Image
                                        source={require("@/assets/icon/GoogleIcon.png")}
                                        style={{ width: 28, height: 28 }}
                                        contentFit="cover"

                                    />
                                    <Text className="text-base font-bold text-foreground">
                                        Xem vị trí
                                    </Text>
                                </Pressable>
                            </View>
                        )
                    }
                    <View className="w-2/4 h-12 items-center justify-center bg-red-600">
                        <Pressable className="flex-row gap-2 items-center justify-center" onPress={() => { Linking.openURL(`tel:${data?.phone}`) }}>
                            <Ionicons name="call" size={20} color="white" />
                            <Text className="text-base font-bold text-white">
                                Gọi ngay
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View >
    );
};

export default DetailServicePage;
