import { getPostById, updatePost } from "@/api/postApi";
import DropdownComponent from "@/components/customs/DropdownComponent";
import StatusDropdown from "@/components/customs/manage-post/StatusDropdown";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";
import { NearbyAmenity, PostInfoType } from "@/types/postInfoType";
import { options } from "@/utils/dataitem";
import { getFullAddress } from "@/utils/getFullAddress";
import { getLocationFromAddress } from "@/utils/getLocationFromAddress";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";

import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Image as RNImage, ScrollView, Text, TextInput, View, ViewProps } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

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

interface FormErrors {
    title?: string;
    description?: string;
    price?: string;
    area?: string;

    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    houseNumber?: string;
    address?: string;

    location?: string;
    images?: string;
    user?: string;
}


export default function EditPostScreen(props: ThemedViewProps) {
    const { userID } = useAuthStore();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const scrollRef = useRef<ScrollView>(null);
    const [category, setCategory] = useState<string>("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [unit, setUnit] = useState("đồng/tháng");
    const [area, setArea] = useState("");

    const [provinces, setProvinces] = useState<LocationItem[]>([]);
    const [districts, setDistricts] = useState<LocationItem[]>([]);
    const [wards, setWards] = useState<LocationItem[]>([]);

    const [province, setProvince] = useState<string | null>(null);
    const [district, setDistrict] = useState<string | null>(null);
    const [ward, setWard] = useState<string | null>(null);

    const [provinceLabel, setProvinceLabel] = useState("")
    const [districtLabel, setDistrictLabel] = useState("")
    const [wardLabel, setWardLabel] = useState("")

    const [street, setStreet] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [address, setAddress] = useState("");
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);

    const [selected, setSelected] = useState<string[]>([]);

    const [inputName, setInputName] = useState("");
    const [inputDistance, setInputDistance] = useState("");
    const [unitDistance, setUnitDistance] = useState<"m" | "km">("m");
    const [amenities, setAmenities] = useState<NearbyAmenity[]>([]);
    const mapRef = useRef<MapView>(null);
    const [nameMarker, setNameMarker] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor(
        { light: props.lightColor, dark: props.darkColor },
        "background"
    );


    const MIN_IMAGES = 5;

    const [videoError, setVideoError] = useState<string>("");
    const [errors, setErrors] = useState<FormErrors>({});

    const [maxNumImages, setMaxNumImages] = useState<number>(20);
    const [maxNumVideos, setMaxNumVideos] = useState<number>(1);

    const [oldImages, setOldImages] = useState<string[]>([]);
    const [oldVideo, setOldVideo] = useState<string | null>(null);

    const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [newVideo, setNewVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const [loading, setLoading] = useState(false);


    const pickImages = async () => {

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
            selectionLimit: maxNumImages - displayImages.length,
        });

        if (result.canceled) return;

        setNewImages((prev) => [...prev, ...result.assets]);
    };

    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        });

        if (result.canceled) return;

        setNewVideo(result.assets[0]);
    };

    const resetForm = () => {
        setCategory("");
        setTitle("");
        setDescription("");
        setPrice("");
        setUnit("đồng/tháng");
        setArea("");

        setProvince(null);
        setDistrict(null);
        setWard(null);

        setStreet("");
        setHouseNumber("");
        setAddress("");
        setLat(null);
        setLng(null);

        setSelected([]);

        setMaxNumImages(20);
        setMaxNumVideos(1);
        setNewImages([]);
        setNewVideo(null);
        setVideoError("");
        setAmenities([]);
        setErrors({});
    };




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

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const res: PostInfoType = await getPostById(id);
                setCategory(res.category);
                setTitle(res.title);
                setDescription(res.description);
                setPrice(String(res.price));
                setUnit(res.unit);
                setArea(String(res.acreage));

                setProvinceLabel(res.province);
                setDistrictLabel(res.district);
                setWardLabel(res.ward);
                setStreet(res.street);
                setHouseNumber(res.house_number);

                setAddress(res.address);

                setLat(res.lat);
                setLng(res.lng);

                setSelected(res.outstanding);
                setAmenities(res.nearby_amenities || []);
                setMaxNumImages(res.images.length);
                setMaxNumVideos(res.video ? 1 : 0);
                setOldImages(res.images || []);

                setOldVideo(res.video || null);
                setNewImages([]);
                setNewVideo(null);

            } catch {
                Toast.show({
                    type: "error",
                    text1: "Lấy dữ liệu thất bại",
                    text2: "Vui lòng thử lại sau",
                    position: "top",
                });
            }
        };

        fetchData();

    }, [id]);

    const displayImages = [
        ...oldImages.map((url) => ({ uri: url, isOld: true })),
        ...newImages.map((img) => ({ uri: img.uri, isOld: false })),
    ];

    const displayVideoUri = newVideo?.uri || oldVideo;


    const toggleItem = (title: string) => {
        setSelected((prev) =>
            prev.includes(title)
                ? prev.filter((t) => t !== title)
                : [...prev, title]
        );
    };

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};

        if (!title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
        if (!description.trim()) newErrors.description = "Vui lòng nhập nội dung mô tả";

        if (!price || Number(price) <= 0)
            newErrors.price = "Giá thuê không hợp lệ";

        if (!area || Number(area) <= 0)
            newErrors.area = "Diện tích không hợp lệ";

        if (!provinceLabel) newErrors.province = "Chưa chọn tỉnh/thành";
        if (!districtLabel) newErrors.district = "Chưa chọn quận/huyện";
        if (!wardLabel) newErrors.ward = "Chưa chọn phường/xã";

        if (!street.trim()) newErrors.street = "Chưa nhập tên đường";
        if (!houseNumber.trim()) newErrors.houseNumber = "Chưa nhập số nhà";
        if (!address.trim()) newErrors.address = "Địa chỉ chưa hợp lệ";

        if (!lat || !lng)
            newErrors.location = "Không xác định được vị trí";

        if (displayImages.length < MIN_IMAGES) {
            newErrors.images = `Cần tối thiểu ${MIN_IMAGES} ảnh`;
        }

        if (displayImages.length > maxNumImages) {
            newErrors.images = `Chỉ được chọn tối đa ${maxNumImages} ảnh`;
        }


        if (!userID)
            newErrors.user = "Không xác định được người đăng";

        return newErrors;
    };



    const handleSubmit = async () => {
        if (loading) return;

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            Toast.show({
                type: "error",
                text1: "Đã xảy ra lỗi",
                text2: "Vui lòng kiểm tra lại thông tin",
            });
            return;
        }

        setErrors({});

        try {
            setLoading(true);
            await updatePost(
                id!,
                oldImages,
                oldVideo || "",
                category,
                provinceLabel!,
                districtLabel!,
                wardLabel!,
                street,
                houseNumber,
                address,
                String(lat),
                String(lng),
                title,
                description,
                unit,
                area,
                "",
                selected,
                1,
                Number(price),
                amenities,
                newImages,
                newVideo
            );


            Toast.show({
                type: "success",
                text1: "Đăng tin thành công",
                text2: "Tin đăng của bạn đã được hiển thị ở Tronect",
            });
            resetForm();
            router.replace({
                pathname: "/tenant/manage-posts",
                params: {
                    pathnameBack: "/tenant/(tabs)",
                },
            });

        } catch (err) {
            console.log(err);
            Toast.show({
                type: "error",
                text1: "Đăng tin thất bại",
                text2: "Vui lòng thử lại",
            });
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            resetForm();
            requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({ y: 0, animated: false });
            });
            return () => { };
        }, [])
    );

    useEffect(() => {
        setProvinceLabel(provinces.find((p) => p.value === province)?.label || "");
        setDistrictLabel(districts.find((d) => d.value === district)?.label || "");
        setWardLabel(wards.find((w) => w.value === ward)?.label || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [province, district, ward]);

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
                    <Text className="text-xl font-bold text-white">Chỉnh sửa bài đăng</Text>

                </View>
            </View>
            <ScrollView ref={scrollRef} className="flex-1 p-4" contentContainerStyle={{ paddingBottom: insets.bottom }}>
                <View className="flex-col gap-2 border border-border rounded-xl p-4 mb-2">
                    <Text className="font-bold text-lg text-foreground">Chuyên mục</Text>

                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Loại chuyên mục</Text>
                        <StatusDropdown
                            data={[
                                { label: "Phòng trọ", value: "phong-tro-tphcm" },
                                { label: "Chung cư mini", value: "chung-cu-mini-tphcm" },
                                { label: "Căn hộ", value: "can-ho-tphcm" },
                                { label: "Ký túc xá", value: "ky-tuc-xa-tphcm" },

                            ]}
                            value={category}
                            onChange={
                                (_, value) => {
                                    setCategory(value);
                                }
                            }
                        />
                    </View>
                </View>
                <View className="flex-col gap-2 border border-border rounded-xl p-4 mb-2">
                    <Text className="font-bold text-lg text-foreground">Thông tin mô tả</Text>

                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Tiêu đề</Text>
                        <TextInput
                            placeholder="Nhập tiêu đề"
                            className={`border rounded-md px-3 py-2 text-foreground ${errors.title ? "border-red-500" : "border-border"
                                }`}
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text);
                                setErrors((prev) => ({ ...prev, title: undefined }));
                            }}
                        />
                        {errors.title ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.title}</Text>
                        ) : null}

                    </View>

                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Nội dung mô tả</Text>

                        <TextInput
                            placeholder="Nhập nội dung mô tả"
                            multiline
                            numberOfLines={6}
                            scrollEnabled
                            textAlignVertical="top"
                            className={`border rounded-md px-3 py-2 text-foreground h-40 ${errors.description ? "border-red-500" : "border-border"
                                }`}
                            value={description}
                            onChangeText={(text) => {
                                setDescription(text);
                                setErrors((prev) => ({ ...prev, description: undefined }));
                            }}
                        />
                        {errors.description ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.description}</Text>
                        ) : null}
                    </View>

                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Giá thuê</Text>
                        <View className="flex-row items-center gap-2">
                            <TextInput
                                placeholder="Nhập giá thuê"
                                className={`border rounded-md px-3 py-2 text-foreground flex-1 ${errors.price ? "border-red-500" : "border-border"
                                    }`}
                                keyboardType="numeric"
                                value={price ? Number(price).toLocaleString("vi-VN") : ""}
                                onChangeText={(text) => {
                                    const numericValue = text.replace(/\D/g, "");
                                    setPrice(numericValue);
                                    setErrors((prev) => ({ ...prev, price: undefined }));
                                }}
                            />
                            <Pressable
                                onPress={() =>
                                    setUnit((prev) => (prev === "đồng/tháng" ? "đồng/m2/tháng" : "đồng/tháng"))
                                }
                                className="flex-row items-center gap-1 border border-border rounded-md px-3 py-2 text-foreground"
                            >
                                <Text className="text-sm text-foreground">{unit}</Text>
                                <Ionicons name="chevron-down" size={14} />
                            </Pressable>
                        </View>
                        {errors.price ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.price}</Text>
                        ) : null}
                    </View>

                    <View className="flex-col">
                        <Text className="font-semibold  text-foreground mb-1">Diện tích</Text>
                        <TextInput
                            placeholder="Nhập diện tích"
                            className={`border rounded-md px-3 py-2 text-foreground ${errors.area ? "border-red-500" : "border-border"
                                }`}
                            keyboardType="numeric"
                            value={area ? `${area} m²` : ""}
                            onChangeText={(text) => {
                                const numericValue = text.replace(/\D/g, "");
                                setArea(numericValue);
                                setErrors((prev) => ({ ...prev, area: undefined }));
                            }}
                        />
                        {errors.area ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.area}</Text>
                        ) : null}
                    </View>
                </View>

                <View className="flex-col gap-2 border border-border rounded-xl p-4 mb-2">
                    <Text className="font-bold text-lg text-foreground">Khu vực</Text>

                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Tỉnh/Thành phố</Text>
                        <DropdownComponent
                            placeholder="Chọn tỉnh/thành phố"
                            data={provinces}
                            value={province}
                            onChange={(value) => {
                                setProvince(value);
                                setDistrict(null);
                                setWard(null);
                                setStreet("");
                                setHouseNumber("");
                                setAddress("");
                                setLat(10.77551);
                                setLng(106.702101);
                                setErrors((prev) => ({ ...prev, province: undefined }));
                            }}
                        />
                        {errors.province ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.province}</Text>
                        ) : null}
                    </View>

                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Quận/Huyện</Text>
                        <DropdownComponent
                            placeholder="Chọn quận/huyện"
                            data={districts}
                            value={district}
                            onChange={(value) => {
                                setDistrict(value);
                                setWard(null);
                                setStreet("");
                                setHouseNumber("");
                                setErrors((prev) => ({ ...prev, district: undefined }));
                            }}
                            disabled={!province}
                        />
                        {errors.district ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.district}</Text>
                        ) : null}
                    </View>

                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Phường/Xã</Text>
                        <DropdownComponent
                            placeholder="Chọn phường/xã"
                            data={wards}
                            value={ward}
                            onChange={(value) => {
                                setWard(value);
                                setStreet("");
                                setHouseNumber("");
                                setErrors((prev) => ({ ...prev, ward: undefined }));
                            }}
                            disabled={!district}
                        />
                        {errors.ward ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.ward}</Text>
                        ) : null}
                    </View>
                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Đường phố</Text>
                        <TextInput
                            placeholder="Nhập đường phố"
                            className={`border rounded-md px-3 py-2 text-foreground ${errors.street ? "border-red-500" : "border-border"
                                }`}
                            value={street}
                            onChangeText={(text) => {
                                setStreet(text);
                                setErrors((prev) => ({ ...prev, street: undefined }));
                            }}
                            editable={!!ward}
                        />
                        {errors.street ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.street}</Text>
                        ) : null}
                    </View>
                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Số nhà</Text>
                        <TextInput
                            placeholder="Nhập số nhà"
                            className={`border rounded-md px-3 py-2 text-foreground ${errors.houseNumber ? "border-red-500" : "border-border"
                                }`}
                            value={houseNumber}
                            onChangeText={(text) => {
                                setHouseNumber(text);
                                setErrors((prev) => ({ ...prev, houseNumber: undefined }));
                            }}
                            editable={!!street}
                        />
                        {errors.houseNumber ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.houseNumber}</Text>
                        ) : null}
                    </View>
                    <View className="flex-col">
                        <Text className="font-semibold text-foreground mb-1">Địa chỉ chi tiết</Text>
                        <TextInput
                            placeholder="Nhập địa chỉ chi tiết"
                            className={`border rounded-md px-3 py-2 text-foreground h-20 ${errors.address ? "border-red-500" : "border-border"
                                }`}
                            value={address}
                            editable={false}
                            selectTextOnFocus
                            multiline
                            textAlignVertical="top"
                        />
                        {errors.address ? (
                            <Text className="text-red-500 text-sm mt-2">{errors.address}</Text>
                        ) : null}
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
                    <Text className="font-bold text-lg text-foreground">Đặc điểm nổi bật</Text>
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
                                    <Text className="text-sm text-foreground">{item.title}</Text>
                                </Pressable>
                            );
                        })}

                        {selected.length > 0 && (
                            <View className="mt-3 border-t border-border pt-3">
                                <Text className="font-semibold mb-2 text-foreground">
                                    Đã chọn ({selected.length})
                                </Text>

                                <View className="flex-row flex-wrap gap-2">
                                    {selected.map((item) => (
                                        <View
                                            key={item}
                                            className="px-3 py-1 rounded-full bg-primary/10 border border-primary"
                                        >
                                            <Text className="text-sm text-foreground">{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                </View>

                <View className="flex-col gap-4 border border-border rounded-xl p-4 mb-2">
                    <Text className="font-bold text-lg text-foreground">Tiện ích xung quanh</Text>

                    <View className="flex-col gap-3">
                        <View className="flex-col">
                            <Text className="font-semibold text-foreground mb-1">Tên tiện ích</Text>
                            <TextInput
                                placeholder="Nhập tên tiện ích"
                                className="border border-border rounded-md px-3 py-2 text-foreground"
                                value={inputName}
                                onChangeText={setInputName}
                            />
                        </View>

                        <View className="flex-col">
                            <Text className="font-semibold text-foreground mb-1">Khoảng cách</Text>

                            <View className="flex-row items-center gap-2">
                                <TextInput
                                    placeholder="Nhập khoảng cách"
                                    keyboardType="numeric"
                                    className="flex-1 border border-border rounded-md px-3 py-2 text-foreground"
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
                                    <Text className="text-sm text-foreground">{unitDistance}</Text>
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
                                        unit_distance: unitDistance,
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
                                        <Text className="text-sm text-foreground">
                                            • {item.name} – {item.distance} {item.unit_distance}
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

                <View className="flex-col gap-4 border border-border rounded-xl p-4 mb-2">
                    <Text className="font-bold text-lg text-foreground">Hình ảnh</Text>

                    <Pressable
                        onPress={pickImages}
                        className={`h-40 rounded-2xl border-2 border-dashed flex items-center justify-center
                        ${errors.images
                                ? "border-red-500 bg-red-500/10"
                                : "border-primary bg-primary/10"
                            }`}
                    >
                        <Ionicons name="camera-outline" size={48} color="#6b7280" />
                        <Text className="text-muted-foreground">
                            Chọn ảnh từ thiết bị ({displayImages.length}/{maxNumImages})
                        </Text>

                    </Pressable>

                    {errors.images ? (
                        <Text className="text-red-500 text-sm">{errors.images}</Text>
                    ) : null}
                    {displayImages.length > 0 && (
                        <FlatList
                            data={displayImages}
                            keyExtractor={(item) => item.uri}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8 }}
                            renderItem={({ item }) => (
                                <View className="relative">
                                    <RNImage
                                        source={{ uri: item.uri }}
                                        style={{ width: 96, height: 96, borderRadius: 8 }}
                                    />

                                    <Pressable
                                        onPress={() => {
                                            if (item.isOld) {
                                                setOldImages((prev) => prev.filter((u) => u !== item.uri));
                                            } else {
                                                setNewImages((prev) => prev.filter((i) => i.uri !== item.uri));
                                            }
                                        }}
                                        className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 items-center justify-center"
                                    >
                                        <Text className="text-white text-xs">✕</Text>
                                    </Pressable>
                                </View>
                            )}
                        />
                    )}



                    <View className="mt-2">
                        <Text className="text-xs text-muted-foreground">
                            • Tải lên tối thiểu 5 ảnh trong một bài đăng
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            • Tải lên tối đa 20 ảnh trong một bài đăng
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            • Dung lượng ảnh tối đa 10MB
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            • Hình ảnh phải liên quan đến phòng trọ, nhà cho thuê
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            • Không chèn văn bản, số điện thoại lên ảnh
                        </Text>
                    </View>



                </View>

                {maxNumVideos > 0 && (
                    <View className="flex-col gap-4 border border-border rounded-xl p-4 mb-2">
                        <Text className="font-bold text-lg text-foreground">Video</Text>

                        {!displayVideoUri ? (
                            <Pressable onPress={pickVideo} className="h-40 rounded-2xl border-2 border-dashed flex items-center justify-center bg-primary/10">
                                <Ionicons name="videocam-outline" size={48} color="#6b7280" />
                                <Text className="text-muted-foreground mt-2">Chọn 1 video từ thiết bị</Text>
                            </Pressable>
                        ) : (
                            <View className="relative">
                                <Video
                                    source={{ uri: displayVideoUri }}
                                    style={{ width: "100%", height: 220, borderRadius: 12 }}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                />

                                <Pressable
                                    onPress={() => {
                                        setOldVideo(null);
                                        setNewVideo(null);
                                    }}
                                    className="absolute top-2 right-2 bg-black/60 rounded-full w-8 h-8 items-center justify-center"
                                >
                                    <Text className="text-white font-bold">✕</Text>
                                </Pressable>
                            </View>
                        )}


                        {videoError ? (
                            <Text className="text-red-500 text-sm">{videoError}</Text>
                        ) : null}

                        <View>
                            <Text className="text-xs text-muted-foreground">• Hỗ trợ tải lên 1 video cho mỗi bài đăng</Text>
                            <Text className="text-xs text-muted-foreground">• Dung lượng video tối đa 50MB</Text>
                            <Text className="text-xs text-muted-foreground">• Định dạng hỗ trợ: MP4, MOV, hoặc WebM</Text>
                            <Text className="text-xs text-muted-foreground">• Video phải ghi lại không gian phòng trọ một cách rõ ràng</Text>
                            <Text className="text-xs text-muted-foreground">• Không chèn văn bản, số điện thoại vào video</Text>
                            <Text className="text-xs text-muted-foreground">• Không dùng hiệu ứng gây khó nhìn hoặc làm sai lệch tình trạng thực tế của phòng</Text>
                        </View>
                    </View>
                )}



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
                        onPress={() => router.back()}
                    >
                        <Text className="text-foreground text-center font-bold ">Quay lại</Text>
                    </Pressable>

                    <Pressable
                        className="flex-1 h-10 bg-[#2baf90] w-full rounded-lg py-2 items-center justify-center border border-[#2baf90]"
                        onPress={() => handleSubmit()}
                    >
                        <Text className="text-white text-center font-bold">{loading ? "Đang cập nhật..." : "Cập nhật bài đăng"}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
