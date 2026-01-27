import { SearchAllPartnerService } from "@/api/partnersServicesApi";
import { LoadingData } from "@/components/customs/LoadingData";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PartnerServiceType } from "@/types/serviceType";
import { stringToSlug } from "@/utils/slug";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const LS_KEY = "user_location_v1";

type StoredLocation = {
    lat: number;
    lng: number;
    province?: string;
    district?: string;
    ward?: string;
    address?: string;
    updatedAt: string;
};

export default function ServicePage() {
    const { title } = useLocalSearchParams<{
        title?: string;
    }>();
    const backgroundColor = useThemeColor({}, "background");
    const insets = useSafeAreaInsets();

    const [data, setData] = useState<PartnerServiceType[]>([]);
    const [search, setSearch] = useState("");
    const [checkingLocation, setCheckingLocation] = useState(true);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingGeocode, setLoadingGeocode] = useState(false);

    const [showDialog, setShowDialog] = useState(false);
    const [address, setAddress] = useState("");
    const [stored, setStored] = useState<StoredLocation | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(LS_KEY);
                if (raw) {
                    setStored(JSON.parse(raw));
                } else {
                    setShowDialog(true);
                }
            } finally {
                setCheckingLocation(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!stored) return;

        const fetchServices = async () => {
            try {
                setLoadingServices(true);
                const response = await SearchAllPartnerService(stringToSlug(title || ""), stored?.province || "", stored?.district || "", stored?.ward || "");
                setData(response);
            } catch {
                Toast.show({
                    type: "error",
                    text1: "Lỗi",
                    text2: "Không thể tải dữ liệu",
                    position: "top",
                });
            } finally {
                setLoadingServices(false);
            }
        };

        fetchServices();
    }, [stored]);
    const geocodeByAddress = async (addr: string) => {
        const key = "02J9Wx9p10tp03FhTnLFqxem0YjFaE03pBTiAU94";
        const url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
            addr
        )}&api_key=${key}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "OK") throw new Error("Không geocode được địa chỉ");

        const loc = data.results[0]?.geometry?.location;
        if (!loc) throw new Error("Thiếu lat/lng");

        return {
            lat: loc.lat,
            lng: loc.lng,
            province: data.results[0]?.compound.province,
            district: data.results[0]?.compound.district,
            ward: data.results[0]?.compound.commune,
            address: data.results[0]?.formatted_address ?? addr,
        };
    };

    const handleConfirm = async () => {
        if (!address.trim()) return;

        try {
            setLoadingGeocode(true);

            const { lat, lng, province, district, ward, address: formatted } =
                await geocodeByAddress(address);

            const loc: StoredLocation = {
                lat,
                lng,
                province,
                district,
                ward,
                address: formatted,
                updatedAt: new Date().toISOString(),
            };

            await AsyncStorage.setItem(LS_KEY, JSON.stringify(loc));
            setStored(loc);
            setShowDialog(false);
        } catch (e: any) {
            Alert.alert("Lỗi", e.message || "Có lỗi xảy ra");
        } finally {
            setLoadingGeocode(false);
        }
    };

    const resetLocation = async () => {
        await AsyncStorage.removeItem(LS_KEY);
        setStored(null);
        setAddress("");
        setShowDialog(true);
    };

    const filteredData = data.filter((item) => {
        if (!search.trim()) return true;

        return item.title
            ?.toLowerCase()
            .includes(search.trim().toLowerCase());
    });


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

                <Pressable onPress={resetLocation}>
                    <Ionicons name="refresh" size={22} color="white" />
                </Pressable>
            </View>

            {checkingLocation || loadingServices ? (
                <View className="flex-1 items-center justify-center">
                    <LoadingData />
                </View>
            ) : stored ? (stored?.address ? (
                <View className="flex-1 px-4">
                    <View className="bg-card rounded-xl px-4 py-3 mt-4 border border-border">
                        <Text className="text-base font-semibold">Vị trí đã lưu</Text>
                        <View className="flex-row items-start gap-1">
                            <Ionicons
                                name="location-outline"
                                size={16}
                                color="#6b7280"
                                style={{ marginTop: 2 }}
                            />
                            <Text className="text-muted-foreground flex-1" numberOfLines={1}
                                ellipsizeMode="tail">{stored.address}</Text>
                        </View>
                    </View>
                    <View className="flex-col mt-2 mb-3">
                        <Text className="text-lg font-semibold text-foreground">
                            Đối tác {title?.toLowerCase()} ở Tronect
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                            Các đối tác đã được Tronect xác thực thông tin.
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <View className="flex-row items-center border border-border rounded-xl px-4">
                                <Ionicons name="search-outline" size={20} color="#6b7280" />
                                <TextInput
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Tìm theo tên đối tác..."
                                    placeholderTextColor="#9ca3af"
                                    className="ml-2 flex-1 p-2"
                                    returnKeyType="search"
                                    clearButtonMode="while-editing"
                                />
                            </View>
                        </View>
                    </View>
                    <View>
                        <FlatList
                            data={filteredData}
                            numColumns={2}
                            columnWrapperStyle={{ gap: 8 }}
                            contentContainerStyle={{ gap: 8 }}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <Pressable style={{ width: "49%" }} onPress={() => router.push({
                                    pathname: `/tenant/all-service/detail`,
                                    params: {
                                        title: title,
                                        id: item.id,
                                    }
                                })}>
                                    <Card className="overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0">
                                        <View style={{ position: "relative" }}>
                                            <Image
                                                source={{ uri: item.image }}
                                                style={{ width: "100%", height: 120 }}
                                                contentFit="cover"
                                            />
                                            <View style={{ position: "absolute", top: 8, left: 8 }} className="rounded-full bg-[#2baf90] px-3 py-1 shadow">
                                                <Text className="text-xs font-semibold text-white">
                                                    Mở cửa: {item.working_hours}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="p-2">
                                            <Text className="text-base font-semibold flex-1 text-ellipsis leading-5" numberOfLines={2} ellipsizeMode="tail">
                                                {item.title}
                                            </Text>
                                            <Text className="text-red-500 font-bold text-sm mb-1">
                                                Giá từ {Number(item.price_note).toLocaleString()} đ
                                            </Text>
                                            <View className="flex-row items-start gap-1">
                                                <Ionicons
                                                    name="location-outline"
                                                    size={14}
                                                    color="gray"
                                                />
                                                <Text className="text-xs text-muted-foreground flex-1" numberOfLines={1}
                                                    ellipsizeMode="tail">
                                                    {item.address}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card>
                                </Pressable>
                            )}
                        />
                    </View>
                </View>
            ) : (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-muted-foreground">Vị trí không hợp lệ</Text>
                </View>
            )
            ) : (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-muted-foreground">Chưa có vị trí</Text>
                </View>
            )}

            <Modal visible={showDialog} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="w-[85%] bg-white rounded-xl p-4">
                        <Text className="text-lg font-bold">Nhập địa chỉ của bạn</Text>
                        <Text className="text-gray-600 mb-2">Chúng tôi dùng vị trí để gợi ý dịch vụ, tiện ích gần bạn. Vui lòng nhập địa chỉ chính xác.</Text>

                        <TextInput
                            placeholder="Ví dụ: 110 Nguyễn Huệ, Bến Nghé..."
                            value={address}
                            onChangeText={setAddress}
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
                        />

                        <View className="flex-row gap-2">
                            <Pressable onPress={() => router.back()} style={{ width: '49%', borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: 'white', }}>
                                <Text style={{ color: '#374151', textAlign: 'center', fontWeight: '600', }}> Quay lại </Text>
                            </Pressable>
                            <Pressable style={{ width: '49%', backgroundColor: address.trim() ? '#2baf90' : '#ccc', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, }} onPress={handleConfirm} disabled={loadingGeocode} >
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', }}> {loadingGeocode ? "Đang xử lý..." : "Xác nhận"} </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}