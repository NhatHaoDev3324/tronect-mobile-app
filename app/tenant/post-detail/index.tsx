import { getPostBySlug, savePost } from "@/api/postApi";
import {
    getPostRoomSharingBySlug,
    savePostRoomSharing,
} from "@/api/postRoomShareApi";

import Button360 from "@/components/customs/Button360";
import { DividerCustom } from "@/components/customs/DividerCustom";
import TagCheck from "@/components/customs/TagCheck";
import TagVip from "@/components/customs/TagVip";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";
import { PostInfoType } from "@/types/postInfoType";
import { options } from "@/utils/dataitem";
import { getNameRole } from "@/utils/getNameRole";
import { getRoomName } from "@/utils/getRoomName";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    type ViewProps,
} from "react-native";
import ImageZoom from 'react-native-image-pan-zoom';

import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function PostDetailScreen({
    lightColor,
    darkColor,
}: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background",
    );

    const { slug, category } = useLocalSearchParams<{
        slug: string;
        category: string;
    }>();
    const { userID } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PostInfoType>();
    const [activeIndex, setActiveIndex] = useState(0);

    const { width } = Dimensions.get("window");
    const insets = useSafeAreaInsets();
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewData, setPreviewData] = useState<{
        type: 'image' | 'video';
        uri: string;
    } | null>(null);

    const images = data?.images ?? [];
    const hasVideo = Boolean(data?.video);
    const imageSlides = hasVideo ? images : images.slice(1);
    const totalSlides = hasVideo ? images.length + 1 : images.length;

    useEffect(() => {
        if (!slug) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                let responsePost: any;
                if (category === "phong-o-ghep-tphcm") {
                    responsePost = await getPostRoomSharingBySlug(slug);
                } else {
                    responsePost = await getPostBySlug(slug);
                }
                setData(responsePost);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [slug]);

    const handleSavePost = async (slug: string, category: string) => {
        if (!userID || !data) {
            Toast.show({
                type: "error",
                text1: "Bạn chưa đăng nhập",
                text2: "Vui lòng đăng nhập để lưu bài viết",
            });
            return;
        }

        const prevData = data;
        setData(toggleSaveInPost(data));

        try {
            if (category === "phong-o-ghep-tphcm") {
                await savePostRoomSharing(slug);
            } else {
                await savePost(slug);
            }
        } catch (error) {
            setData(prevData);

            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể lưu bài viết",
            });
        }
    };

    const toggleSaveInPost = (post: PostInfoType) => {
        const saved = Array.isArray(post.saved) ? post.saved : [];
        const hasSaved = saved.includes(userID!);

        return {
            ...post,
            saved: hasSaved
                ? saved.filter((id) => id !== userID)
                : [...saved, userID!],
        };
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View
                style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }}
                className="flex-row items-center justify-between border-b border-border px-4 py-3"
            >
                <Pressable
                    onPress={() => router.back()}
                    style={{ paddingHorizontal: 12 }}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>

                <Text className="text-xl font-semibold text-white">
                    {getRoomName(category)}
                </Text>
                <Pressable
                    hitSlop={10}
                    onPress={() => handleSavePost(data!.slug, data!.category)}
                >
                    <Ionicons
                        name={
                            data?.saved?.includes(userID || "") ? "heart" : "heart-outline"
                        }
                        size={24}
                        color={data?.saved?.includes(userID || "") ? "red" : "white"}
                    />
                </Pressable>
            </View>

            <ScrollView>
                <View style={{ position: "relative" }}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        <View style={{ width, height: 260 }}>
                            {hasVideo ? (
                                <Pressable
                                    style={{ width, height: 260 }}
                                    onPress={() => {
                                        setPreviewData({ type: 'video', uri: data!.video });
                                        setPreviewVisible(true);
                                    }}
                                >
                                    <Video
                                        source={{ uri: data!.video }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode={ResizeMode.COVER}
                                        shouldPlay={activeIndex === 0}
                                        isLooping
                                    />
                                </Pressable>

                            ) : (
                                images[0] && (
                                    <Image
                                        source={{ uri: images[0] }}
                                        style={{ width: "100%", height: "100%" }}
                                        contentFit="cover"
                                    />
                                )
                            )}
                        </View>

                        {imageSlides.map((img, index) => (
                            <Pressable
                                key={`${img}-${index}`}
                                onPress={() => {
                                    setPreviewData({ type: 'image', uri: img });
                                    setPreviewVisible(true);
                                }}
                            >
                                <Image
                                    source={{ uri: img }}
                                    style={{ width, height: 260 }}
                                    contentFit="cover"
                                />
                            </Pressable>
                        ))}

                    </ScrollView>

                    <View
                        style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 12,
                        }}
                    >
                        <Text className="text-white text-xs font-medium">
                            {activeIndex + 1}/{totalSlides}
                        </Text>
                    </View>

                    <View
                        style={{
                            position: "absolute",
                            bottom: 12,
                            right: 12,
                        }}
                    >
                        <Button360 picture_360={data?.picture_360} onPress={() => router.push({
                            pathname: "/tenant/panorama360",
                            params: { imageUrl: data?.picture_360 },
                        })} />
                    </View>
                </View>
                <View className="px-4 flex-row gap-2 justify-between mt-2" >
                    <View className="flex-row justify-center mt-2" >
                        {Array.from({ length: totalSlides }).map((_, index) => (
                            <View
                                key={index}
                                style={{
                                    width: index === activeIndex ? 8 : 6,
                                    height: index === activeIndex ? 8 : 6,
                                    borderRadius: 4,
                                    backgroundColor: index === activeIndex ? "#2baf90" : "#d1d5db",
                                    marginHorizontal: 4,
                                }}
                            />
                        ))}
                    </View>
                    <View className="flex-row gap-2">
                        <TagVip postType={data?.post_type} />
                        <TagCheck verification_status={data?.verification_status ?? "unverified"} />
                    </View>
                </View>

                <View className="px-4 py-2 flex-col gap-2">
                    <Text
                        className="text-xl font-bold leading-6 text-foreground"
                        numberOfLines={2}
                    >
                        {data?.title}
                    </Text>

                    <View className="flex-row items-center flex-wrap gap-x-3">
                        <Text className="text-red-500 text-base font-bold">
                            {data?.price?.toLocaleString()} {data?.unit}
                        </Text>

                        <Text className="text-gray-400 text-xl">•</Text>

                        <Text className="text-base font-semibold text-foreground">
                            {data?.acreage} m²
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

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center px-4 py-1 gap-4">
                        <Image
                            source={data?.landlord.picture}
                            style={{ width: 52, height: 52, borderRadius: 999 }}
                            contentFit="cover"
                        />

                        <View className="flex-1">
                            <Text
                                className="text-base font-semibold text-foreground"
                                numberOfLines={1}
                            >
                                {data?.landlord.username}
                            </Text>

                            <Text
                                className="text-sm text-gray-500"
                                numberOfLines={1}
                            >
                                {getNameRole(data?.landlord.role ?? "Không xác định")}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="py-1">
                    <DividerCustom />
                </View>

                <View className="px-4 py-2 flex-col gap-2">
                    <Text className="text-lg font-bold text-foreground">
                        Thông tin mô tả
                    </Text>
                    <Text className="text-base text-foreground">
                        {data?.description}
                    </Text>
                </View>

                <View className="py-1">
                    <DividerCustom />
                </View>

                <View className="px-4 py-2 flex-col gap-2">
                    <Text className="text-lg font-bold text-foreground">
                        Nổi bật
                    </Text>
                    <View className="flex flex-row flex-wrap">
                        {options.map((item) => {
                            const isOption = data?.outstanding?.includes(item.title);
                            return (
                                <View key={item.value} className="w-1/2 flex flex-row items-center mb-2 gap-2">
                                    <View className={`w-4 h-4 rounded-full items-center justify-center ${isOption ? "bg-green-500" : "bg-red-500"}`}>
                                        <Ionicons name={isOption ? "checkmark" : "close"} size={12} color="white" />
                                    </View>

                                    <Text className={`text-xs ${!isOption ? "line-through opacity-60" : ""}`} numberOfLines={1}>{item.title}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View className="py-1">
                    <DividerCustom />
                </View>

                {(data?.nearby_amenities?.length ?? 0) > 0 &&
                    <>
                        <View className="px-4 py-2 flex-col gap-2">
                            <Text className="text-lg font-bold text-foreground">
                                Tiện ích xung quanh
                            </Text>
                            <View className="flex flex-row flex-wrap gap-2">
                                {data?.nearby_amenities?.map((item, index) => (
                                    <View
                                        key={index}
                                        className="w-full flex flex-row items-center justify-between border border-gray-300 rounded-md p-2"
                                    >
                                        <Text
                                            className="font-medium text-sm flex-shrink"
                                            numberOfLines={1}
                                        >
                                            - {item.name}
                                        </Text>

                                        <Text className="text-xs text-gray-500 ml-2">
                                            {item.distance} {item.unit_distance || "m"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View className="py-1">
                            <DividerCustom />
                        </View>
                    </>
                }
            </ScrollView >



            <View
                style={{
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                }}
            >
                <View className="flex-row items-center">
                    {
                        data?.landlord.zalo ?
                            (
                                <View className="w-1/2 h-full flex-row items-center justify-center">
                                    <View className="w-1/2 h-full items-center justify-center border-r border-border">
                                        <Pressable className="items-center justify-center" onPress={() => { Linking.openURL(`https://zalo.me/${data?.landlord.phone}`); }}>
                                            <Image
                                                source={require("@/assets/icon/zalo.svg")}
                                                style={{ width: 40, height: 40 }}
                                                contentFit="cover"

                                            />
                                        </Pressable>
                                    </View>
                                    <View className="w-1/2 h-full items-center justify-center border-l border-border">
                                        <Pressable className="items-center justify-center">
                                            <Ionicons
                                                name="chatbubble-ellipses"
                                                size={32}
                                                color="#2baf90"
                                            />
                                        </Pressable>
                                    </View>
                                </View>
                            ) : (
                                <View className="w-1/2 h-full items-center justify-center">
                                    <Pressable className="flex-row items-center justify-center gap-2">
                                        <Ionicons
                                            name="chatbubble-ellipses"
                                            size={32}
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
            <Modal
                visible={previewVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'black' }}>

                    <Pressable
                        onPress={() => setPreviewVisible(false)}
                        style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}
                    >
                        <Text style={{ color: 'white', fontSize: 18 }}>✕</Text>
                    </Pressable>

                    {previewData?.type === 'image' && (
                        <ImageZoom
                            cropWidth={Dimensions.get('window').width}
                            cropHeight={Dimensions.get('window').height}
                            imageWidth={Dimensions.get('window').width}
                            imageHeight={Dimensions.get('window').height}
                        >
                            <Image
                                source={{ uri: previewData.uri }}
                                style={{
                                    width: Dimensions.get('window').width,
                                    height: Dimensions.get('window').height,
                                }}
                                contentFit="contain"
                            />
                        </ImageZoom>
                    )}

                    {previewData?.type === 'video' && (
                        <Video
                            source={{ uri: previewData.uri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay={previewVisible}
                            useNativeControls
                        />
                    )}
                </View>
            </Modal>

        </View >
    );
}
