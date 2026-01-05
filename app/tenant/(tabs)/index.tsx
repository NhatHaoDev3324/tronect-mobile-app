import Person from "@/assets/images/person.png";
import { DividerCustom } from "@/components/customs/DividerCustom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

export default function RealEstateHeroScreen() {
  const [tab, setTab] = useState<"room" | "roomShare">("room");
  const [keyword, setKeyword] = useState("");

  
  return (
    <ScrollView className="flex-">
      {/* HERO (cam bo đáy) */}
      <View className="bg-[#2baf90] px-6 pt-24 pb-44 rounded-b-[60px] overflow-hidden">
        <Text className="text-white text-3xl font-extrabold">Tronect</Text>
        <Text className="text-white/90 mt-2 text-base">
          Phòng thật - Giá thật - Ở an tâm.
        </Text>

        {/* Tabs */}
        <View className="mt-2 flex-row items-center">
          <Pressable
            onPress={() => setTab("room")}
            className={cn(
              "h-8 px-4 rounded-full items-center justify-center",
              tab === "room" ? "bg-white" : "bg-transparent"
            )}
          >
            <Text
              className={cn(
                "text-sm font-semibold",
                tab === "room" ? "text-[#2baf90]" : "text-white"
              )}
            >
              Phòng trọ
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTab("roomShare")}
            className={cn(
              "h-8 px-4 rounded-full items-center justify-center",
              tab === "roomShare" ? "bg-white" : "bg-transparent"
            )}
          >
            <Text
              className={cn(
                "text-sm font-semibold",
                tab === "roomShare" ? "text-[#2baf90]" : "text-white"
              )}
            >
              Phòng ghép
            </Text>
          </Pressable>
        </View>

        {/* (tuỳ) hình mascot bên phải */}
        <View className="absolute right-6 bottom-32">
          <View className="h-24 w-24 rounded-3xl bg-white/30 items-center justify-center">

          </View>
        </View>

        <View className="absolute right-2 bottom-32">
          <Image
            source={Person}
            style={{ width: 160, height: 160 }}
            contentFit="contain"
          />
        </View>
      </View>

      {/* Card nổi đè lên HERO */}
      <View className="-mt-32 px-4">
        <Card className="rounded-3xl bg-white p-4 shadow-sm border-transparent gap-4">
          {/* Khu vực */}
          <Pressable className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className=" h-8 w-8 rounded-2xl bg-[#2baf90]/20 items-center justify-center">
                <Ionicons name="location-outline" size={20} color="#2baf90" />
              </View>
              <Text className="text-base text-muted-foreground font-semibold">
                Khu vực:
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-[#2baf90]">
                Chọn khu vực
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </View>
          </Pressable>

          <DividerCustom />

          {/* Loại hình */}
          <Pressable className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 rounded-2xl bg-[#2baf90]/20 items-center justify-center">
                <Ionicons name="business-outline" size={20} color="#2baf90" />
              </View>
              <Text className="text-base text-muted-foreground font-semibold">
                Loại hình BDS:
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-extrabold text-foreground">
                Tất cả loại hình
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </View>
          </Pressable>

          <DividerCustom />

          {/* Search */}
          <View className="flex-row items-center gap-3">
            <View className="flex-1 relative">
              <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <Ionicons name="search" size={20} color="#9CA3AF" />
              </View>
              <Input
                value={keyword}
                onChangeText={setKeyword}
                placeholder="Tìm bất động sản..."
                className="pl-11 rounded-lg bg-muted dark:bg-gray-100 border-gray-200"
              />
            </View>

            <Button variant={"tronect"} className="rounded-lg">
              <Text className="text-white font-semibold text-base">Tìm phòng</Text>
            </Button>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
