import { tenantMyProfile } from "@/api/authTenantApi";
import { useAuthStore } from "@/store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function Index() {
    const router = useRouter();
    const setUserID = useAuthStore((s) => s.setUserID);
    const setRole = useAuthStore((s) => s.setRole);
    const setUserName = useAuthStore((s) => s.setUserName);
    const setUrlImg = useAuthStore((s) => s.setUrlImg);
    const setPhone = useAuthStore((s) => s.setPhone);
    const setProvider = useAuthStore((s) => s.setProvider);
    const setCreated = useAuthStore((s) => s.setCreated);
    const reset = useAuthStore((s) => s.reset);

    useEffect(() => {
        const init = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                if (token) {
                    const res = await tenantMyProfile();
                    const profile = res.data || res;
                    setUserID(profile.id);
                    setRole(profile.role);
                    setUserName(profile.username);
                    setUrlImg(profile.picture);
                    setPhone(profile.phone);
                    setProvider(profile.provider);
                    setCreated(profile.created_at);
                }
            } catch (err) {
                console.error("Auto-login failed:", err);
                reset();
                await AsyncStorage.removeItem("token");
            } finally {
                await SplashScreen.hideAsync();
                router.replace("/tenant");
            }
        };

        init();
    }, []);

    return null;
}
