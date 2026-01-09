import Person from "@/assets/images/person.png";
import { DividerCustom } from "@/components/customs/DividerCustom";
import Tag360 from "@/components/customs/Tag360";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  useColorScheme,
  View,
} from "react-native";

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

const mockRooms = [
  {
    id: "1",
    title:
      "Cho thuê phòng đầy đủ nội thất, DT 25m2, giá 4tr/tháng, đường Hoàng Văn Thụ",
    price: "4.700.000",
    location: "Bình Thạnh",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop",
    picture_360: "https://example.com/360/room1",
    rating: 4.5,
    area: "20m²",
  },
  {
    id: "2",
    title:
      "BINGO có phòng cho thuê giá rẻ 18/5 Nguyễn Hới, Phường An Lạc, Quận Bình Tân.",
    price: "4.300.000",
    location: "Quận 1",
    image:
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=300&h=200&fit=crop",
    picture_360: null,
    rating: 4.8,
    area: "25m²",
  },
  {
    id: "3",
    title:
      "Phòng trọ dành cho sinh viên và nhân viên văn phòng - gần chợ trường đại học, siêu thị, Phòng ghép với toilet riêng",
    price: "1.800.000",
    location: "Tân Bình",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&h=200&fit=crop",
    picture_360: "https://example.com/360/room3",
    rating: 4.2,
    area: "15m²",
  },
  {
    id: "4",
    title: "Phòng mới xây thoáng đẹp tại 566/41 Nguyễn Thái Sơn p5 Gò Vấp",
    price: "3.500.000",
    location: "Phú Nhuận",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop",
    picture_360: null,
    rating: 4.7,
    area: "30m²",
  },
];

export default function RealEstateHeroScreen() {
  const [tab, setTab] = useState<"room" | "roomShare">("room");
  const [keyword, setKeyword] = useState("");
  const colorScheme = useColorScheme();

  // Location states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationStep, setLocationStep] = useState<"district" | "ward">(
    "district"
  );

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);

  const [provinceValue, setProvinceValue] = useState("79");
  const [districtValue, setDistrictValue] = useState("");
  const [wardValue, setWardValue] = useState("");

  const [provinceName, setProvinceName] = useState("TP.HCM");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const [loading, setLoading] = useState(false);

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

  // Fetch wards
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
        setWardValue("");
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
    setWardValue(item.value);
    setWardName(item.label);
    setShowLocationModal(false);
    setLocationStep("district");
  };

  const getDisplayText = () => {
    const roomType = tab === "room" ? "Phòng trọ" : "Phòng ghép";
    const parts: string[] = [roomType];

    if (wardName) {
      parts.push(`${wardName}, ${districtName}, ${provinceName}`);
    } else if (districtName) {
      parts.push(`${districtName}, ${provinceName}`);
    } else {
      parts.push(provinceName);
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

  return (
    <>
      <ScrollView className="flex-1 bg-background">
        {/* HERO (cam bo đáy) */}
        <View className="bg-[#2baf90] px-6 pt-20 pb-36 rounded-b-[60px] overflow-hidden">
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
                " h-8 px-4 rounded-full items-center justify-center",
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

        {/* Card nổi đè lên HERO */}
        <View className="-mt-24 px-4">
          <Card className="rounded-3xl bg-white p-4 shadow-sm border-transparent gap-4">
            <Pressable
              onPress={() => setShowLocationModal(true)}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <View className=" h-8 w-8 rounded-2xl bg-[#2baf90]/20 items-center justify-center">
                  <Ionicons name="location-outline" size={20} color="#2baf90" />
                </View>
                <Text className="text-sm text-muted-foreground font-semibold">
                  Khu vực:{" "}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 flex-1">
                <Text
                  className="text-sm font-bold text-[#2baf90] flex-1"
                  numberOfLines={1}
                >
                  {getDisplayText()}
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
                  placeholder="Tìm phòng trọ..."
                  className="pl-11 rounded-lg bg-muted text-black dark:text-black dark:bg-gray-100 border-gray-200"
                />
              </View>

              <Button
                variant={"tronect"}
                className="rounded-lg"
                onPress={() => {
                  setKeyword("");
                  setDistrictValue("");
                  setWardValue("");
                  setDistrictName("");
                  setWardName("");
                }}
              >
                <Text className="text-white font-semibold text-base">Tìm</Text>
              </Button>
            </View>
          </Card>
        </View>

        <View className="px-6">
          <Text className="mt-4 mb-2 text-lg font-bold">Đề xuất cho bạn</Text>
          <View>
            <FlatList
              data={mockRooms}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              contentContainerStyle={{ gap: 12 }}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable className="flex-1">
                  <Card className="overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0">
                    <View style={{ position: "relative" }}>
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: "100%", height: 120 }}
                        contentFit="cover"
                      />
                      <View style={{ position: "absolute", top: 8, right: 8 }}>
                        <Tag360 picture_360={item.picture_360} onPress={() => {
                          // TODO: open 360 viewer or modal
                          console.log("Open 360 for", item.id);
                        }} />
                      </View>
                    </View>
                    <View className="p-2">
                      <Text className="text-sm font-semibold line-clamp-2">
                        {item.title}</Text>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1">
                          <Text className="text-red-500 font-bold text-sm">
                            {item.price} đ
                          </Text>
                          <Text className="text-xs font-semibold">
                            {" • "} {item.area}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color="#ef4444"
                        />
                        <Text className="text-xs text-muted-foreground">
                          {item.location}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              )}
            />
          </View>
        </View>
      </ScrollView>

      {/* LOCATION MODAL */}
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
          {/* Header */}
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

          {/* List */}
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

          {/* Close Button */}
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
                paddingVertical: 12,
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
