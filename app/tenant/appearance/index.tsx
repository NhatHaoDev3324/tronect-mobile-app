import { Text } from "@/components/ui/text";
import { useThemeStore } from "@/store/useThemeStore";

import { Image } from "expo-image";
import { Pressable, ScrollView, View, type ViewProps } from "react-native";

import darkPreview from "@/assets/images/themes/dark.png";
import lightPreview from "@/assets/images/themes/light.png";
import systemPreview from "@/assets/images/themes/system.png";
import { useThemeColor } from "@/hooks/use-theme-color";

const THEMES = [
    {
        key: "light",
        title: "Giao diện sáng",
        desc: "Dễ nhìn ban ngày",
        img: lightPreview,
    },
    {
        key: "dark",
        title: "Giao diện tối",
        desc: "Dịu mắt ban đêm",
        img: darkPreview,
    },
    {
        key: "system",
        title: "Giao diện hệ thống",
        desc: "Cài đặt thiết bị",
        img: systemPreview,
    },
] as const;

type ThemeKey = (typeof THEMES)[number]["key"];

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function Appearance({ lightColor, darkColor }: ThemedViewProps) {
    const { mode, setMode } = useThemeStore();
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );
    return (
        <ScrollView className="flex-1 p-5" style={{ backgroundColor }}>
            <View className="mt-2 flex-row flex-wrap -mx-2">
                {THEMES.map((t) => {
                    const selected = mode === t.key;

                    return (
                        <View key={t.key} className="w-1/2 px-2 mb-4">
                            <Pressable
                                onPress={() => setMode(t.key as ThemeKey)}
                                className={[
                                    "rounded-xl border overflow-hidden",
                                    selected
                                        ? "border-[#2baf90] border-2 "
                                        : "border-border bg-card",
                                ].join(" ")}
                            >
                                <View className="w-full">
                                    <Image
                                        source={t.img}
                                        style={{ width: "100%", height: 104 }}
                                        contentFit="cover"
                                    />
                                </View>

                                <View className="px-3 py-3 flex-row items-center">
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold">{t.title}</Text>
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            {t.desc}
                                        </Text>
                                    </View>

                                    <View
                                        className={[
                                            "h-5 w-5 rounded-full border items-center justify-center",
                                            selected
                                                ? "border-primary"
                                                : "border-muted-foreground/40",
                                        ].join(" ")}
                                    >
                                        {selected && (
                                            <View className="h-3 w-3 rounded-full bg-primary" />
                                        )}
                                    </View>
                                </View>
                            </Pressable>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}
