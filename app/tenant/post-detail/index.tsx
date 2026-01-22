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
    Pressable,
    ScrollView,
    Text,
    View,
    type ViewProps,
} from "react-native";
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
                                <Video
                                    source={{ uri: data!.video }}
                                    style={{ width: "100%", height: "100%" }}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay={activeIndex === 0}
                                    isLooping
                                    useNativeControls={false}
                                />
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
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={{ width, height: 260 }}
                                contentFit="cover"
                            />
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
                        <Button360 picture_360={data?.picture_360} />
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
                        className="text-xl font-bold leading-6"
                        numberOfLines={2}
                    >
                        {data?.title}
                    </Text>

                    <View className="flex-row items-center flex-wrap gap-x-3">
                        <Text className="text-red-500 text-base font-bold">
                            {data?.price?.toLocaleString()} {data?.unit}
                        </Text>

                        <Text className="text-gray-400 text-xl">•</Text>

                        <Text className="text-base font-semibold">
                            {data?.acreage} m²
                        </Text>
                    </View>

                    <View className="flex-row items-start gap-2">
                        <Ionicons
                            name="location-outline"
                            size={16}
                            color="#6b7280"
                            style={{ marginTop: 2 }}
                        />
                        <Text
                            className="text-sm text-gray-600 flex-1"
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
                                className="text-base font-semibold"
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
            </ScrollView>

            <View
                style={{
                    height: 72 + insets.bottom,
                    paddingBottom: insets.bottom,
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                    backgroundColor: "white",
                }}
            >
                <View className="flex-row items-center">
                    <View className="w-1/4 h-full items-center justify-center border-r border-border">
                        <Pressable className="items-center justify-center">
                            <Ionicons name="chatbubble-ellipses-outline" size={22} color="black" />
                            <Text className="text-sm text-black mt-1">
                                Zalo
                            </Text>
                        </Pressable>
                    </View>
                    <View className="w-1/4 h-full items-center justify-center border-l border-border">
                        <Pressable className="items-center justify-center">
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={22}
                                color="#2baf90"
                            />
                            <Text className="text-sm text-[#2baf90] mt-1">
                                Chat
                            </Text>
                        </Pressable>
                    </View>


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

        </View>
    );
}
