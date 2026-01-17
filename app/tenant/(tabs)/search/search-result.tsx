import { SearchPost } from "@/api/postApi";
import Tag360 from "@/components/customs/Tag360";
import TagCheck from "@/components/customs/TagCheck";
import TagVip from "@/components/customs/TagVip";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PostInfoType } from "@/types/postInfoType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, type ViewProps } from "react-native";
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
    const {
        category,
        district,
        ward,
        priceMin,
        priceMax,
        areaMin,
        areaMax,
        features,
    } = useLocalSearchParams<{
        category?: string;
        district?: string;
        ward?: string;
        priceMin?: string;
        priceMax?: string;
        areaMin?: string;
        areaMax?: string;
        features?: string;
    }>();

    const [dataRoom, setDataRoom] = useState<PostInfoType[]>([]);
    const insets = useSafeAreaInsets();
    const featuresArray = features ? features.split(",") : [];
    const [keyword, setKeyword] = useState("");

    const fetchPostProposes = async () => {
        const responsePost = await SearchPost(category || "phong-tro-tphcm", district || "", ward || "", "suggestions", priceMin || "", priceMax || "", areaMin || "", areaMax || "", featuresArray);
        setDataRoom(responsePost.data);
    };

    useEffect(() => {
        fetchPostProposes();
    }, []);

    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="border-b border-border px-4">
                <View className="flex-row items-center mb-3">
                    <View className="flex-row items-center bg-white rounded-full px-4 h-10 flex-1">
                        <Ionicons name="search-outline" size={20} color="#6b7280" />
                        <TextInput
                            value={keyword}
                            onChangeText={setKeyword}
                            placeholder="Tìm theo tên phòng, khu vực..."
                            placeholderTextColor="#9ca3af"
                            className="ml-2 flex-1 text-base"
                            returnKeyType="search"
                            onSubmitEditing={() => {
                                console.log("Search keyword:", keyword);
                            }}
                        />
                    </View>
                </View>
            </View>
            <Pressable className="flex-row items-center justify-between border-b border-border px-4" onPress={() => router.push("/tenant/(tabs)/search")}>
                <View className="flex-row items-center bg-white rounded-full py-2 flex-1">
                    <Ionicons name="location" size={20} color="#2baf90" />
                    <Text className="ml-2 text-xs line-clamp-1 mr-10">Khu vực: {ward && `${ward},`} {district && `${district},`} TP. Hồ Chí Minh</Text>
                </View>
                <Ionicons name="funnel" size={18} color="#2baf90" />
            </Pressable>
            <ScrollView
                className="px-4 "
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <View className="flex-row flex-wrap justify-between gap-y-2 mt-4">
                    {dataRoom.map(item => (
                        <Pressable key={item.id} style={{ width: "49%" }}>
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
                                    <Text className="text-sm font-semibold line-clamp-2">
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
        </View>
    );
}
