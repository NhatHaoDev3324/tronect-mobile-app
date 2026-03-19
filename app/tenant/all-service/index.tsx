import { getAllCategoryServices } from "@/api/categoryServicesApi";
import { LoadingData } from "@/components/customs/LoadingData";
import RequireAuthOnEnter from "@/components/customs/RequireAuthOnEnter";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ServiceType } from "@/types/serviceType";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const LS_KEY = "user_location_v1";

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

type StoredLocation = {
  lat: number;
  lng: number;
  province?: string;
  district?: string;
  ward?: string;
  address?: string;
  updatedAt: string;
};

export default function AllServicePage() {
  const backgroundColor = useThemeColor({}, "background");
  const insets = useSafeAreaInsets();

  const [services, setServices] = useState<ServiceType[]>([]);
  const [search, setSearch] = useState("");
  const [checkingLocation, setCheckingLocation] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingGeocode, setLoadingGeocode] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [address, setAddress] = useState("");
  const [stored, setStored] = useState<StoredLocation | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadLocation = async () => {
        try {
          setCheckingLocation(true);

          const raw = await AsyncStorage.getItem(LS_KEY);
          if (!isActive) return;

          if (raw) {
            setStored(JSON.parse(raw));
          } else {
            setStored(null);
            setShowDialog(true);
          }
        } finally {
          if (isActive) setCheckingLocation(false);
        }
      };

      loadLocation();

      return () => {
        isActive = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!stored) return;

    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await getAllCategoryServices();
        setServices(response);
      } catch {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể tải dữ liệu",
          position: "top",
        });
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [stored]);

  const geocodeByAddress = async (addr: string) => {
    const url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
      addr,
    )}&api_key=${process.env.EXPO_PUBLIC_GOONG_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") throw new Error("Không geocode được địa chỉ");

    const loc = data.results[0]?.geometry?.location;
    if (!loc) throw new Error("Thiếu lat/lng");

    return {
      lat: loc.lat,
      lng: loc.lng,
      province: data.results[0]?.compound.province,
      district: data.results[0]?.compound.district,
      ward: data.results[0]?.compound.commune,
      address: data.results[0]?.formatted_address ?? addr,
    };
  };

  const handleConfirm = async () => {
    if (!address.trim()) return;

    try {
      setLoadingGeocode(true);

      const {
        lat,
        lng,
        province,
        district,
        ward,
        address: formatted,
      } = await geocodeByAddress(address);

      const loc: StoredLocation = {
        lat,
        lng,
        province,
        district,
        ward,
        address: formatted,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(LS_KEY, JSON.stringify(loc));
      setStored(loc);
      setShowDialog(false);
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Có lỗi xảy ra");
    } finally {
      setLoadingGeocode(false);
    }
  };

  const resetLocation = async () => {
    await AsyncStorage.removeItem(LS_KEY);
    setStored(null);
    setAddress("");
    setShowDialog(true);
  };

  const filteredCategories = useMemo(() => {
    return services.filter((item) => {
      if (!search.trim()) return true;

      const keyword = normalizeText(search);

      const titleMatch = normalizeText(item.title).includes(keyword);

      const keySearchMatch =
        item.key_search?.some((key) => normalizeText(key).includes(keyword)) ??
        false;

      return titleMatch || keySearchMatch;
    });
  }, [search, services]);

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <View
        style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <Text className="text-xl font-semibold text-white">
          Dịch vụ tiện ích
        </Text>

        <Pressable onPress={resetLocation}>
          <Feather name="refresh-cw" size={22} color="white" />
        </Pressable>
      </View>

      {checkingLocation || loadingServices ? (
        <View className="flex-1 items-center justify-center">
          <LoadingData />
        </View>
      ) : stored ? (
        stored?.address ? (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            data={filteredCategories}
            numColumns={3}
            columnWrapperStyle={{ gap: 12 }}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <>
                <View className="bg-card rounded-xl px-4 py-3 mt-4 border border-border">
                  <Text className="text-base font-semibold text-foreground">
                    Vị trí đã lưu
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#6b7280"
                      style={{ marginTop: 2 }}
                    />
                    <Text
                      className="text-muted-foreground flex-1"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {stored.address}
                    </Text>
                  </View>
                </View>
                <View className="flex-col mt-2 mb-3">
                  <Text className="text-lg font-semibold text-foreground">
                    Dịch vụ tiện ích của Tronect
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Các dịch vụ tiện ích đã được Tronect xác thực thông tin.
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View className="flex-row items-center border border-border rounded-xl px-4">
                      <Ionicons name="search-outline" size={20} color="#6b7280" />
                      <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Tìm theo tên dịch vụ..."
                        placeholderTextColor="#9ca3af"
                        className="ml-2 flex-1 p-2 text-foreground"
                        returnKeyType="search"
                      />
                    </View>
                  </View>
                </View>
              </>
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              search.trim() !== "" ? (
                <View className="items-center justify-center py-10">
                  <Ionicons
                    name="search-outline"
                    size={52}
                    color="#9ca3af"
                  />
                  <Text className="mt-2 text-base font-semibold text-foreground">
                    Không tìm thấy kết quả phù hợp
                  </Text>
                  <Text className="mt-1 text-sm text-muted-foreground text-center px-6">
                    Không có danh mục dịch vụ nào phù hợp với từ khóa
                  </Text>
                </View>
              ) : (
                <View className="items-center justify-center py-10">
                  <Text className="text-muted-foreground">
                    Hiện chưa có danh mục dịch vụ nào
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <Pressable
                style={{ width: "31%" }}
                onPress={() =>
                  router.push({
                    pathname: `/tenant/all-service/service`,
                    params: {
                      title: item.title,
                      province: stored?.province,
                      district: stored?.district,
                      ward: stored?.ward,
                    },
                  })
                }
              >
                <Card className="overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0 rounded-md">
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: "100%", height: 60 }}
                    contentFit="cover"
                    contentPosition="center"
                  />
                </Card>
                <Text className="px-1 pt-1 text-xs font-semibold line-clamp-2 text-center text-foreground">
                  {item.title}
                </Text>
              </Pressable>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">Vị trí không hợp lệ</Text>
          </View>
        )
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Chưa có vị trí</Text>
        </View>
      )}

      <RequireAuthOnEnter enabled={true} />

      <Modal visible={showDialog} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="w-[85%] bg-white rounded-xl p-4">
            <Text className="text-lg font-bold">Nhập địa chỉ của bạn</Text>
            <Text className="text-gray-600 mb-2">
              Chúng tôi dùng vị trí để gợi ý dịch vụ, tiện ích gần bạn. Vui lòng
              nhập địa chỉ chính xác.
            </Text>

            <TextInput
              placeholder="Ví dụ: 110 Nguyễn Huệ, Bến Nghé..."
              value={address}
              onChangeText={setAddress}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
            />

            <View className="flex-row gap-2">
              <Pressable
                onPress={() => router.back()}
                style={{
                  width: "49%",
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: "white",
                }}
              >
                <Text
                  style={{
                    color: "#374151",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {" "}
                  Quay lại{" "}
                </Text>
              </Pressable>
              <Pressable
                style={{
                  width: "49%",
                  backgroundColor: address.trim() ? "#2baf90" : "#ccc",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
                onPress={handleConfirm}
                disabled={loadingGeocode}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  {loadingGeocode ? "Đang xử lý..." : "Xác nhận"}{" "}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
