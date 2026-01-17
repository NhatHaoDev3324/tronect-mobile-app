import { getPostBySlug, savePost } from "@/api/postApi";
import { getPostRoomSharingBySlug, savePostRoomSharing } from "@/api/postRoomShareApi";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";
import { PostInfoType } from "@/types/postInfoType";
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
        "background"
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

        // 🔥 1. OPTIMISTIC UPDATE (đổi tim NGAY)
        const prevData = data;
        setData(toggleSaveInPost(data));

        try {
            // 🔁 2. CALL API
            if (category === "phong-o-ghep-tphcm") {
                await savePostRoomSharing(slug);
            } else {
                await savePost(slug);
            }
        } catch (error) {
            // ❌ 3. ROLLBACK
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
                ? saved.filter(id => id !== userID)
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
                <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
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
                        name={data?.saved?.includes(userID || "") ? "heart" : "heart-outline"}
                        size={24}
                        color={data?.saved?.includes(userID || "") ? "red" : "white"}
                    />
                </Pressable>

            </View>

            <View>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => {
                        const index = Math.round(
                            e.nativeEvent.contentOffset.x / width
                        );
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

                <View className="flex-row justify-center mt-2">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <View
                            key={index}
                            style={{
                                width: index === activeIndex ? 8 : 6,
                                height: index === activeIndex ? 8 : 6,
                                borderRadius: 4,
                                backgroundColor:
                                    index === activeIndex
                                        ? "#2baf90"
                                        : "#d1d5db",
                                marginHorizontal: 4,
                            }}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}
