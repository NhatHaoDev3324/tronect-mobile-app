import { updatePaymentStatusByOrderCode, updatePaymentStatusByOrderCodeAndPost } from "@/api/paymentApi";
import { LoadingData } from "@/components/customs/LoadingData";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";
import { WebView } from "react-native-webview";


export function parsePaymentReturnUrl(url: string) {
    try {
        const u = new URL(url)

        const params = u.searchParams

        return {
            status: params.get("status"),
            tempPostId: params.get("tempPostId"),
            expiry: params.get("expiry"),
            postType: params.get("postType"),
            orderCode: params.get("orderCode"),
            postId: params.get("postId"),
        }
    } catch (err) {
        console.error("URL không hợp lệ", err)
        return null
    }
}

export default function PaymentScreen() {
    const { checkoutUrl, qrCode, orderCode } = useLocalSearchParams<{
        checkoutUrl: string;
        qrCode: string;
        orderCode: string;
    }>();
    const webRef = useRef<WebView>(null);
    const qrRef = useRef<ViewShot>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const insets = useSafeAreaInsets();

    const handleNavChange = (navState: any) => {
        const url = navState.url;
        // Thành công
        if (url.includes("/landlord/success")) {

            const result = parsePaymentReturnUrl(url)
            if (!result?.orderCode) {
                return;
            }

            if (result.postId && result.expiry && result.postType) {
                updatePaymentStatusByOrderCodeAndPost(
                    Number(result.orderCode),
                    "success",
                    result.expiry,
                    result.postType,
                    result.postId
                ).then(() => {
                    Toast.show({
                        type: "success",
                        text1: "Gia hạn tin đăng thành công",
                        text2: "Tin đăng của bạn đã gia hạn thành công",
                    });
                }).finally(() => {
                    router.replace({
                        pathname: "/tenant/manage-posts",
                        params: {
                            pathnameBack: "/tenant/account"
                        }
                    });
                });
                return;
            }
            if (result.expiry && result.postType) {
                updatePaymentStatusByOrderCode(Number(result.orderCode), "success", result.expiry || "0", result.postType || "normal")
                    .then(() => {
                        Toast.show({
                            type: "success",
                            text1: "Đăng tin thành công",
                            text2: "Tin đăng của bạn đã được hiển thị ở Tronect",
                        });
                    }).finally(() => {
                        router.replace({
                            pathname: "/tenant/manage-posts",
                            params: {
                                pathnameBack: "/tenant/(tabs)"
                            }
                        });
                    });
                return;
            }

        }

        // Thất bại
        if (url.includes("/landlord/cancel")) {

            const result = parsePaymentReturnUrl(url)
            if (!result?.orderCode) {
                return;
            }

            updatePaymentStatusByOrderCode(Number(result.orderCode), "canceled", "", "")
                .then(() => {
                    Toast.show({
                        type: "error",
                        text1: "Đăng tin thất bại",
                        text2: "Tin đăng của bạn chưa được hiển thị ở Tronect",
                    });
                })
                .finally(() => {
                    router.replace({
                        pathname: "/landlord/payments",
                        params: {
                            pathnameBack: "/tenant/(tabs)"
                        }
                    });
                });
            return;
        }
    };

    const handleError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.error("WebView error:", nativeEvent);
        Toast.show({
            type: "error",
            text1: "Lỗi tải trang thanh toán",
            text2: nativeEvent.description || "Vui lòng thử lại",
        });
    };

    const saveQRCode = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();

            if (status !== 'granted') {
                Toast.show({
                    type: "error",
                    text1: "Cần quyền truy cập thư viện ảnh",
                    text2: "Vui lòng cấp quyền trong cài đặt",
                });
                return;
            }

            if (qrRef.current && qrRef.current.capture) {
                const uri = await qrRef.current.capture();

                const asset = await MediaLibrary.createAssetAsync(uri);
                await MediaLibrary.createAlbumAsync("Tronect", asset, false);

                Toast.show({
                    type: "success",
                    text1: "Đã lưu mã QR",
                    text2: "Mã QR đã được lưu vào thư viện ảnh",
                });
            }
        } catch (error) {
            console.error("Save QR error:", error);
            Toast.show({
                type: "error",
                text1: "Không thể lưu mã QR",
                text2: "Vui lòng thử lại",
            });
        } finally {
            setShowQRModal(false);
        }
    };

    if (!checkoutUrl) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Không tìm thấy URL thanh toán</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                        onPress={() => router.back()}
                        style={{ paddingHorizontal: 12 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-xl font-bold text-white">Thanh toán</Text>
                </View>
            </View>
            <WebView
                ref={webRef}
                source={{ uri: checkoutUrl }}
                onNavigationStateChange={handleNavChange}
                onError={handleError}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                onLoadEnd={() => console.log("WebView load ended")}
                renderLoading={() => <LoadingData />}
                mixedContentMode="compatibility"
                allowsBackForwardNavigationGestures={true}
                sharedCookiesEnabled={true}
                thirdPartyCookiesEnabled={true}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView HTTP error:', nativeEvent.statusCode);
                }}
                onLoadStart={() => {
                    console.log("WebView load started");
                }}
                style={{ marginBottom: insets.bottom + 64 }}
            />


            {qrCode && (
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingBottom: insets.bottom,
                }} className="bg-white border-t border-gray-200 p-4">
                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={() => router.back()}
                            style={{ flex: 1 }}
                            className="flex-row items-center justify-center bg-gray-300 border border-gray-200 rounded-lg p-2"
                        >
                            <Ionicons name="arrow-back-outline" size={20} color="black" />
                            <Text className="text-black font-bold ml-2">Quay lại</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setShowQRModal(true)}
                            style={{ flex: 1 }}
                            className="flex-row items-center justify-center bg-[#2baf90] rounded-lg p-3"
                        >
                            <Ionicons name="qr-code-outline" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Lưu mã QR</Text>
                        </Pressable>


                    </View>
                </View>
            )}

            <Modal
                visible={showQRModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowQRModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Mã QR thanh toán</Text>
                            <Pressable onPress={() => setShowQRModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </Pressable>
                        </View>

                        <ViewShot ref={qrRef} style={styles.qrContainer}>
                            <View style={styles.qrWrapper}>
                                <View style={styles.qrCodeContainer}>
                                    {qrCode && (
                                        <QRCode
                                            value={qrCode}
                                            size={250}
                                            backgroundColor="white"
                                            color="black"
                                        />
                                    )}
                                    <View style={styles.logoOverlay}>
                                        <Image
                                            source={require("@/assets/logo/light-LogoWithWord-h.png")}
                                            style={{ height: 50, width: 50 }}
                                            contentFit="contain"
                                        />
                                    </View>
                                </View>
                                <Text style={styles.orderCodeText}>
                                    Mã đơn hàng: {orderCode}
                                </Text>
                            </View>
                        </ViewShot>

                        <Pressable
                            style={styles.saveButton}
                            onPress={saveQRCode}
                        >
                            <Ionicons name="download-outline" size={20} color="white" />
                            <Text style={styles.saveButtonText}>Lưu vào thư viện</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    qrContainer: {
        position: 'relative',
        backgroundColor: 'white',
        padding: 20,
    },
    qrWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrCodeContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -38 }, { translateY: -25 }],
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 4,
    },
    orderCodeText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#2baf90',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 8,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
