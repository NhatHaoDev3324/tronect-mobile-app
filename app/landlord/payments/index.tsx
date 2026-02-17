import { getPaymentsByLandlord } from "@/api/paymentApi";
import { LoadingData } from "@/components/customs/LoadingData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PaymentType } from "@/types/paymentType";
import { formatDateTimeCustom } from "@/utils/formatDateTime";
import { getPaymentStatusInfo } from "@/utils/statusColor";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};
const PaymentScreen = (props: ThemedViewProps) => {
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor(
        { light: props.lightColor, dark: props.darkColor },
        "background"
    );
    const [payments, setPayments] = useState<PaymentType[]>([]);
    const { pathnameBack } = useLocalSearchParams<{ pathnameBack?: string }>();
    const [search, setSearch] = useState("");
    const [filteredPayment, setFilteredPayment] = useState<PaymentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPayments = async (): Promise<PaymentType[]> => {
        try {
            const res = await getPaymentsByLandlord();
            const data = res?.data || (Array.isArray(res) ? res : []);
            return data;
        } catch (e: any) {
            console.error("Lỗi fetch payment:", e);
            Toast.show({
                type: "error",
                text1: "Lỗi lấy dữ liệu",
                text2: e?.message || "Vui lòng thử lại sau"
            });
            return [];
        }
    };
    useEffect(() => {
        const loadPayments = async () => {
            setIsLoading(true);
            const data = await fetchPayments();
            setPayments(data);
            setFilteredPayment(data);
            setIsLoading(false);
        };

        void loadPayments();
    }, []);

    useEffect(() => {
        const result = payments.filter((p) =>
            p.product_name.toLowerCase().includes(search.toLowerCase()) ||
            p.product_package.toLowerCase().includes(search.toLowerCase())
        );

        setFilteredPayment(result);
    }, [search, payments]);

    const handleBack = () => {
        if (pathnameBack) {
            router.replace(pathnameBack as any);
        } else {
            router.back();
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                        onPress={handleBack}
                        style={{ paddingHorizontal: 12 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-xl font-bold text-white">Lịch sử thanh toán</Text>
                </View>
            </View>
            <View className="flex-row items-center mt-2 px-4">
                <View className="flex-row items-center border border-border rounded-xl px-4 flex-1">
                    <Ionicons name="search-outline" size={20} color="#6b7280" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Tìm theo tên đối tác..."
                        placeholderTextColor="#9ca3af"
                        className="ml-2 flex-1 p-2 h-10 text-foreground"
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                    />
                </View>
            </View>
            <ScrollView className="px-4 mt-2">
                {isLoading ? (
                    <View className="mt-40">
                        <LoadingData />
                    </View>
                ) : filteredPayment.length === 0 ? (
                    <View className="mt-20 items-center">
                        <Text className="text-muted-foreground">Không có dữ liệu thanh toán</Text>
                    </View>
                ) : (
                    <Accordion type="single" collapsible className="w-full bg-transparent">
                        {filteredPayment.map((payment, index) => {
                            const info = getPaymentStatusInfo(payment.status);
                            return (
                                <AccordionItem
                                    key={payment.id}
                                    value={`faq-${payment.id}`}
                                    className="mb-2 rounded-xl bg-transparent overflow-hidden"
                                >
                                    <AccordionTrigger className="pr-6 py-2 flex-col gap-2">
                                        <View className="flex-row items-start gap-2">
                                            <Text className="text-base font-medium text-foreground">
                                                {index + 1}.
                                            </Text>
                                            <View className="flex-col items-start gap-2">
                                                <Text className="text-base font-medium text-foreground" numberOfLines={2}>
                                                    Tên bài đăng: {payment.product_name}
                                                </Text>
                                                <View className="flex-row items-center justify-between w-full    gap-2">
                                                    <Text className="text-base font-medium text-foreground">
                                                        Đã thanh toán: <Text className="text-base font-bold text-red-600">{payment.amount.toLocaleString()} đ</Text>
                                                    </Text>
                                                    <View
                                                        className={`px-2 py-1 rounded-md border ${info.bgColor} ${info.borderColor}`}
                                                    >
                                                        <Text className={`text-[10px] font-bold ${info.textColor}`}>
                                                            {info.label.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </AccordionTrigger>

                                    <AccordionContent className="px-4 pb-4">
                                        <View className="flex-col items-start">
                                            <Text className="text-sm text-muted-foreground leading-relaxed">
                                                - Gói bài đăng: {payment.product_package}
                                            </Text>
                                            <Text className={`text-sm text-muted-foreground`}>
                                                - Thanh toán lúc: {formatDateTimeCustom(payment.created_at)}
                                            </Text>
                                        </View>

                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                )}
            </ScrollView>
        </View >
    );
};

export default PaymentScreen;