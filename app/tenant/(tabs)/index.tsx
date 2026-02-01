import { getAllCategoryServices } from "@/api/categoryServicesApi";
import { getAllPosts, savePost } from "@/api/postApi";
import { getAllPostRoomSharing, savePostRoomSharing } from "@/api/postRoomShareApi";
import { getAllPostsPropose } from "@/api/proposeApi";
import Person from "@/assets/images/person.png";
import AuthPressable from "@/components/customs/AuthPressable";
import { DividerCustom } from "@/components/customs/DividerCustom";
import { LoadingData } from "@/components/customs/LoadingData";
import { Tag360 } from "@/components/customs/Tag360";
import { TagCheck } from "@/components/customs/TagCheck";
import { TagVip } from "@/components/customs/TagVip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { PostInfoType } from "@/types/postInfoType";
import { ServiceType } from "@/types/serviceType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

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

export default function RealEstateHeroScreen() {
    const [tab, setTab] = useState<"phong-tro-tphcm" | "phong-o-ghep-tphcm">("phong-tro-tphcm");
    const [roomTab, setRoomTab] = useState<"room" | "roomShare">("room");
    const colorScheme = useColorScheme();
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();
    const { userID } = useAuthStore()

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationStep, setLocationStep] = useState<"district" | "ward">(
        "district"
    );

    const [districts, setDistricts] = useState<LocationItem[]>([]);
    const [wards, setWards] = useState<LocationItem[]>([]);

    const [districtValue, setDistrictValue] = useState("");
    // const [wardValue, setWardValue] = useState("");

    const [districtName, setDistrictName] = useState("");
    const [wardName, setWardName] = useState("");
    const [wardSlug, setWardSlug] = useState("");

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [postProposes, setPostProposes] = useState<PostInfoType[]>([]);
    const [services, setServices] = useState<ServiceType[]>([]);
    const [post, setPost] = useState<PostInfoType[]>([]);
    const [postRoomShare, setPostRoomShare] = useState<PostInfoType[]>([]);

    const fetchPostProposes = async () => {
        try {
            setInitialLoading(true);

            const response = await getAllPostsPropose();
            const responseServices = await getAllCategoryServices();
            const responsePost = await getAllPosts();
            const responsePostRoomShare = await getAllPostRoomSharing();

            setPostProposes(response.data);
            setServices(responseServices);
            setPost(responsePost);
            setPostRoomShare(responsePostRoomShare);



        } catch {
            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể tải dữ liệu",
                position: "top",
            });
        } finally {
            setInitialLoading(false);
        }
    };


    useFocusEffect(
        useCallback(() => {
            fetchPostProposes();
        }, [])
    );

    useEffect(() => {
        setLoading(true);
        fetch(`https://provinces.open-api.vn/api/p/79?depth=2`)
            .then((res) => res.json())
            .then((data) => {
                setDistricts(
                    data.districts.map((d: LocationAPI & { province_code: number }) => ({
                        value: String(d.code),
                        label: d.name,
                        codename: d.codename,
                    }))
                );
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!districtValue) return;

        setLoading(true);
        fetch(`https://provinces.open-api.vn/api/d/${districtValue}?depth=2`)
            .then((res) => res.json())
            .then((data) => {
                setWards(
                    data.wards.map((w: LocationAPI & { district_code: number }) => ({
                        value: String(w.code),
                        label: w.name,
                        codename: w.codename,
                    }))
                );
                // setWardValue("");
                setWardName("");
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [districtValue]);

    const handleDistrictSelect = (item: LocationItem) => {
        setDistrictValue(item.value);
        setDistrictName(item.label);
        setLocationStep("ward");
    };

    const handleWardSelect = (item: LocationItem) => {
        // setWardValue(item.value);
        setWardName(item.label);
        setWardSlug(item.codename);
        setShowLocationModal(false);
        setLocationStep("district");
    };

    const getDisplayText = () => {
        const roomType = tab === "phong-tro-tphcm" ? "Phòng trọ" : "Phòng ghép";
        const parts: string[] = [roomType];

        if (wardName) {
            parts.push(`${wardName}, ${districtName}, TP.HCM`);
        } else if (districtName) {
            parts.push(`${districtName}, TP.HCM`);
        } else {
            parts.push("TP.HCM");
        }

        return parts.join(" - ");
    };

    const handleBackStep = () => {
        if (locationStep === "ward") {
            setLocationStep("district");
            setDistrictValue("");
            setDistrictName("");
            setWards([]);
        }
    };

    const handleCloseModal = () => {
        setShowLocationModal(false);
        setLocationStep("district");
    };

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchPostProposes();
        } catch (e: any) {
            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: e?.message ?? "Không thể làm mới dữ liệu",
                position: "top",
            });
        } finally {
            setRefreshing(false);
        }
    };

    const handleSavePost = async (slug: string, category: string) => {
        if (!userID) {
            Toast.show({
                type: "error",
                text1: "Bạn chưa đăng nhập",
                text2: "Vui lòng đăng nhập để lưu bài viết",
            });
            return;
        }

        setPost(prev => toggleSaveInList(prev, slug));
        setPostProposes(prev => toggleSaveInList(prev, slug));
        setPostRoomShare(prev => toggleSaveInList(prev, slug));

        try {
            if (category === "phong-o-ghep-tphcm") {
                await savePostRoomSharing(slug);
            } else {
                await savePost(slug);
            }

        } catch {
            setPost(prev => toggleSaveInList(prev, slug));
            setPostProposes(prev => toggleSaveInList(prev, slug));
            setPostRoomShare(prev => toggleSaveInList(prev, slug));

            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể lưu bài viết",
            });
        }
    };


    const toggleSaveInList = (list: PostInfoType[], slug: string) =>
        list.map(item => {
            if (item.slug !== slug) return item;

            const saved = Array.isArray(item.saved) ? item.saved : [];
            const hasSaved = saved.includes(userID!);

            return {
                ...item,
                saved: hasSaved
                    ? saved.filter(id => id !== userID)
                    : [...saved, userID!],
            };
        });


    return (
        <>
            <ScrollView className="flex-1 bg-background" refreshControl={
                <RefreshControl
                    progressViewOffset={40}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#2baf90"
                    colors={["#2baf90"]}
                />
            }>
                <View className="bg-[#2baf90] px-6 pt-20 pb-36 rounded-b-[60px] overflow-hidden">
                    <Text className="text-white text-3xl font-extrabold">Tronect</Text>
                    <Text className="text-white/90 mt-2 text-base">
                        Phòng thật - Giá thật - Ở an tâm.
                    </Text>

                    <View className="mt-2 flex-row items-center">
                        <Pressable
                            onPress={() => setTab("phong-tro-tphcm")}
                            className={cn(
                                "h-8 px-4 rounded-full items-center justify-center",
                                tab === "phong-tro-tphcm" ? "bg-white" : "bg-transparent"
                            )}
                        >
                            <Text
                                className={cn(
                                    "text-sm font-semibold",
                                    tab === "phong-tro-tphcm" ? "text-[#2baf90]" : "text-white"
                                )}
                            >
                                Phòng trọ
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setTab("phong-o-ghep-tphcm")}
                            className={cn(
                                " h-8 px-4 rounded-full items-center justify-center",
                                tab === "phong-o-ghep-tphcm" ? "bg-white" : "bg-transparent"
                            )}
                        >
                            <Text
                                className={cn(
                                    "text-sm font-semibold",
                                    tab === "phong-o-ghep-tphcm" ? "text-[#2baf90]" : "text-white"
                                )}
                            >
                                Phòng ghép
                            </Text>
                        </Pressable>
                    </View>

                    <View className="absolute right-6 bottom-24">
                        <View className="h-24 w-24 rounded-3xl bg-white/30 items-center justify-center"></View>
                    </View>

                    <View className="absolute right-2 bottom-24">
                        <Image
                            source={Person}
                            style={{ width: 160, height: 160 }}
                            contentFit="contain"
                        />
                    </View>
                </View>

                <View className="-mt-24 px-4 ">
                    <Card className="rounded-3xl bg-white p-4 shadow-sm border-transparent gap-2">
                        <Pressable
                            onPress={() => setShowLocationModal(true)}
                            className="flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center gap-4 pb-1">
                                <View className=" h-8 w-8 rounded-2xl bg-[#2baf90]/20 items-center justify-center">
                                    <Ionicons name="location-outline" size={20} color="#2baf90" />
                                </View>
                                <Text className="text-sm text-muted-foreground font-semibold">
                                    Khu vực
                                </Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                        </Pressable>
                        <DividerCustom />

                        {/* Search */}
                        <View className="flex-row items-center gap-2 pt-1">
                            <View className="flex-1 relative">
                                <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                    <Ionicons name="search" size={20} color="#9CA3AF" />
                                </View>
                                <Input
                                    value={getDisplayText()}
                                    placeholder="Tìm phòng trọ..."
                                    className="h-10 text-sm pl-11 rounded-lg bg-muted text-black dark:text-black dark:bg-gray-100 border-gray-200 line-clamp-1"
                                />
                            </View>

                            <Button
                                variant={"tronect"}
                                className="rounded-lg"
                                onPress={() => {
                                    router.push({
                                        pathname: "/tenant/(tabs)/search/search-result",
                                        params: {
                                            category: tab,
                                            district: districtName || "",
                                            ward: wardSlug || "",
                                            wardName: wardName || "",
                                        },
                                    });
                                    setDistrictValue("");
                                    // setWardValue("");
                                    setDistrictName("");
                                    setWardName("");
                                    setWardSlug("");
                                }}
                            >
                                <Text className="text-white font-semibold text-base">Tìm</Text>
                            </Button>
                        </View>
                    </Card>
                </View>

                {
                    initialLoading ? (
                        <LoadingData />
                    ) : (
                        <View>
                            <View className="px-4">
                                <Text className="mt-4 mb-2 text-lg font-bold">Đề xuất cho bạn</Text>
                                <View>
                                    <FlatList
                                        data={postProposes}
                                        numColumns={2}
                                        columnWrapperStyle={{ gap: 12 }}
                                        contentContainerStyle={{ gap: 12 }}
                                        keyExtractor={(item) => item.id}
                                        scrollEnabled={false}
                                        renderItem={({ item }) => (
                                            <Pressable className="flex-1" onPress={() => router.push({ pathname: "/tenant/post-detail", params: { slug: item.slug, category: item.category || "", }, })}>
                                                <Card className="relative overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0">
                                                    <View style={{ position: "relative" }}>
                                                        <Image
                                                            source={{ uri: item.images[0] }}
                                                            style={{ width: "100%", height: 120 }}
                                                            contentFit="cover"
                                                        />
                                                        <View style={{ position: "absolute", top: 8, left: 8 }}>
                                                            <TagCheck verification_status={item.verification_status} />
                                                        </View>

                                                        <View style={{ position: "absolute", bottom: 8, right: 8, flexDirection: "row", gap: 2 }}>
                                                            <TagVip postType={item.post_type} />
                                                            <Tag360 picture_360={item.picture_360} />
                                                        </View>
                                                    </View>
                                                    <View className="p-2">
                                                        <Text className="text-sm font-semibold line-clamp-2">
                                                            {item.title}</Text>
                                                        <View className="flex-row items-center justify-between">
                                                            <View className="flex-row items-center gap-1">
                                                                <Text className="text-red-500 font-bold text-sm">
                                                                    {item.price.toLocaleString()} đ
                                                                </Text>
                                                                <Text className="text-xs font-semibold">
                                                                    {" • "} {item.acreage} m²
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View className="flex-row items-center gap-1">
                                                            <Ionicons
                                                                name="location-outline"
                                                                size={14}
                                                                color="gray"
                                                            />
                                                            <Text className="text-xs text-muted-foreground">
                                                                {item.district}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Pressable
                                                        style={{
                                                            position: "absolute",
                                                            right: 10,
                                                            bottom: 10,
                                                            zIndex: 10,
                                                        }}
                                                        hitSlop={10}
                                                        onPress={() => handleSavePost(item.slug, item.category)}
                                                    >
                                                        <Ionicons
                                                            name={item?.saved?.includes(userID || "") ? "heart" : "heart-outline"}
                                                            size={22}
                                                            color={item?.saved?.includes(userID || "") ? "red" : "gray"}
                                                        />
                                                    </Pressable>
                                                </Card>
                                            </Pressable>
                                        )}
                                    />
                                </View>
                            </View>

                            <View className="px-4">
                                <View className="flex-row items-center justify-between mt-4 mb-2">
                                    <Text className=" text-lg font-bold">Dịch vụ tiện ích</Text>
                                    <AuthPressable
                                        onAuthorizedPress={() => router.push("/tenant/all-service")}
                                    >
                                        <Text className="text-xs text-muted-foreground">Xem thêm</Text>
                                    </AuthPressable>

                                </View>
                                <View>
                                    <FlatList
                                        data={services.slice(0, 9)}
                                        numColumns={3}
                                        columnWrapperStyle={{ gap: 12 }}
                                        contentContainerStyle={{ gap: 12 }}
                                        keyExtractor={(item) => item.id}
                                        scrollEnabled={false}
                                        renderItem={({ item }) => (
                                            <AuthPressable style={{ width: "31%" }} onAuthorizedPress={() => router.push({
                                                pathname: `/tenant/all-service/service`,
                                                params: {
                                                    title: item.title,
                                                }
                                            })}>
                                                <Card className="overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0 rounded-md">
                                                    <Image
                                                        source={{ uri: item.image }}
                                                        style={{ width: "100%", height: 60 }}
                                                        contentFit="cover"
                                                        contentPosition="center"
                                                    />
                                                </Card>
                                                <Text className="px-1 pt-1 text-xs font-semibold line-clamp-2 text-center">
                                                    {item.title}
                                                </Text>
                                            </AuthPressable>
                                        )}
                                    />
                                </View>
                            </View>

                            <View className="px-4 mb-6">
                                <View className="flex-row items-center justify-between mt-4 mb-2">
                                    <Text className="text-lg font-bold">Phòng ở Tronect</Text>
                                </View>

                                <View>
                                    {/* Custom Tab Header */}
                                    <View className="flex-row mb-4 ">
                                        <Pressable onPress={() => setRoomTab("room")} className="mr-6 pb-2">
                                            <Text className={cn("text-sm font-semibold", roomTab === "room" ? "text-[#FF6B35]" : "text-gray-400")}>
                                                Phòng trọ
                                            </Text>
                                            {roomTab === "room" && (
                                                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
                                            )}
                                        </Pressable>
                                        <Pressable onPress={() => setRoomTab("roomShare")} className="pb-2">
                                            <Text className={cn("text-sm font-semibold", roomTab === "roomShare" ? "text-[#FF6B35]" : "text-gray-400")}>
                                                Phòng ở ghép
                                            </Text>
                                            {roomTab === "roomShare" && (
                                                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
                                            )}
                                        </Pressable>
                                    </View>

                                    {roomTab === "room" && (
                                        <FlatList
                                            data={post}
                                            numColumns={2}
                                            columnWrapperStyle={{ gap: 12 }}
                                            contentContainerStyle={{ gap: 12 }}
                                            keyExtractor={(item) => item.id}
                                            scrollEnabled={false}
                                            renderItem={({ item }) => (
                                                <Pressable style={{ width: "48%" }} onPress={() => router.push({ pathname: "/tenant/post-detail", params: { slug: item.slug, category: item.category || "", }, })}>
                                                    <Card className="overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0">
                                                        <View style={{ position: "relative" }}>
                                                            <Image
                                                                source={{ uri: item.images[0] }}
                                                                style={{ width: "100%", height: 120 }}
                                                                contentFit="cover"
                                                            />
                                                            <View style={{ position: "absolute", top: 8, left: 8 }}>
                                                                <TagCheck verification_status={item.verification_status} />
                                                            </View>

                                                            <View style={{ position: "absolute", bottom: 8, right: 8, flexDirection: "row", gap: 2 }}>
                                                                <TagVip postType={item.post_type} />
                                                                <Tag360 picture_360={item.picture_360} />
                                                            </View>
                                                        </View>
                                                        <View className="p-2">
                                                            <Text className="text-sm font-semibold line-clamp-2">
                                                                {item.title}</Text>
                                                            <View className="flex-row items-center justify-between">
                                                                <View className="flex-row items-center gap-1">
                                                                    <Text className="text-red-500 font-bold text-sm">
                                                                        {item.price.toLocaleString()} đ
                                                                    </Text>
                                                                    <Text className="text-xs font-semibold">
                                                                        {" • "} {item.acreage} m²
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <View className="flex-row items-center gap-1">
                                                                <Ionicons
                                                                    name="location-outline"
                                                                    size={14}
                                                                    color="gray"
                                                                />
                                                                <Text className="text-xs text-muted-foreground">
                                                                    {item.district}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <Pressable
                                                            style={{
                                                                position: "absolute",
                                                                right: 10,
                                                                bottom: 10,
                                                                zIndex: 10,
                                                            }}
                                                            hitSlop={10}
                                                            onPress={() => handleSavePost(item.slug, item.category)}
                                                        >
                                                            <Ionicons
                                                                name={item?.saved?.includes(userID || "") ? "heart" : "heart-outline"}
                                                                size={22}
                                                                color={item?.saved?.includes(userID || "") ? "red" : "gray"}
                                                            />
                                                        </Pressable>
                                                    </Card>
                                                </Pressable>
                                            )}
                                        />
                                    )}

                                    {roomTab === "roomShare" && (
                                        <FlatList
                                            data={postRoomShare}
                                            numColumns={2}
                                            columnWrapperStyle={{ gap: 12 }}
                                            contentContainerStyle={{ gap: 12 }}
                                            keyExtractor={(item) => item.id}
                                            scrollEnabled={false}
                                            renderItem={({ item }) => (
                                                <Pressable style={{ width: "48%" }} onPress={() => router.push({ pathname: "/tenant/post-detail", params: { slug: item.slug, category: item.category || "", }, })}>
                                                    <Card className="overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0 rounded-md">
                                                        <Image
                                                            source={{ uri: item.images[0] }}
                                                            style={{ width: "100%", height: 120 }}
                                                            contentFit="cover"
                                                            contentPosition="center"
                                                        />
                                                        <View className="p-2">
                                                            <Text className="text-sm font-semibold line-clamp-2">
                                                                {item.title}
                                                            </Text>
                                                            <View className="flex-row items-center justify-between">
                                                                <View className="flex-row items-center gap-1">
                                                                    <Text className="text-red-500 font-bold text-sm">
                                                                        {item.price.toLocaleString()} đ
                                                                    </Text>
                                                                    <Text className="text-xs font-semibold">
                                                                        {" • "} {item.acreage} m²
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <View className="flex-row items-center gap-1">
                                                                <Ionicons
                                                                    name="location-outline"
                                                                    size={14}
                                                                    color="gray"
                                                                />
                                                                <Text className="text-xs text-muted-foreground">
                                                                    {item.district}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <Pressable
                                                            style={{
                                                                position: "absolute",
                                                                right: 10,
                                                                bottom: 10,
                                                                zIndex: 10,
                                                            }}
                                                            hitSlop={10}
                                                            onPress={() => handleSavePost(item.slug, item.category)}
                                                        >
                                                            <Ionicons
                                                                name={item?.saved?.includes(userID || "") ? "heart" : "heart-outline"}
                                                                size={22}
                                                                color={item?.saved?.includes(userID || "") ? "red" : "gray"}
                                                            />
                                                        </Pressable>
                                                    </Card>
                                                </Pressable>
                                            )}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    )
                }
            </ScrollView >
            <AuthPressable
                onAuthorizedPress={() => router.push("/tenant/chatbot")}
                style={{
                    position: "absolute",
                    right: 20,
                    bottom: insets.bottom - 20,
                    width: 48,
                    height: 48,
                    borderRadius: 28,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: 0,
                    backgroundColor: "#2baf90",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Image
                    source={require("@/assets/images/chatbot.png")}
                    style={{ width: 52, height: 52, marginBottom: 8 }}
                    contentFit="cover"
                />
            </AuthPressable>
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
        </>
    );
}
