import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  View,
  type ViewProps
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";

import { areaRanges, options, priceRanges } from "@/utils/dataitem";

/* ---------- TYPES ---------- */
type Option = {
  value: string;
  label: string;
  codename: string;
};

type ProvinceAPI = {
  name: string;
  code: number;
  codename: string;
};

type DistrictAPI = {
  name: string;
  code: number;
  codename: string;
};

type WardAPI = {
  name: string;
  code: number;
  codename: string;
};

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

/* ---------- CONSTANT ---------- */
const categories = [
  { id: "phong-tro-tphcm", label: "Phòng trọ", icon: "home-outline" },
  { id: "phong-o-ghep-tphcm", label: "Phòng ở ghép", icon: "home-outline" },
  { id: "chung-cu-tphcm", label: "Chung cư", icon: "business-outline" },
  { id: "can-ho-tphcm", label: "Căn hộ", icon: "school-outline" },
  { id: "ky-tuc-xa-tphcm", label: "Ký túc xá", icon: "people-outline" },
];

export default function SearchScreen({
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  /* ---------- STATE ---------- */
  const [category, setCategory] = useState(categories[0].id);

  const [provinceValue] = useState("79"); // HCM cố định
  const [districtValue, setDistrictValue] = useState("");
  const [wardValue, setWardValue] = useState("");

  const [districts, setDistricts] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);

  const [price, setPrice] = useState(priceRanges[0]);
  const [area, setArea] = useState(areaRanges[0]);

  const [features, setFeatures] = useState<string[]>([]);

  /* ---------- FETCH LOCATION ---------- */
  useEffect(() => {
    fetch(`https://provinces.open-api.vn/api/p/79?depth=2`)
      .then(res => res.json())
      .then(data => {
        setDistricts(
          data.districts.map((d: DistrictAPI) => ({
            value: String(d.code),
            label: d.name,
            codename: d.codename,
          }))
        );
      });
  }, []);

  useEffect(() => {
    if (!districtValue) return;
    fetch(`https://provinces.open-api.vn/api/d/${districtValue}?depth=2`)
      .then(res => res.json())
      .then(data => {
        setWards(
          data.wards.map((w: WardAPI) => ({
            value: String(w.code),
            label: w.name,
            codename: w.codename,
          }))
        );
      });
  }, [districtValue]);

  /* ---------- HANDLERS ---------- */
  const toggleFeature = (value: string) => {
    setFeatures(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const applySearch = () => {
    const params = new URLSearchParams();

    params.set("gia_tu", String(price.min));
    if (price.max !== Infinity) params.set("gia_den", String(price.max));

    params.set("dien_tich_tu", String(area.min));
    if (area.max !== Infinity) params.set("dien_tich_den", String(area.max));

    features.forEach((f, i) => params.set(`features[${i}]`, f));

    const districtSlug = districts.find(d => d.value === districtValue)?.codename || "";
    const wardSlug = wards.find(w => w.value === wardValue)?.codename || "";

    // router.push(`/lease/${category}/${districtSlug}/${wardSlug}?${params.toString()}`);
  };

  /* ---------- UI ---------- */
  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* CATEGORY */}
        <ThemedView className="px-4 my-4">
          <Text className="font-semibold mb-2">Danh mục</Text>
          <View className="grid grid-cols-2 gap-3">
            <FlatList
              data={categories}
              numColumns={3}
              columnWrapperStyle={{ gap: 12 }}
              contentContainerStyle={{ gap: 12 }}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable style={{ width: "31%" }} key={item.id}
                  onPress={() => setCategory(item.id)}
                  className={`items-center py-3 rounded-xl border ${category === item.id
                    ? "border-[#2baf90] bg-[#2baf90]/10"
                    : "border-border"
                    }`}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={category === item.id ? "#2baf90" : "#6b7280"}
                  />
                  <Text className="text-sm mt-1">{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </ThemedView>

        {/* LOCATION */}
        <ThemedView className="px-4 mb-4">
          <Text className="font-semibold mb-2">Khu vực</Text>

          <Pressable
            className="border rounded-lg px-4 py-3 mb-2"
            onPress={() => { }}
          >
            <Text>{districtValue ? districts.find(d => d.value === districtValue)?.label : "Chọn Quận/Huyện"}</Text>
          </Pressable>

          <Pressable
            className="border rounded-lg px-4 py-3"
            onPress={() => { }}
            disabled={!districtValue}
          >
            <Text>{wardValue ? wards.find(w => w.value === wardValue)?.label : "Chọn Phường/Xã"}</Text>
          </Pressable>
        </ThemedView>

        {/* PRICE */}
        <ThemedView className="px-4 mb-4">
          <Text className="font-semibold mb-2">Giá</Text>
          <View className="flex-row flex-wrap gap-2">
            {priceRanges.map(p => (
              <Pressable
                key={p.title}
                onPress={() => setPrice(p)}
                className={`px-4 py-2 rounded-lg border ${price.title === p.title
                  ? "border-[#2baf90] bg-[#2baf90]/10"
                  : "border-border"
                  }`}
              >
                <Text>{p.title}</Text>
              </Pressable>
            ))}
          </View>
        </ThemedView>

        {/* AREA */}
        <ThemedView className="px-4 mb-4">
          <Text className="font-semibold mb-2">Diện tích</Text>
          <View className="flex-row flex-wrap gap-2">
            {areaRanges.map(a => (
              <Pressable
                key={a.title}
                onPress={() => setArea(a)}
                className={`px-4 py-2 rounded-lg border ${area.title === a.title
                  ? "border-[#2baf90] bg-[#2baf90]/10"
                  : "border-border"
                  }`}
              >
                <Text>{a.title}</Text>
              </Pressable>
            ))}
          </View>
        </ThemedView>

        {/* FEATURES */}
        <ThemedView className="px-4 mb-4">
          <Text className="font-semibold mb-2">Đặc điểm nổi bật</Text>
          <View className="flex-row flex-wrap gap-2">
            {options.map(o => (
              <Pressable
                key={o.value}
                onPress={() => toggleFeature(o.value)}
                className={`px-3 py-2 rounded-lg border ${features.includes(o.value)
                  ? "border-[#2baf90] bg-[#2baf90]/10"
                  : "border-border"
                  }`}
              >
                <Text className="text-sm">{o.title}</Text>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-border bg-background">
        <Button onPress={applySearch} variant={"tronect"} size={"sm"}>
          <Text className="text-white">Áp dụng tìm kiếm</Text>
        </Button>
      </View>
    </View>
  );
}
