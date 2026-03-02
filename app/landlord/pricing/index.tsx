import { useThemeColor } from "@/hooks/use-theme-color";
import { usePricingConfigStore } from "@/store/pricing-config.store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

const PricingScreen = (props: ThemedViewProps) => {
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor(
        { light: props.lightColor, dark: props.darkColor },
        "background"
    );

    const format = (n?: string | number) => Number(n || 0).toLocaleString("vi-VN");

    const {
        fetchPricing,
        postPriceDay, postPriceWeek, postPriceMonth,
        postTypeVipPrice,
        picPrice, videoPrice,
        renewDay, renewWeek, renewMonth,
        renewVipPrice
    } = usePricingConfigStore();

    useEffect(() => {
        fetchPricing();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View className="flex-1" style={{ backgroundColor: backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                        onPress={() => router.back()}
                        style={{ paddingHorizontal: 12 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-xl font-bold text-white">Bảng giá dịch vụ</Text>
                </View>
            </View>
            <ScrollView className="px-4 bg-background" showsVerticalScrollIndicator={false}>
                <View className="mt-4 mb-2">
                    <Text className="text-2xl font-bold text-foreground">Bảng giá dịch vụ Tronect</Text>
                    <Text className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Tất cả mức phí được áp dụng cho việc đăng tin cho thuê phòng trên nền tảng Tronect.
                    </Text>
                </View>

                <Text className="text-lg font-bold text-foreground" style={{ marginBottom: 4, marginTop: 12 }}>
                    1. Giá đăng tin ở Tronect
                </Text>

                <View
                    className="bg-background"
                    style={{
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 16,
                        elevation: 2
                    }}
                >
                    <Text className="text-lg font-bold text-foreground" style={{ marginBottom: 12 }}>
                        1.1. Giá đăng tin theo thời gian
                    </Text>

                    {[
                        ["Đăng theo ngày", `${format(postPriceDay)}đ / ngày`],
                        ["Đăng theo tuần", `${format(postPriceWeek)}đ / ngày`],
                        ["Đăng theo tháng", `${format(postPriceMonth)}đ / ngày`]
                    ].map(([label, value], i) => (
                        <View
                            key={i}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingVertical: 8,
                                borderBottomWidth: i !== 2 ? 0.5 : 0,
                                borderColor: "#e5e7eb"
                            }}
                        >
                            <Text className="text-foreground">{label}</Text>
                            <Text className="font-semibold text-foreground">{value}</Text>
                        </View>
                    ))}

                    <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 8, lineHeight: 18 }}>
                        • Giá giảm khi chọn gói theo tuần hoặc tháng.{"\n"}
                        • Thời gian càng dài, chi phí trung bình mỗi ngày càng rẻ.
                    </Text>
                </View>

                {/* ===== 1.2 ===== */}
                <View className="bg-background"
                    style={{
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 16,
                        elevation: 2,
                        marginTop: 12
                    }}
                >
                    <Text className="text-lg font-bold text-foreground" style={{ marginBottom: 12 }}>
                        1.2. Giá loại tin
                    </Text>

                    <View className="flex-row justify-between py-2 border-b border-border">
                        <Text className="text-foreground">Tin thường</Text>
                        <Text className="font-semibold text-foreground">Miễn phí</Text>
                    </View>

                    <View className="flex-row justify-between py-2 border-b border-border">
                        <Text className="text-foreground">Tin VIP</Text>
                        <Text className="font-semibold text-foreground" style={{ color: "#e60023" }}>
                            {format(postTypeVipPrice)}đ
                        </Text>
                    </View>

                    <Text className="text-xs text-muted-foreground mt-2">
                        • Tin thường hiển thị như các tin khác.{"\n"}
                        • Tin VIP xuất hiện nổi bật trong mục
                        <Text className="font-semibold text-foreground" style={{ color: "#2baf90" }}> Đề xuất của Tronect</Text>.
                    </Text>

                    <View className="flex-row items-center mt-2">
                        <Text className="text-foreground">• Tin VIP hiển thị tag</Text>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#ef4444",
                                borderRadius: 999,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                marginLeft: 8
                            }}
                        >
                            <Ionicons name="star" size={14} color="#facc15" />
                            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 4 }}>
                                Tin VIP
                            </Text>
                        </View>
                    </View>

                    <View style={{ alignItems: "center", marginTop: 12 }}>
                        <View style={{ padding: 8, backgroundColor: "#fff", borderRadius: 8, elevation: 2 }}>
                            <Image
                                source={require("@/assets/images/VD.jpg")}
                                style={{ width: 240, height: 240 }}
                                contentFit="contain"
                            />
                        </View>
                        <Text style={{ fontStyle: "italic", marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                            (Ảnh minh họa: Huy hiệu “Tin VIP” trên điện thoại)
                        </Text>
                    </View>
                </View>


                <View
                    className="bg-background"
                    style={{
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 16,
                        elevation: 2,
                        marginTop: 12
                    }}
                >
                    <Text className="text-lg font-bold text-foreground" style={{ marginBottom: 12 }}>
                        1.3. Phụ phí thêm
                    </Text>

                    {[
                        ["Ảnh bài đăng", "Miễn phí (5 ảnh đầu tiên)"],
                        ["Từ ảnh thứ 5 trở lên (5 + N)", `N x ${format(picPrice)}đ / ảnh`],
                        ["Video bài đăng", `${format(videoPrice)}đ / video`]
                    ].map(([label, value], i) => (
                        <View
                            key={i}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingVertical: 8,
                                borderBottomWidth: i !== 2 ? 0.5 : 0,
                                borderColor: "#e5e7eb"
                            }}
                        >
                            <Text className="text-foreground">{label}</Text>
                            <Text className="font-semibold text-foreground">{value}</Text>
                        </View>
                    ))}

                    <Text className="text-xs text-muted-foreground mt-2">
                        • Khuyến khích đăng nhiều ảnh rõ ràng để tăng độ tin cậy.{"\n"}
                        • Video giúp bài đăng nổi bật hơn.
                    </Text>
                </View>

                <Text className="text-lg font-bold text-foreground" style={{ marginBottom: 12, marginTop: 12 }}>
                    2. Giá gia hạn tin ở Tronect
                </Text>

                <View
                    className="bg-background"
                    style={{
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 16,
                        elevation: 2
                    }}
                >
                    <Text className="text-lg font-bold text-foreground" style={{ marginBottom: 12 }}>
                        2.1. Giá Gia hạn tin theo thời gian
                    </Text>

                    {[
                        ["Gia hạn theo ngày", `${format(renewDay)}đ / ngày`],
                        ["Gia hạn theo tuần", `${format(renewWeek)}đ / ngày`],
                        ["Gia hạn theo tháng", `${format(renewMonth)}đ / ngày`]
                    ].map(([label, value], i) => (
                        <View
                            key={i}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingVertical: 8,
                                borderBottomWidth: i !== 2 ? 0.5 : 0,
                                borderColor: "#e5e7eb"
                            }}
                        >
                            <Text className="text-foreground">{label}</Text>
                            <Text className="font-semibold text-foreground">{value}</Text>
                        </View>
                    ))}

                    <Text className="text-xs text-muted-foreground mt-2">
                        • Giá giảm khi chọn gói theo tuần hoặc tháng.{"\n"}
                        • Thời gian càng dài, chi phí trung bình mỗi ngày càng rẻ.
                    </Text>
                </View>

                <View
                    className="bg-background"
                    style={{
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 16,
                        elevation: 2,
                        marginTop: 12
                    }}
                >
                    <Text className="text-lg font-bold text-foreground" style={{
                        marginBottom: 12,
                    }}>
                        2.2. Giá gia hạn loại tin
                    </Text>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 0.5, borderColor: "#e5e7eb" }}>
                        <Text className="text-foreground">Tin thường</Text>
                        <Text className="font-semibold text-foreground">Miễn phí</Text>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 0.5, borderColor: "#e5e7eb" }}>
                        <Text className="text-foreground">Tin VIP</Text>
                        <Text className="font-semibold text-foreground" style={{ color: "#e60023" }}>
                            {format(renewVipPrice)}đ
                        </Text>
                    </View>

                    <Text className="text-xs text-muted-foreground mt-2">
                        • Tin thường hiển thị như các tin khác.{"\n"}
                        • Tin VIP xuất hiện nổi bật trong mục
                        <Text className="font-semibold text-foreground" style={{ color: "#2baf90" }}> Đề xuất của Tronect</Text>.
                    </Text>
                </View>


                <View className="bg-blue-100 dark:bg-blue-900" style={{ borderRadius: 8, padding: 12, marginBottom: 60, marginTop: 12 }}>
                    <Text className="text-blue-600 dark:text-blue-200" style={{ fontWeight: "700", marginBottom: 4 }}>Lưu ý</Text>
                    <Text className="text-blue-600 dark:text-blue-200" style={{ fontSize: 13, marginBottom: 2 }}>• Phí dịch vụ áp dụng cho mỗi bài đăng.</Text>
                    <Text className="text-blue-600 dark:text-blue-200" style={{ fontSize: 13, marginBottom: 2 }}>• Giá đã bao gồm thuế và các khoản phí liên quan.</Text>
                    <Text className="text-blue-600 dark:text-blue-200" style={{ fontSize: 13 }}>• Hệ thống sẽ hiển thị tổng phí trước khi thanh toán.</Text>
                </View>

            </ScrollView>
        </View>
    );
};

export default PricingScreen;