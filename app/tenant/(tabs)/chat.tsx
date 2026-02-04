import { Ionicons } from "@expo/vector-icons";
import {
    RefreshControl,
    ScrollView,
    TextInput,
    View,
    type ViewProps
} from "react-native";


import noAvatar from "@/assets/images/noAvata.png";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";



export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};


export default function ChatScreen({ lightColor, darkColor }: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );
    const [keyword, setKeyword] = useState("");
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [chats, setChats] = useState<number[]>([]);
    const fetchChats = async () => {
        try {
            setLoading(true);


            await new Promise((resolve) => setTimeout(resolve, 800));

            setChats(Array.from({ length: 10 }, (_, i) => i));
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchChats();
        }, [])
    );

    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center border-b border-border px-4 py-3">
                <View className="flex-row items-center bg-white rounded-full px-4 h-10 flex-1">
                    <Ionicons name="search-outline" size={20} color="#6b7280" />
                    <TextInput
                        value={keyword}
                        onChangeText={setKeyword}
                        placeholder="Tìm kiếm người từng chat..."
                        placeholderTextColor="#9ca3af"
                        className="ml-2 flex-1 text-base"
                        returnKeyType="search"
                    />
                </View>

            </View>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchChats();
                        }}
                        tintColor="#2baf90"
                    />
                }
            >
                <View className="flex-1 flex-col px-2">
                    {chats.map((_, index) => (
                        <View key={index} className="flex-row items-center px-4 py-3 border-b border-border/60">
                            <Image
                                source={noAvatar}
                                style={{ width: 52, height: 52, borderRadius: 999 }}
                                contentFit="cover"
                            />
                            <View className="flex-row items-start ml-4 flex-1 justify-between">
                                <View className="flex-col">
                                    <Text className="text-lg font-bold text-foreground">Người dùng {index + 1}</Text>
                                    <Text className="text-muted-foreground">Tin nhắn {index + 1}</Text>
                                </View>
                                <View className="flex-col gap-1 justify-between items-end">
                                    <Text className="text-muted-foreground">12:34</Text>
                                    <View className="bg-red-600 rounded-full h-5 w-5 items-center justify-center">
                                        <Text className="text-white text-xs">{index + 1 >= 10 ? "9+" : index + 1}</Text>
                                    </View>
                                </View>

                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
