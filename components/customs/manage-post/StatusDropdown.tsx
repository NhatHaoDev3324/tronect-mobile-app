import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface StatusDropdownProps {
    data: { label: string; value: string }[];
    value: string;
    onChange: (label: string, value: string) => void;
}

export default function StatusDropdown({
    data,
    value,
    onChange,
}: StatusDropdownProps) {
    return (
        <Dropdown
            style={{
                height: 32,
                borderColor: "#e5e7eb",
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 8,
                backgroundColor: "white",
            }}
            placeholderStyle={{ fontSize: 14, color: "#9ca3af" }}
            selectedTextStyle={{ fontSize: 14 }}
            data={data}
            labelField="label"
            valueField="value"
            placeholder="Chọn trạng thái"
            value={value}
            onChange={(item) => onChange(item.label, item.value)}
            renderItem={(item) => {
                const isSelected = item.value === value;

                return (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: 8,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                            }}
                        >
                            {item.label}
                        </Text>

                        {isSelected && (
                            <Ionicons name="checkmark" size={18} color="#2baf90" />
                        )}
                    </View>
                );
            }}
        />
    );
}
