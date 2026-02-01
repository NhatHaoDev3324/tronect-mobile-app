import { getPostsRoomSharingByTenantId } from "@/api/postRoomShareApi";
import { LoadingData } from "@/components/customs/LoadingData";
import { Tag360 } from "@/components/customs/Tag360";
import { TagCheck } from "@/components/customs/TagCheck";
import { TagVip } from "@/components/customs/TagVip";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PostInfoType } from "@/types/postInfoType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function SearchResultScreen({
    lightColor,
    darkColor,
}: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );

    // const { userID } = useAuthStore();
    const [dataRoom, setDataRoom] = useState<PostInfoType[]>([]);

    const [loading, setLoading] = useState(true);

    const insets = useSafeAreaInsets();


    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getPostsRoomSharingByTenantId();
            setDataRoom(res || []);
        } catch (error) {
            console.log(error);
            router.replace("/tenant/(tabs)");
        } finally {
            setLoading(false);
        }
    }, []);



    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [fetchPosts])
    );

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/tenant/(tabs)");
        }
    };


    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Pressable
                        onPress={() => handleBack()}
                        style={{ paddingHorizontal: 12 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-xl font-semibold text-white">Quản lý bài đăng</Text>
                    <Pressable onPress={() => router.push("/tenant/(tabs)/post")}>
                        <Ionicons name="add" size={24} color="white" />
                    </Pressable>
                </View>
            </View>
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <LoadingData />
                </View>
            ) : (
                <ScrollView
                    className="px-4 "
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                >
                    <View className="flex-row flex-wrap justify-between gap-y-2 mt-4">
                        {dataRoom.map(item => (
                            <Pressable key={item.id} style={{ width: "49%" }} onPress={() => router.push({ pathname: "/tenant/post-detail", params: { slug: item.slug, category: item.category || "", }, })}>
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

                                        <View
                                            style={{
                                                position: "absolute",
                                                bottom: 8,
                                                right: 8,
                                                flexDirection: "row",
                                                gap: 2,
                                            }}
                                        >
                                            <TagVip postType={item.post_type} />
                                            <Tag360 picture_360={item.picture_360} />
                                        </View>
                                    </View>

                                    <View className="p-2">
                                        <Text className="text-sm text-foreground font-semibold line-clamp-2">
                                            {item.title}
                                        </Text>

                                        <View className="flex-row items-center gap-1 mt-1">
                                            <Text className="text-red-500 font-bold text-sm">
                                                {item.price.toLocaleString()} đ
                                            </Text>
                                            <Text className="text-xs font-semibold">
                                                • {item.acreage} m²
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center gap-1 mt-1">
                                            <Ionicons name="location-outline" size={14} color="gray" />
                                            <Text className="text-xs text-muted-foreground">
                                                {item.district}
                                            </Text>
                                        </View>
                                    </View>
                                </Card>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
