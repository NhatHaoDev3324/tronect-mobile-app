import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    useColorScheme,
    View,
    type ViewProps,
} from "react-native";


import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";

import { areaRanges, options, priceRanges } from "@/utils/dataitem";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ---------- TYPES ---------- */
type Option = {
    value: string;
    label: string;
    codename: string;
};

// type ProvinceAPI = {
//     name: string;
//     code: number;
//     codename: string;
// };

type DistrictAPI = {
    name: string;
    code: number;
    codename: string;
};

type WardAPI = {
    name: string;
    code: number;
    codename: string;
};

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

/* ---------- CONSTANT ---------- */
const categories = [
    { id: "phong-tro-tphcm", label: "Phòng trọ", icon: "home-outline" },
    { id: "phong-o-ghep-tphcm", label: "Phòng ở ghép", icon: "home-outline" },
    { id: "chung-cu-tphcm", label: "Chung cư", icon: "business-outline" },
    { id: "can-ho-tphcm", label: "Căn hộ", icon: "school-outline" },
    { id: "ky-tuc-xa-tphcm", label: "Ký túc xá", icon: "people-outline" },
];

export default function SearchScreen({
    lightColor,
    darkColor,
}: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );

    const colorScheme = useColorScheme();

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationStep, setLocationStep] = useState<"district" | "ward">("district");
    const [loading, setLoading] = useState(false);

    const [category, setCategory] = useState(categories[0].id);
    const insets = useSafeAreaInsets();

    // const [provinceValue] = useState("79"); // HCM cố định
    const [districtValue, setDistrictValue] = useState("");
    const [wardValue, setWardValue] = useState("");

    const [districts, setDistricts] = useState<Option[]>([]);
    const [wards, setWards] = useState<Option[]>([]);

    const [price, setPrice] = useState<{ min: string, max: string } | null>({
        min: "",
        max: ""
    });
    const [area, setArea] = useState<{ min: string, max: string } | null>({
        min: "",
        max: ""
    });

    const [features, setFeatures] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        fetch(`https://provinces.open-api.vn/api/p/79?depth=2`)
            .then(res => res.json())
            .then(data => {
                setDistricts(
                    data.districts.map((d: DistrictAPI) => ({
                        value: String(d.code),
                        label: d.name,
                        codename: d.codename,
                    }))
                );
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!districtValue) return;
        setLoading(true);
        fetch(`https://provinces.open-api.vn/api/d/${districtValue}?depth=2`)
            .then(res => res.json())
            .then(data => {
                setWards(
                    data.wards.map((w: WardAPI) => ({
                        value: String(w.code),
                        label: w.name,
                        codename: w.codename,
                    }))
                );
                setLoading(false);
            });
    }, [districtValue]);

    /* ---------- HANDLERS ---------- */
    const toggleFeature = (value: string) => {
        setFeatures(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    const applySearch = () => {
        const params = new URLSearchParams();

        features.forEach((f, i) => params.set(`features[${i}]`, f));

        const districtSlug = districts.find(d => d.value === districtValue)?.label || "";
        const wardName = wards.find(w => w.value === wardValue)?.label || "";

        const wardSlug = wards.find(w => w.value === wardValue)?.codename || "";

        router.push({
            pathname: "/tenant/(tabs)/search/search-result",
            params: {
                category,
                district: districtSlug,
                ward: wardSlug,
                wardName: wardName,
                priceMin: price?.min,
                priceMax: price?.max,
                areaMin: area?.min,
                areaMax: area?.max,
                features: features,
            },
        });
    };

    const openDistrictModal = () => {
        setLocationStep("district");
        setShowLocationModal(true);
    };

    const openWardModal = () => {
        if (!districtValue) return;
        setLocationStep("ward");
        setShowLocationModal(true);
    };

    const handleCloseModal = () => {
        setShowLocationModal(false);
    };

    const handleBackStep = () => {
        setLocationStep("district");
    };

    const handleDistrictSelect = (item: Option) => {
        setDistrictValue(item.value); // thay thế
        setWardValue("");             // reset ward
        setWards([]);
        setLocationStep("ward");
    };


    const handleWardSelect = (item: Option) => {
        setWardValue(item.value); // chỉ 1
        setShowLocationModal(false);
    };

    const refreshPage = () => {
        setCategory(categories[0].id);
        setDistrictValue("");
        setWardValue("");
        setPrice(null);
        setArea(null);
        setFeatures([]);
    };


    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                        onPress={() => router.back()}
                        style={{ paddingHorizontal: 12 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-xl font-bold text-white">Tìm kiếm phòng</Text>

                </View>
                <Pressable onPress={refreshPage}><Ionicons name="refresh" size={24} color="white" /></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

                <ThemedView className="px-4 my-4">
                    <Text className="font-semibold mb-2">Danh mục</Text>
                    <View className="grid grid-cols-2 gap-3">
                        <FlatList
                            data={categories}
                            numColumns={3}
                            columnWrapperStyle={{ gap: 12 }}
                            contentContainerStyle={{ gap: 12 }}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <Pressable style={{ width: "31%" }} key={item.id}
                                    onPress={() => setCategory(item.id)}
                                    className={`items-center py-3 rounded-xl border ${category === item.id
                                        ? "border-[#2baf90] bg-[#2baf90]/10"
                                        : "border-border"
                                        }`}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={22}
                                        color={category === item.id ? "#2baf90" : "#6b7280"}
                                    />
                                    <Text className="text-sm mt-1">{item.label}</Text>
                                </Pressable>
                            )}
                        />
                    </View>
                </ThemedView>

                <ThemedView className="px-4 mb-4">
                    <Text className="font-semibold mb-2">Khu vực</Text>

                    <Pressable
                        className="border border-border rounded-lg px-4 py-3 mb-2"
                    >
                        <Text>Thành phố Hồ Chí Minh</Text>
                    </Pressable>

                    <Pressable
                        className="border border-border rounded-lg px-4 py-3 mb-2"
                        onPress={openDistrictModal}
                    >
                        <Text>
                            {districtValue
                                ? districts.find(d => d.value === districtValue)?.label
                                : "Chọn Quận/Huyện"}
                        </Text>
                    </Pressable>


                    <Pressable
                        className="border border-border rounded-lg px-4 py-3"
                        onPress={openWardModal}
                        disabled={!districtValue}
                    >
                        <Text>
                            {wardValue
                                ? wards.find(w => w.value === wardValue)?.label
                                : "Chọn Phường/Xã"}
                        </Text>
                    </Pressable>
                </ThemedView>


                {/* PRICE */}
                <ThemedView className="px-4 mb-4">
                    <Text className="font-semibold mb-2">Giá</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {priceRanges.map(p => {
                            const selected = price?.min === String(p.min) && price?.max === String(p.max);

                            return (
                                <Pressable
                                    key={p.title}
                                    onPress={() => setPrice({
                                        min: String(p.min),
                                        max: String(p.max)
                                    })}
                                    className={`px-4 py-2 rounded-lg border ${selected
                                        ? "border-[#2baf90] bg-[#2baf90]/10"
                                        : "border-border"
                                        }`}
                                >
                                    <Text>{p.title}</Text>
                                </Pressable>
                            );
                        })}

                    </View>
                </ThemedView>

                {/* AREA */}
                <ThemedView className="px-4 mb-4">
                    <Text className="font-semibold mb-2">Diện tích</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {areaRanges.map(a => {
                            const selected = area?.min === String(a.min) && area?.max === String(a.max);

                            return (
                                <Pressable
                                    key={a.title}
                                    onPress={() => setArea({
                                        min: String(a.min),
                                        max: String(a.max)
                                    })}
                                    className={`px-4 py-2 rounded-lg border ${selected
                                        ? "border-[#2baf90] bg-[#2baf90]/10"
                                        : "border-border"
                                        }`}
                                >
                                    <Text>{a.title}</Text>
                                </Pressable>
                            );
                        })}

                    </View>
                </ThemedView>

                {/* FEATURES */}
                <ThemedView className="px-4 mb-4">
                    <Text className="font-semibold mb-2">Đặc điểm nổi bật</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {options.map(o => (
                            <Pressable
                                key={o.value}
                                onPress={() => toggleFeature(o.title)}
                                className={`px-3 py-2 rounded-lg border ${features.includes(o.title)
                                    ? "border-[#2baf90] bg-[#2baf90]/10"
                                    : "border-border"
                                    }`}
                            >
                                <Text className="text-sm">{o.title}</Text>
                            </Pressable>
                        ))}
                    </View>
                </ThemedView>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-border" style={{ backgroundColor: backgroundColor }}>
                <Button onPress={applySearch} variant={"tronect"} size={"sm"}>
                    <Text className="text-white">Áp dụng tìm kiếm</Text>
                </Button>
            </View>
            <Modal
                visible={showLocationModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseModal}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: colorScheme === "dark" ? "#1f2937" : "#f9fafb",
                    }}
                >
                    <View
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
                            borderBottomWidth: 1,
                            borderBottomColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
                            marginTop: 12,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    color: colorScheme === "dark" ? "#ffffff" : "#000000",
                                }}
                            >
                                {locationStep === "district" && "Chọn Quận/Huyện"}
                                {locationStep === "ward" && "Chọn Phường/Xã"}
                            </Text>

                            {locationStep === "ward" && (
                                <Pressable onPress={handleBackStep} hitSlop={10}>
                                    <Ionicons name="arrow-back" size={24} color="#2baf90" />
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {loading ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <ActivityIndicator size="large" color="#2baf90" />
                        </View>
                    ) : (
                        <FlatList
                            data={locationStep === "district" ? districts : wards}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        if (locationStep === "district") {
                                            handleDistrictSelect(item);
                                        } else {
                                            handleWardSelect(item);
                                        }
                                    }}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        borderBottomWidth: 1,
                                        borderBottomColor:
                                            colorScheme === "dark" ? "#374151" : "#e5e7eb",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: colorScheme === "dark" ? "#f3f4f6" : "#1f2937",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            )}
                            contentContainerStyle={{
                                paddingVertical: 8,
                            }}
                        />
                    )}

                    <View
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
                            borderTopWidth: 1,
                            borderTopColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
                        }}
                    >
                        <Pressable
                            onPress={handleCloseModal}
                            style={{
                                marginBottom: insets.bottom,
                                paddingVertical: 8,
                                backgroundColor: "#e5e7eb",
                                borderRadius: 8,
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{ fontSize: 16, fontWeight: "600", color: "#1f2937" }}
                            >
                                Đóng
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
