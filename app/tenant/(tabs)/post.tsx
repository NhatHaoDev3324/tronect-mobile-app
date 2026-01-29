import DropdownComponent from "@/components/customs/DropdownComponent";
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { options } from "@/utils/dataitem";
import { getFullAddress } from "@/utils/getFullAddress";
import { getLocationFromAddress } from "@/utils/getLocationFromAddress";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, ViewProps } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

interface Amenity {
    name: string;
    distance: number;
    unit: "m" | "km";
}


interface LocationItem {
    value: string;
    label: string;
    codename: string;
}

interface LocationAPI {
    code: number;
    name: string;
    codename: string;
}

export default function SearchScreen(props: ThemedViewProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [unit, setUnit] = useState<"đồng/tháng" | "đồng/m2/tháng">("đồng/tháng");
    const [area, setArea] = useState("");

    const [provinces, setProvinces] = useState<LocationItem[]>([]);
    const [districts, setDistricts] = useState<LocationItem[]>([]);
    const [wards, setWards] = useState<LocationItem[]>([]);

    const [province, setProvince] = useState<string | null>(null);
    const [district, setDistrict] = useState<string | null>(null);
    const [ward, setWard] = useState<string | null>(null);

    const provinceLabel = provinces.find((p) => p.value === province)?.label;
    const districtLabel = districts.find((d) => d.value === district)?.label;
    const wardLabel = wards.find((w) => w.value === ward)?.label;

    const [street, setStreet] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [address, setAddress] = useState("");
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);

    const [selected, setSelected] = useState<string[]>([]);

    const [inputName, setInputName] = useState("");
    const [inputDistance, setInputDistance] = useState("");
    const [unitDistance, setUnitDistance] = useState<"m" | "km">("m");
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const mapRef = useRef<MapView>(null);
    const [nameMarker, setNameMarker] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor(
        { light: props.lightColor, dark: props.darkColor },
        "background"
    );

    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then(res => res.json())
            .then((data) => {
                setProvinces(
                    data.map((p: LocationAPI) => ({
                        value: String(p.code),
                        label: p.name,
                        codename: p.codename,
                    }))
                );
            })
            .catch(console.error)
    }, []);

    useEffect(() => {
        if (!province) return;
        fetch(`https://provinces.open-api.vn/api/p/${province}?depth=2`)
            .then(res => res.json())
            .then((data) => {
                setDistricts(
                    data.districts.map((d: LocationAPI) => ({
                        value: String(d.code),
                        label: d.name,
                        codename: d.codename,
                    }))
                );
                setDistrict(null);
                setWards([]);
                setStreet("");
                setHouseNumber("");
                setAddress("");
                setLat(null);
                setLng(null);
            })
            .catch(console.log)
    }, [province]);

    useEffect(() => {
        if (!district) return;
        fetch(`https://provinces.open-api.vn/api/d/${district}?depth=2`)
            .then(res => res.json())
            .then((data) => {
                setWards(
                    data.wards.map((w: LocationAPI) => ({
                        value: String(w.code),
                        label: w.name,
                        codename: w.codename,
                    }))
                );
                setWard(null);
                setStreet("");
                setHouseNumber("");
                setAddress("");
                setLat(null);
                setLng(null);
            })
            .catch(console.log)
    }, [district]);

    useEffect(() => {
        if (!provinceLabel || !districtLabel || !wardLabel) {
            setAddress("");
            return;
        }

        setAddress(
            getFullAddress(
                provinceLabel,
                districtLabel,
                wardLabel,
                street,
                houseNumber
            )
        );
    }, [provinceLabel, districtLabel, wardLabel, street, houseNumber]);

    useEffect(() => {
        if (!address) return;
        getLocationFromAddress(address)
            .then((location) => {
                if (location) {
                    setLat(location.lat);
                    setLng(location.lng);
                    setAddress(location.address);
                    setNameMarker(location?.name ?? "");
                }
            })
            .catch(console.log);
    }, [address]);


    useEffect(() => {
        if (!lat || !lng) return;

        mapRef.current?.animateToRegion(
            {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
            },
            800
        );
    }, [lat, lng]);


    const toggleItem = (title: string) => {
        setSelected((prev) =>
            prev.includes(title)
                ? prev.filter((t) => t !== title)
                : [...prev, title]
        );
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
                    <Text className="text-xl font-bold text-white">Đăng bài</Text>

                </View>
            </View>
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: insets.bottom }}>
                <View className="flex-col gap-2 border border-border rounded-xl p-4 mb-2">
                    <Text className="font-bold text-lg">Thông tin mô tả</Text>

                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Tiêu đề</Text>
                        <TextInput
                            placeholder="Nhập tiêu đề"
                            className="border border-border rounded-md px-3 py-2"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Nội dung mô tả</Text>

                        <TextInput
                            placeholder="Nhập nội dung mô tả"
                            multiline
                            numberOfLines={6}
                            scrollEnabled
                            textAlignVertical="top"
                            className="border border-border rounded-md px-3 py-2 min-h-[200px]"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Giá thuê</Text>
                        <View className="flex-row items-center gap-2">
                            <TextInput
                                placeholder="Nhập giá thuê"
                                className="border border-border rounded-md px-3 py-2 flex-1"
                                keyboardType="numeric"
                                value={price ? Number(price).toLocaleString("vi-VN") : ""}
                                onChangeText={(text) => {
                                    const numericValue = text.replace(/\D/g, "");
                                    setPrice(numericValue);
                                }}
                            />
                            <Pressable
                                onPress={() =>
                                    setUnit((prev) => (prev === "đồng/tháng" ? "đồng/m2/tháng" : "đồng/tháng"))
                                }
                                className="flex-row items-center gap-1 border border-border rounded-md px-3 py-2"
                            >
                                <Text className="text-sm">{unit}</Text>
                                <Ionicons name="chevron-down" size={14} />
                            </Pressable>
                        </View>
                    </View>

                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Diện tích</Text>
                        <TextInput
                            placeholder="Nhập diện tích"
                            className="border border-border rounded-md px-3 py-2"
                            keyboardType="numeric"
                            value={area ? `${area} m²` : ""}
                            onChangeText={(text) => {
                                const numericValue = text.replace(/\D/g, "");
                                setArea(numericValue);
                            }}
                        />
                    </View>
                </View>

                <View className="flex-col gap-2 border border-border rounded-xl p-4 mb-2">
                    <Text className="font-bold text-lg">Khu vực</Text>

                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Tỉnh/Thành phố</Text>
                        <DropdownComponent
                            placeholder="Chọn tỉnh/thành phố"
                            data={provinces}
                            value={province}
                            onChange={(value) => {
                                setProvince(value);
                                setDistrict(null);
                                setWard(null);
                            }}
                        />
                    </View>

                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Quận/Huyện</Text>
                        <DropdownComponent
                            placeholder="Chọn quận/huyện"
                            data={districts}
                            value={district}
                            onChange={setDistrict}
                            disabled={!province}
                        />
                    </View>

                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Phường/Xã</Text>
                        <DropdownComponent
                            placeholder="Chọn phường/xã"
                            data={wards}
                            value={ward}
                            onChange={setWard}
                            disabled={!district}
                        />

                    </View>
                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Đường phố</Text>
                        <TextInput
                            placeholder="Nhập đường phố"
                            className="border border-border rounded-md px-3 py-2"
                            value={street}
                            onChangeText={setStreet}
                            editable={!!ward}
                        />
                    </View>
                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Số nhà</Text>
                        <TextInput
                            placeholder="Nhập số nhà"
                            className="border border-border rounded-md px-3 py-2"
                            value={houseNumber}
                            onChangeText={setHouseNumber}
                            editable={!!street}
                        />
                    </View>
                    <View className="flex-col gap-1">
                        <Text className="font-semibold">Địa chỉ chi tiết</Text>
                        <TextInput
                            placeholder="Nhập địa chỉ chi tiết"
                            className="border border-border rounded-md px-3 py-2 h-20"
                            value={address}
                            editable={false}
                            selectTextOnFocus
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                    <View className="rounded-md">
                        <MapView
                            ref={mapRef}
                            style={{ width: "100%", height: 300 }}
                            initialRegion={{
                                latitude: lat || 10.77551,
                                longitude: lng || 106.702101,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: lat || 10.77551,
                                    longitude: lng || 106.702101,
                                }}
                                title={nameMarker || ""}
                            />
                        </MapView>
                    </View>
                </View>

                <View className="flex-col gap-2 border border-border rounded-xl p-4 mb-2">
                    <Text className="font-bold text-lg">Đặc điểm nổi bật</Text>
                    <View className="flex-row flex-wrap">
                        {options.map((item) => {
                            const checked = selected.includes(item.title);

                            return (
                                <Pressable
                                    key={item.title}
                                    onPress={() => toggleItem(item.title)}
                                    className="w-1/2 flex-row items-center gap-2 py-2"
                                >
                                    <Ionicons
                                        name={checked ? "checkbox" : "square-outline"}
                                        size={20}
                                        color={checked ? "#2baf90" : "#999"}
                                    />
                                    <Text className="text-sm">{item.title}</Text>
                                </Pressable>
                            );
                        })}

                        {selected.length > 0 && (
                            <View className="mt-3 border-t border-border pt-3">
                                <Text className="font-semibold mb-2">
                                    Đã chọn ({selected.length})
                                </Text>

                                <View className="flex-row flex-wrap gap-2">
                                    {selected.map((item) => (
                                        <View
                                            key={item}
                                            className="px-3 py-1 rounded-full bg-primary/10 border border-primary"
                                        >
                                            <Text className="text-sm text-primary">{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                </View>

                <View className="flex-col gap-4 border border-border rounded-xl p-4 mb-2">
                    <Text className="font-bold text-lg">Tiện ích xung quanh</Text>

                    <View className="flex-col gap-3">
                        <View className="flex-col gap-1">
                            <Text className="font-semibold">Tên tiện ích</Text>
                            <TextInput
                                placeholder="Nhập tên tiện ích"
                                className="border border-border rounded-md px-3 py-2"
                                value={inputName}
                                onChangeText={setInputName}
                            />
                        </View>

                        <View className="flex-col gap-1">
                            <Text className="font-semibold">Khoảng cách</Text>

                            <View className="flex-row items-center gap-2">
                                <TextInput
                                    placeholder="Nhập khoảng cách"
                                    keyboardType="numeric"
                                    className="flex-1 border border-border rounded-md px-3 py-2"
                                    value={inputDistance}
                                    onChangeText={(text) =>
                                        setInputDistance(text.replace(/\D/g, ""))
                                    }
                                />

                                <Pressable
                                    onPress={() =>
                                        setUnitDistance((prev) => (prev === "m" ? "km" : "m"))
                                    }
                                    className="flex-row items-center gap-1 border border-border rounded-md px-3 py-2"
                                >
                                    <Text className="text-sm">{unitDistance}</Text>
                                    <Ionicons name="chevron-down" size={14} />
                                </Pressable>
                            </View>
                        </View>

                        <Pressable
                            onPress={() => {
                                if (!inputName || !inputDistance) return;

                                setAmenities((prev) => [
                                    ...prev,
                                    {
                                        name: inputName,
                                        distance: Number(inputDistance),
                                        unit: unitDistance,
                                    },
                                ]);

                                setInputName("");
                                setInputDistance("");
                                setUnitDistance("m");
                            }}
                            className="bg-[#2baf90] rounded-md py-2 items-center"
                        >
                            <Text className="text-white font-semibold">Thêm tiện ích</Text>
                        </Pressable>
                    </View>

                    <View>
                        {amenities.length === 0 ? (
                            <Text className="text-muted-foreground">Chưa có tiện ích nào.</Text>
                        ) : (
                            <View className="flex-col gap-2">
                                {amenities.map((item, index) => (
                                    <View
                                        key={index}
                                        className="flex-row justify-between items-center"
                                    >
                                        <Text className="text-sm">
                                            • {item.name} – {item.distance} {item.unit}
                                        </Text>

                                        <Pressable onPress={() =>
                                            setAmenities((prev) =>
                                                prev.filter((_, i) => i !== index)
                                            )
                                        }>
                                            <Text className="text-red-500 text-sm">Xóa</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
                <View className="py-3 bg-background">
                    <Button variant={"tronect"} size={"sm"}>
                        <Text className="text-white">Đăng bài</Text>
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}
