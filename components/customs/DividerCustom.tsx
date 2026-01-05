import { useThemeColor } from "@/hooks/use-theme-color";
import { View } from "react-native";

export function DividerCustom() {
  const borderColor = useThemeColor(
    { light: "#E5E7EB", dark: "#E5E7EB" },
    "border"
  );

  return (
    <View
      style={{
        height: 1,
        backgroundColor: borderColor,
        marginHorizontal: 16,
      }}
    />
  );
}
