import { createPayment } from "@/api/paymentApi";
import { paymentLink } from "@/api/payosApi";
import { getTempPost } from "@/api/tempPostApi";
import { DividerCustom } from "@/components/customs/DividerCustom";
import { LoadingData } from "@/components/customs/LoadingData";
import StatusDropdown from "@/components/customs/manage-post/StatusDropdown";
import { TagVip } from "@/components/customs/TagVip";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { usePricingConfigStore } from "@/store/pricing-config.store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";


interface ThemedViewProps {
    lightColor?: string;
    darkColor?: string;
}

export default function ChoosePackageScreen(props: ThemedViewProps) {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const [timeType, setTimeType] = useState<"day" | "week" | "month">("day");
    const [postType, setPostType] = useState<"normal" | "vip">("normal");
    const [duration, setDuration] = useState<number>(1);
    const [loadingPost, setLoadingPost] = useState(false);
    const [post, setPost] = useState<{
        province: string;
        district: string;
        ward: string;
        street: string;
        house_number: string;
        address: string;
        lat: number;
        lng: number;
        title: string;
        price: number;
        unit: string;
        acreage: number;
        image: string;
        images: string[];
        video: string;
        landlord_id: string;
    }>();
    const [refreshing, setRefreshing] = useState(false);


    const { postPriceDay, postPriceWeek, postPriceMonth, postTypeVipPrice, fetchPricing, loading, picPrice, videoPrice } = usePricingConfigStore();

    const dataDuration = (timeType: "day" | "week" | "month") => {
        const data = [];
        if (timeType === "day") {
            for (let i = 1; i <= 30; i++) {
                data.push({ label: `${i} ngày`, value: i.toString() });
            }
        } else if (timeType === "week") {
            for (let i = 1; i <= 10; i++) {
                data.push({ label: `${i} tuần`, value: i.toString() });
            }
        } else if (timeType === "month") {
            for (let i = 1; i <= 12; i++) {
                data.push({ label: `${i} tháng`, value: i.toString() });
            }
        }
        return data;
    }

    const backgroundColor = useThemeColor(
        { light: props.lightColor, dark: props.darkColor },
        "background"
    );

    useFocusEffect(
        useCallback(() => {
            void fetchPricing()
        }, [fetchPricing]))

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPricing();
        setRefreshing(false);
    }, [fetchPricing]);

    const calculatePackageTimePrice = () => {
        if (timeType === "day") {
            return Number(postPriceDay);
        } else if (timeType === "week") {
            return Number(postPriceWeek);
        } else if (timeType === "month") {
            return Number(postPriceMonth);
        }
        return 0;
    };

    const calculatePostTypePrice = () => {
        return postType === "vip" ? Number(postTypeVipPrice) : 0;
    };

    const calculateTotalDay = () => {
        if (timeType === "day") {
            return duration;
        } else if (timeType === "week") {
            return duration * 7;
        } else if (timeType === "month") {
            return duration * 30;
        }
        return 0;
    }

    const calculateTotalImagePrice = () => {
        const totalImage = Number(post?.images.length || 0)
        const totalImagePrice = (totalImage - 5) * Number(picPrice);
        return totalImagePrice
    }

    const calculateTotalVideoPrice = () => {
        const totalVideo = post?.video ? 1 : 0;
        const totalVideoPrice = totalVideo * Number(videoPrice);
        return totalVideoPrice
    }

    const calculateTotalPrice = () => {
        return (calculateTotalDay() * calculatePackageTimePrice()) + calculatePostTypePrice() + calculateTotalImagePrice() + calculateTotalVideoPrice();
    };


    const handlePayment = async () => {
        if (!id) return;
        const readableTime =
            timeType === "day"
                ? "ngày"
                : timeType === "week"
                    ? "tuần"
                    : "tháng";


        const itemName = `${postType === "vip" ? "Tin VIP" : "Tin thường"} - ${duration} ${readableTime} (${calculateTotalDay()} ngày)`;

        try {
            setLoadingPost(true);
            const resPayment = await createPayment(
                post?.title || "",
                itemName,
                Number(calculateTotalPrice()),
            );

            const res = await paymentLink(
                resPayment.data.id,
                Number(calculateTotalPrice()),
                `Thanh toán cho gói tin`,
                itemName,
                Number(calculateTotalPrice()),
                1,
                String(calculateTotalDay()),
                postType,
                id || ""
            );

            router.push({
                pathname: "/landlord/payment-gateway",
                params: {
                    checkoutUrl: res.checkoutUrl,
                    qrCode: res.qrCode,
                    orderCode: res.orderCode.toString(),
                },
            })

        } catch (error) {
            console.error("Payment error:", error);
            Toast.show({
                type: "error",
                text1: "Không thể tạo đơn thanh toán!",
            });
        } finally {
            setLoadingPost(false);
        }
    };

    useEffect(() => {
        const loadTempPost = async () => {
            if (!id) return;

            try {
                const data = await getTempPost(id);

                setPost({
                    province: data.province,
                    district: data.district,
                    ward: data.ward,
                    street: data.street,
                    house_number: data.house_number,
                    address: data.address,
                    lat: Number(data.lat),
                    lng: Number(data.lng),
                    title: data.title,
                    price: Number(data.price),
                    unit: data.unit,
                    acreage: data.acreage,
                    image: data.images[0],
                    images: data.images,
                    video: data.video,
                    landlord_id: data.landlord_id,
                });
            } catch (e) {
                console.error("Lỗi lấy temp post:", e);
            }
        };

        loadTempPost();
    }, [id, setPost]);


    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                        onPress={() => router.replace("/tenant/post")}
                        style={{ paddingHorizontal: 12 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-xl font-bold text-white">Gói tin đăng</Text>

                </View>
            </View>
            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <LoadingData />
                </View>
            ) : (
                <View className="flex-1">
                    <ScrollView
                        className="flex-1 p-4"
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["#2baf90"]}
                                tintColor="#2baf90"
                            />
                        }
                    >
                        <View className="flex-col gap-2 border border-border rounded-xl p-4">
                            <Text className="font-bold text-lg text-foreground">Chọn gói tin đăng</Text>

                            <View className="flex-col">
                                <Text className="font-semibold text-foreground mb-1">Gói thời gian</Text>
                                <StatusDropdown
                                    data={[
                                        { label: `Đăng theo ngày ( ${Number(postPriceDay).toLocaleString()} đ/ngày )`, value: "day" },
                                        { label: `Đăng theo tuần ( ${Number(postPriceWeek).toLocaleString()} đ/tuần )`, value: "week" },
                                        { label: `Đăng theo tháng ( ${Number(postPriceMonth).toLocaleString()} đ/tháng )`, value: "month" },

                                    ]}
                                    value={timeType}
                                    onChange={
                                        (_, value) => {
                                            setTimeType(value as "day" | "week" | "month");
                                        }
                                    }
                                />
                            </View>

                            <View className="flex-col">
                                <Text className="font-semibold text-foreground mb-1">Loại tin</Text>
                                <StatusDropdown
                                    data={[
                                        { label: "Tin thường", value: "normal" },
                                        { label: `Tin VIP ( ${Number(postTypeVipPrice).toLocaleString()} đ )`, value: "vip" },
                                    ]}
                                    value={postType}
                                    onChange={
                                        (_, value) => {
                                            setPostType(value as "normal" | "vip");
                                        }
                                    }
                                />
                            </View>

                            <View className="flex-col">
                                <Text className="font-semibold text-foreground mb-1">Số {timeType === "day" ? "ngày" : timeType === "week" ? "tuần" : "tháng"}</Text>
                                <StatusDropdown
                                    data={dataDuration(timeType)}
                                    value={duration.toString()}
                                    onChange={
                                        (_, value) => {
                                            setDuration(Number(value));
                                        }
                                    }
                                />
                            </View>
                            <View className="flex-col bg-amber-50 dark:bg-amber-950 border-amber-500 border rounded-xl p-4">
                                <Text className="font-semibold text-black dark:text-white">Giải thích về loại tin đăng</Text>
                                <Text className="text-sm leading-5 text-black dark:text-white">
                                    • <Text className="font-semibold text-black dark:text-white">Tin thường</Text> hiển thị như các
                                    tin khác.
                                </Text>

                                <Text className="text-sm leading-5 text-black dark:text-white">
                                    • <Text className="font-semibold text-black dark:text-white">Tin VIP</Text> sẽ giúp bài đăng của bạn xuất hiện nổi bật
                                    trong mục<Text className="font-semibold text-[#2baf90]"> Đề xuất của Tronect </Text>
                                </Text>

                                <View
                                    className="flex-row gap-2 items-center flex-wrap"
                                >
                                    <Text className="text-sm leading-5 text-black dark:text-white">
                                        • <Text className="font-semibold text-black dark:text-white">Tin VIP</Text> hiển thị tag
                                    </Text>
                                    <TagVip postType="vip" />

                                </View>
                            </View>
                        </View>
                        <View className="flex-row py-4 items-center justify-center">
                            <View style={{ width: "49%" }}>
                                <Card className="relative overflow-hidden bg-background border-border p-0 gap-0">
                                    <View style={{ position: "relative" }}>
                                        <Image
                                            source={{ uri: post?.image }}
                                            style={{ width: "100%", height: 120 }}
                                            contentFit="cover"
                                        />

                                        <View
                                            style={{
                                                position: "absolute",
                                                bottom: 8,
                                                right: 8,
                                                flexDirection: "row",
                                                gap: 2,
                                            }}
                                        >
                                            <TagVip postType={postType} />
                                        </View>
                                    </View>

                                    <View className="p-2">
                                        <Text className="text-sm text-foreground font-semibold line-clamp-2">
                                            {post?.title}
                                        </Text>

                                        <View className="flex-row items-center gap-1 mt-1">
                                            <Text className="text-red-500 font-bold text-sm">
                                                {Number(post?.price).toLocaleString()} đ
                                            </Text>
                                            <Text className="text-xs font-semibold text-foreground">
                                                • {post?.acreage} m²
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center gap-1 mt-1">
                                            <Ionicons name="location-outline" size={14} color="gray" />
                                            <Text className="text-xs text-muted-foreground">
                                                {post?.district}
                                            </Text>
                                        </View>
                                    </View>
                                </Card>
                            </View>
                        </View>

                        <View className="flex-col gap-2 border border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-xl p-4 mb-8">
                            <Text className="font-bold text-lg text-foreground">Thông tin thanh toán</Text>

                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-foreground">Loại tin:</Text>
                                <Text className="text-sm font-semibold text-foreground">{postType === "vip" ? "Tin VIP" : "Tin thường"}</Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-foreground">Gói thời gian:</Text>
                                <Text className="text-sm font-semibold text-foreground">
                                    {timeType === "day" ? `Đăng theo ngày ( ${Number(postPriceDay).toLocaleString()} đ/ngày )` : timeType === "week" ? `Đăng theo tuần ( ${Number(postPriceWeek).toLocaleString()} đ/tuần )` : `Đăng theo tháng ( ${Number(postPriceMonth).toLocaleString()} đ/tháng )`}
                                </Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-foreground">Số lượng:</Text>
                                <Text className="text-sm font-semibold text-foreground">
                                    {calculateTotalDay()} ngày
                                </Text>
                            </View>

                            <DividerCustom />

                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-foreground">Tiền gói thời gian:</Text>
                                <Text className="text-sm font-semibold text-foreground">
                                    {calculateTotalDay()} ngày x {""}
                                    {timeType === "day" ? Number(postPriceDay).toLocaleString() : timeType === "week" ? Number(postPriceWeek).toLocaleString() : Number(postPriceMonth).toLocaleString()} đ
                                    = {(calculateTotalDay()! * calculatePackageTimePrice()).toLocaleString()} đ</Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-foreground">Tiền loại tin:</Text>
                                <Text className="text-sm font-semibold text-foreground">{calculatePostTypePrice().toLocaleString()} đ</Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-foreground">Tiền ảnh thêm:</Text>
                                <Text className="text-sm font-semibold text-foreground">{calculateTotalImagePrice().toLocaleString()} đ</Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-foreground">Tiền video:</Text>
                                <Text className="text-sm font-semibold text-foreground">{calculateTotalVideoPrice().toLocaleString()} đ</Text>
                            </View>


                            <DividerCustom />

                            <View className="flex-row items-center justify-between">
                                <Text className="font-bold text-base text-foreground">Tổng tiền:</Text>
                                <Text className="font-bold text-lg text-red-500">{calculateTotalPrice().toLocaleString()} đ</Text>
                            </View>

                        </View>
                    </ScrollView>
                    <View
                        style={{
                            height: 52 + insets.bottom,
                            paddingBottom: insets.bottom,
                            borderTopWidth: 0.2,
                            borderTopColor: "#d1d5db",
                        }}
                    >
                        <View className="flex-row w-full items-center p-2 gap-2">

                            <Pressable
                                className="flex-1 h-10 bg-secondary w-full rounded-lg py-2 items-center justify-center border border-border"
                                onPress={() => router.replace("/tenant/post")}
                            >
                                <Text className="text-foreground text-center font-bold ">Quay lại</Text>
                            </Pressable>

                            <Pressable
                                className="flex-1 h-10 bg-[#2baf90] w-full rounded-lg py-2 items-center justify-center border border-[#2baf90]"
                                onPress={() => handlePayment()}
                            >
                                <Text className="text-white text-center font-bold">{loadingPost ? "Đang thanh toán..." : `Thanh toán ${calculateTotalPrice().toLocaleString()} đ`}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}