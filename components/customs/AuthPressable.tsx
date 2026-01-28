import { tenantMyProfile } from "@/api/authTenantApi";
import { useAuthStore } from "@/store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ReactNode, useState } from "react";
import { Modal, Pressable, StyleProp, Text, useColorScheme, View, ViewStyle } from "react-native";

type Props = {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    onAuthorizedPress: () => void;
};

export default function AuthPressable({
    children,
    style,
    onAuthorizedPress,
}: Props) {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const colorScheme = useColorScheme();

    const {
        userID,
        setUserID,
        setRole,
        setUserName,
        setUrlImg,
        setPhone,
        setProvider,
        setCreated,
        reset,
    } = useAuthStore();

    const handlePress = async () => {
        try {
            if (userID) {
                onAuthorizedPress();
                return;
            }

            const token = await AsyncStorage.getItem("token");

            if (!token) {
                setShowModal(true);
                return;
            }

            const res = await tenantMyProfile();
            const profile = res.data || res;

            if (!profile?.id) {
                reset();
                setShowModal(true);
                return;
            }

            setUserID(profile.id);
            setRole(profile.role);
            setUserName(profile.username);
            setUrlImg(profile.picture);
            setPhone(profile.phone);
            setProvider(profile.provider);
            setCreated(profile.created_at);

            onAuthorizedPress();
        } catch {
            reset();
            setShowModal(true);
        }
    };

    const logoSource =
        colorScheme === "dark"
            ? require("@/assets/logo/dark-LogoWithWord-h.png")
            : require("@/assets/logo/light-LogoWithWord-h.png");


    return (
        <>
            <Pressable onPress={handlePress} style={style}>
                {children}
            </Pressable>

            <Modal visible={showModal} transparent animationType="fade">
                <View className="flex-1 bg-black/60 items-center justify-center px-6">
                    <View className="w-full max-w-md bg-background rounded-3xl p-4 items-center">

                        <View className="items-center justify-center mb-2">
                            <Image
                                source={logoSource}
                                style={{ width: 100, height: 100 }}
                                contentFit="contain"
                            />
                        </View>

                        <Text className="text-xl font-bold text-foreground mb-2 text-center">
                            Yêu cầu đăng nhập
                        </Text>

                        <Text className="text-muted-foreground text-center mb-4 leading-5">
                            Chức năng này chỉ dành cho người dùng đã đăng nhập.
                            Đăng nhập để trải nghiệm đầy đủ tiện ích của Tronect.
                        </Text>

                        <View className="flex-row gap-3 w-full">
                            <Pressable
                                onPress={() => setShowModal(false)}
                                className="flex-1 border border-muted-foreground rounded-xl py-2"
                            >
                                <Text className="text-center font-semibold text-foreground">
                                    Để sau
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    setShowModal(false);
                                    router.push("/tenant/login");
                                }}
                                className="flex-1 bg-[#2baf90] rounded-xl py-2"
                            >
                                <Text className="text-center font-semibold text-white">
                                    Đăng nhập ngay
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </>
    );
}
