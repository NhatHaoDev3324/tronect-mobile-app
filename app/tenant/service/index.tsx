import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ServicePage() {
    const backgroundColor = useThemeColor({}, "background");
    const insets = useSafeAreaInsets();

    const [showDialog, setShowDialog] = useState(true);
    const [address, setAddress] = useState('');

    const handleConfirm = () => {
        if (!address.trim()) return;
        setShowDialog(false);
    };

    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View
                style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }}
                className="flex-row items-center justify-between px-4 py-3"
            >
                <Pressable
                    onPress={() => router.back()}
                    style={{ paddingHorizontal: 12 }}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>

                <Text className="text-xl font-semibold text-white">
                    Dịch vụ tiện ích
                </Text>

                <View style={{ width: 36 }} />
            </View>

            <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">
                    Nội dung dịch vụ
                </Text>
            </View>

            <Modal
                visible={showDialog}
                transparent
                animationType="fade"
                statusBarTranslucent
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <View
                        style={{
                            width: '85%',
                            backgroundColor: 'white',
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                marginBottom: 8,
                            }}
                        >
                            Nhập địa chỉ
                        </Text>

                        <Text
                            style={{
                                color: '#555',
                                marginBottom: 12,
                            }}
                        >
                            Vui lòng nhập địa chỉ để xác định vị trí của bạn
                        </Text>

                        <TextInput
                            placeholder="Ví dụ: Quận 1, TP.HCM"
                            value={address}
                            onChangeText={setAddress}
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 8,
                                padding: 20,
                                marginBottom: 16,
                            }}
                        />

                        <View className="flex-row gap-2">
                            <Pressable
                                onPress={() => router.back()}
                                style={{
                                    width: '50%',
                                    borderWidth: 1,
                                    borderColor: '#d1d5db',
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    backgroundColor: 'white',
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#374151',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                    }}
                                >
                                    Quay lại
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleConfirm}
                                disabled={!address.trim()}
                                style={{
                                    width: '50%',
                                    backgroundColor: address.trim()
                                        ? '#2baf90'
                                        : '#ccc',
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'white',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Xác nhận
                                </Text>
                            </Pressable>
                        </View>

                    </View>
                </View>
            </Modal>
        </View>
    );
}
