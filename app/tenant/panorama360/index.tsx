import { LoadingData } from "@/components/customs/LoadingData";
import { Panorama360View } from "@/components/customs/Panorama360Screen";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

export default function Panorama360Screen() {
    const params = useLocalSearchParams<{ imageUrl?: string }>();
    const insets = useSafeAreaInsets();
    const [loadingPanorama, setLoadingPanorama] = useState(true);

    const imageUrl = params.imageUrl
        ? decodeURIComponent(params.imageUrl).replace(/^"+|"+$/g, "")
        : null;

    if (!imageUrl) return null;

    let isTour360 = false;
    let isPicture360 = false;

    try {
        const urlObj = new URL(imageUrl);
        const hostname = urlObj.hostname;

        if (hostname.includes("panoee")) {
            isTour360 = true;
        } else if (hostname.includes("cloudinary")) {
            isPicture360 = true;
        } else {
            return null;
        }
    } catch {
        return null;
    }

    return (
        <View className="flex-1 bg-black">
            <LinearGradient
                colors={["#3b82f6", "#7c3aed", "#a78bfa"]}
                start={[0, 0]}
                end={[1, 1]}
                style={{
                    paddingTop: insets.top + 12,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 28,
                    paddingVertical: 12,
                    zIndex: 10,
                }}
            >
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>

                <Text className="ml-4 text-xl font-semibold text-white">
                    Xem phòng 360 {isTour360 && "Tour"}
                </Text>
            </LinearGradient>

            <View className="flex-1">
                {isPicture360 && (
                    <>
                        <Panorama360View
                            imageUrl={imageUrl}
                            onLoad={() => setLoadingPanorama(false)}
                        />
                        {loadingPanorama && (
                            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
                                <LoadingData />
                            </View>
                        )}
                    </>
                )}

                {isTour360 && (
                    <WebView
                        source={{ uri: imageUrl }}
                        style={{ flex: 1 }}
                        javaScriptEnabled
                        domStorageEnabled
                        allowsFullscreenVideo
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
                                <LoadingData />
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
}
