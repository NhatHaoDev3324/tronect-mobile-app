import { getPostBySlug, savePost } from "@/api/postApi";
import {
    getPostRoomSharingBySlug,
    savePostRoomSharing,
} from "@/api/postRoomShareApi";
import { createReport } from "@/api/reportApi";

import { Button360 } from "@/components/customs/Button360";
import { DividerCustom } from "@/components/customs/DividerCustom";
import RequireAuthOnEnter from "@/components/customs/RequireAuthOnEnter";
import RoomOrder from "@/components/customs/RoomOrder";
import RoomSameArea from "@/components/customs/RoomSameArea";
import { TagCheck } from "@/components/customs/TagCheck";
import { TagVip } from "@/components/customs/TagVip";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";
import { PostInfoType } from "@/types/postInfoType";
import { options, reasons } from "@/utils/dataitem";
import { getNameRole } from "@/utils/getNameRole";
import { getRoomName } from "@/utils/getRoomName";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    type ViewProps
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import ImageZoom from 'react-native-image-pan-zoom';
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function PostDetailScreen({
    lightColor,
    darkColor,
}: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background",
    );
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [otherReason, setOtherReason] = useState('');
    const [description, setDescription] = useState('');


    const { slug, category } = useLocalSearchParams<{
        slug: string;
        category: string;
    }>();
    const { userID, userName, phone } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PostInfoType>();
    const [activeIndex, setActiveIndex] = useState(0);

    const { width } = Dimensions.get("window");
    const insets = useSafeAreaInsets();
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewData, setPreviewData] = useState<{
        type: 'image' | 'video';
        uri: string;
    } | null>(null);

    const images = data?.images ?? [];
    const hasVideo = Boolean(data?.video);
    const imageSlides = hasVideo ? images : images.slice(1);
    const totalSlides = hasVideo ? images.length + 1 : images.length;

    useEffect(() => {
        if (!slug) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                let responsePost: any;
                if (category === "phong-o-ghep-tphcm") {
                    responsePost = await getPostRoomSharingBySlug(slug);
                } else {
                    responsePost = await getPostBySlug(slug);
                }
                setData(responsePost);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const handleSavePost = async (slug: string, category: string) => {
        if (!userID || !data) {
            Toast.show({
                type: "error",
                text1: "Bạn chưa đăng nhập",
                text2: "Vui lòng đăng nhập để lưu bài viết",
            });
            return;
        }

        const prevData = data;
        setData(toggleSaveInPost(data));

        try {
            if (category === "phong-o-ghep-tphcm") {
                await savePostRoomSharing(slug);
            } else {
                await savePost(slug);
            }
        } catch {
            setData(prevData);

            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể lưu bài viết",
            });
        }
    };

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
            />
        ),
        []
    );
    const handleSubmit = async () => {
        if (!selectedReason) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng chọn lý do phản ánh',
            });
            return;
        }



        try {
            await createReport(data?.id!, userName, phone, selectedReason === "Lý do khác" ? otherReason ? otherReason : "Lý do khác" : selectedReason, description);
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Gửi phản ánh thành công',
            });

            setSelectedReason(null);
            setOtherReason("");
            setDescription("");
            bottomSheetRef.current?.close();
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Gửi phản ánh thất bại',
            });
        }
    };

    const toggleSaveInPost = (post: PostInfoType) => {
        const saved = Array.isArray(post.saved) ? post.saved : [];
        const hasSaved = saved.includes(userID!);

        return {
            ...post,
            saved: hasSaved
                ? saved.filter((id) => id !== userID)
                : [...saved, userID!],
        };
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <RequireAuthOnEnter enabled={true} />
            <View
                style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }}
                className="flex-row items-center justify-between border-b border-border px-4 py-3"
            >
                <Pressable
                    onPress={() => router.back()}
                    style={{ paddingHorizontal: 12 }}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>

                <Text className="text-xl font-semibold text-white">
                    {getRoomName(category)}
                </Text>
                <Pressable
                    hitSlop={10}
                    onPress={() => handleSavePost(data!.slug, data!.category)}
                >
                    <Ionicons
                        name={
                            data?.saved?.includes(userID || "") ? "heart" : "heart-outline"
                        }
                        size={24}
                        color={data?.saved?.includes(userID || "") ? "red" : "white"}
                    />
                </Pressable>
            </View>

            <ScrollView>
                <View style={{ position: "relative" }}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        <View style={{ width, height: 260 }}>
                            {hasVideo ? (
                                <Pressable
                                    style={{ width, height: 260 }}
                                    onPress={() => {
                                        setPreviewData({ type: 'video', uri: data!.video });
                                        setPreviewVisible(true);
                                    }}
                                >
                                    <Video
                                        source={{ uri: data!.video }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode={ResizeMode.COVER}
                                        shouldPlay={activeIndex === 0}
                                        isLooping
                                    />
                                </Pressable>

                            ) : (
                                images[0] && (
                                    <Pressable
                                        key={`${images[0]}`}
                                        onPress={() => {
                                            setPreviewData({ type: 'image', uri: images[0] });
                                            setPreviewVisible(true);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: images[0] }}
                                            style={{ width: "100%", height: "100%" }}
                                            contentFit="cover"
                                        />
                                    </Pressable>

                                )
                            )}
                        </View>

                        {imageSlides.map((img, index) => (
                            <Pressable
                                key={`${img}-${index}`}
                                onPress={() => {
                                    setPreviewData({ type: 'image', uri: img });
                                    setPreviewVisible(true);
                                }}
                            >
                                <Image
                                    source={{ uri: img }}
                                    style={{ width, height: 260 }}
                                    contentFit="cover"
                                />
                            </Pressable>
                        ))}

                    </ScrollView>

                    <View
                        style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 12,
                        }}
                    >
                        <Text className="text-white text-xs font-medium">
                            {activeIndex + 1}/{totalSlides}
                        </Text>
                    </View>

                    <View
                        style={{
                            position: "absolute",
                            bottom: 12,
                            right: 12,
                        }}
                    >
                        <Button360 picture_360={data?.picture_360} onPress={() => router.push({
                            pathname: "/tenant/panorama360",
                            params: { imageUrl: data?.picture_360 },
                        })} />
                    </View>
                </View>
                <View className="px-4 flex-row gap-2 justify-between mt-2" >
                    <View className="flex-row justify-center mt-2" >
                        {Array.from({ length: totalSlides }).map((_, index) => (
                            <View
                                key={index}
                                style={{
                                    width: index === activeIndex ? 8 : 6,
                                    height: index === activeIndex ? 8 : 6,
                                    borderRadius: 4,
                                    backgroundColor: index === activeIndex ? "#2baf90" : "#d1d5db",
                                    marginHorizontal: 4,
                                }}
                            />
                        ))}
                    </View>
                    <View className="flex-row gap-2">
                        <TagVip postType={data?.post_type} />
                        <TagCheck verification_status={data?.verification_status ?? "unverified"} />
                    </View>
                </View>

                <View className="px-4 py-2 flex-col gap-2">
                    <Text
                        className="text-xl font-bold leading-6 text-foreground"
                        numberOfLines={2}
                    >
                        {data?.title}
                    </Text>

                    <View className="flex-row items-center flex-wrap gap-x-3">
                        <Text className="text-red-500 text-base font-bold">
                            {data?.price?.toLocaleString()} {data?.unit}
                        </Text>

                        <Text className="text-gray-400 text-xl">•</Text>

                        <Text className="text-base font-semibold text-foreground">
                            {data?.acreage} m²
                        </Text>
                    </View>

                    <View className="flex-row items-start gap-2 ">
                        <Ionicons
                            name="location-outline"
                            size={16}
                            color="#6b7280"
                            style={{ marginTop: 2 }}
                        />
                        <Text
                            className="text-sm text-muted-foreground flex-1"
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {data?.address}
                        </Text>
                    </View>
                </View>

                <View className="py-1">
                    <DividerCustom />
                </View>

                <View className="flex-row items-center justify-between px-4">
                    <View className="flex-row items-center py-1 gap-4 flex-1">
                        <Image
                            source={data?.landlord?.picture || data?.tenant?.picture}
                            style={{ width: 52, height: 52, borderRadius: 999 }}
                            contentFit="cover"
                        />

                        <View className="flex-1">
                            <Text
                                className="text-base font-semibold text-foreground"
                                numberOfLines={1}
                            >
                                {data?.landlord?.username || data?.tenant?.username}
                            </Text>

                            <Text
                                className="text-sm text-gray-500"
                                numberOfLines={1}
                            >
                                {getNameRole((data?.landlord?.role || data?.tenant?.role) ?? "Không xác định")}
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        style={{ paddingRight: 16 }}
                        onPress={() => bottomSheetRef.current?.expand()}
                    >
                        <Ionicons
                            name="warning-outline"
                            size={24}
                            color="#6b7280"
                        />
                    </Pressable>
                </View>

                <View className="py-1">
                    <DividerCustom />
                </View>

                <View className="px-4 py-2 flex-col gap-2">
                    <Text className="text-lg font-bold text-foreground">
                        Thông tin mô tả
                    </Text>
                    <Text className="text-base text-foreground">
                        {data?.description}
                    </Text>
                </View>

                <View className="py-1">
                    <DividerCustom />
                </View>

                <View className="px-4 py-2 flex-col gap-2">
                    <Text className="text-lg font-bold text-foreground">
                        Nổi bật
                    </Text>
                    <View className="flex flex-row flex-wrap">
                        {options.map((item) => {
                            const isOption = data?.outstanding?.includes(item.title);
                            return (
                                <View key={item.value} className="w-1/2 flex flex-row items-center mb-2 gap-2">
                                    <View className={`w-4 h-4 rounded-full items-center justify-center ${isOption ? "bg-green-500" : "bg-red-500"}`}>
                                        <Ionicons name={isOption ? "checkmark" : "close"} size={12} color="white" />
                                    </View>

                                    <Text className={`text-xs text-foreground ${!isOption ? "line-through opacity-40" : ""}`} numberOfLines={1}>{item.title}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View className="py-1">
                    <DividerCustom />
                </View>

                {
                    (data?.nearby_amenities?.length ?? 0) > 0 &&
                    <>
                        <View className="px-4 py-2 flex-col gap-2">
                            <Text className="text-lg font-bold text-foreground">
                                Tiện ích xung quanh
                            </Text>
                            <View className="flex flex-row flex-wrap gap-2">
                                {data?.nearby_amenities?.map((item, index) => (
                                    <View
                                        key={index}
                                        className="w-full flex flex-row items-center justify-between border border-gray-300 rounded-md p-2"
                                    >
                                        <Text
                                            className="font-medium text-sm flex-shrink "
                                            numberOfLines={1}
                                        >
                                            - {item.name}
                                        </Text>

                                        <Text className="text-xs text-gray-500 ml-2">
                                            {item.distance} {item.unit_distance || "m"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View className="py-1">
                            <DividerCustom />
                        </View>
                    </>
                }


                <View className="px-4 py-2 flex-col gap-1">
                    <Text className="text-lg font-bold text-foreground">
                        Vị trí & bản đồ
                    </Text>
                    <View className="flex-row items-start gap-2 ">
                        <Ionicons
                            name="location-outline"
                            size={16}
                            color="#6b7280"
                            style={{ marginTop: 2 }}
                        />
                        <Text
                            className="text-sm text-muted-foreground flex-1"
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            Địa chỉ: {data?.address}
                        </Text>
                    </View>
                    <View className="w-full rounded-xl overflow-hidden">
                        <MapView
                            style={{ width: "100%", height: 300 }}
                            initialRegion={{
                                latitude: Number(data?.lat),
                                longitude: Number(data?.lng),
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: Number(data?.lat),
                                    longitude: Number(data?.lng),
                                }}
                                title={data?.title}
                            />
                        </MapView>
                    </View>
                    <View className="w-full h-11 items-center justify-center rounded-lg border border-border mt-1">
                        <Pressable className=" flex-row items-center justify-center gap-2 pb-1" onPress={() => { Linking.openURL(`https://www.google.com/maps?q=${data?.lat},${data?.lng}`) }}>
                            <Image
                                source={require("@/assets/icon/GoogleIcon.png")}
                                style={{ width: 32, height: 32 }}
                                contentFit="cover"
                            />
                            <Text className="text-foreground font-semibold">Xem bản đồ trên Google Maps</Text>
                        </Pressable>
                    </View>
                </View>

                <View className="py-1">
                    <DividerCustom />
                </View>

                <View>
                    <RoomSameArea slug={data?.slug || ""} category={data?.category || ""} />
                    <View className="py-1">
                        <DividerCustom />
                    </View>
                    <RoomOrder category={data?.category || ""} />
                </View>

            </ScrollView >



            <View
                style={{
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    borderTopWidth: 0.2,
                    borderTopColor: "#d1d5db",
                }}
            >
                <View className="flex-row items-center">
                    {
                        data?.landlord?.zalo || data?.tenant?.zalo ?
                            (
                                <View className="w-1/2 h-full flex-row items-center justify-center">
                                    <View className="w-1/2 h-full items-center justify-center border-r border-border">
                                        <Pressable className="items-center justify-center" onPress={() => { Linking.openURL(`https://zalo.me/${data?.landlord?.phone || data?.tenant?.phone}`); }}>
                                            <Image
                                                source={require("@/assets/icon/zalo.svg")}
                                                style={{ width: 40, height: 40 }}
                                                contentFit="cover"

                                            />
                                        </Pressable>
                                    </View>
                                    <View className="w-1/2 h-full items-center justify-center border-l border-border">
                                        <Pressable className="items-center justify-center">
                                            <Ionicons
                                                name="chatbubble-ellipses"
                                                size={32}
                                                color="#2baf90"
                                            />
                                        </Pressable>
                                    </View>
                                </View>
                            ) : (
                                <View className="w-1/2 h-full items-center justify-center">
                                    <Pressable className="flex-row items-center justify-center gap-2">
                                        <Ionicons
                                            name="chatbubble-ellipses"
                                            size={28}
                                            color="#2baf90"
                                        />
                                        <Text className="text-base font-bold text-foreground">
                                            Nhắn tin
                                        </Text>
                                    </Pressable>
                                </View>
                            )
                    }


                    <View className="w-2/4 h-full items-center justify-center bg-red-600">
                        <Pressable className="flex-row gap-2 items-center justify-center" onPress={() => { Linking.openURL(`tel:${data?.landlord?.phone || data?.tenant?.phone}`); }}>
                            <Ionicons name="call" size={20} color="white" />
                            <Text className="text-base font-bold text-white">
                                Gọi ngay
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['70%', '90%']}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
            >
                <BottomSheetView style={{ padding: 16, height: 560 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                        Phản ánh tin đăng
                    </Text>

                    <Text style={{ marginVertical: 8, color: '#555' }}>
                        Nếu bạn phát hiện tin đăng có thông tin sai lệch, hãy gửi phản ánh.
                    </Text>

                    {reasons.map((reason) => (
                        <View key={reason.id} style={{ marginVertical: 6 }}>
                            <Pressable
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => {
                                    setSelectedReason(reason.label);
                                    if (reason.label !== 'Lý do khác') {
                                        setOtherReason('');
                                    }
                                }}
                            >
                                <Ionicons
                                    name={
                                        selectedReason === reason.label
                                            ? 'checkbox'
                                            : 'square-outline'
                                    }
                                    size={20}
                                    color="#f97316"
                                />
                                <Text style={{ marginLeft: 8 }}>
                                    {reason.label}
                                </Text>
                            </Pressable>

                            {reason.label === 'Lý do khác' &&
                                selectedReason === 'Lý do khác' && (
                                    <TextInput
                                        placeholder="Nhập lý do khác..."
                                        value={otherReason}
                                        onChangeText={setOtherReason}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#ccc',
                                            padding: 8,
                                            marginTop: 6,
                                            borderRadius: 6,
                                        }}
                                    />
                                )}
                        </View>
                    ))}


                    <Text style={{ marginTop: 12, fontWeight: '600' }}>
                        Mô tả
                    </Text>
                    <TextInput
                        multiline
                        numberOfLines={5}
                        placeholder="Nhập mô tả..."
                        value={description}
                        onChangeText={setDescription}
                        style={{
                            height: 120,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            padding: 10,
                            borderRadius: 6,
                            marginTop: 6,
                            textAlignVertical: 'top',
                        }}
                    />

                    <Pressable
                        style={{
                            backgroundColor: '#f97316',
                            padding: 14,
                            borderRadius: 8,
                            marginTop: 16,
                        }}
                        onPress={handleSubmit}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                fontWeight: 'bold',
                                textAlign: 'center',
                            }}
                        >
                            Gửi phản ánh
                        </Text>
                    </Pressable>
                </BottomSheetView>
            </BottomSheet>

            <Modal
                visible={previewVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'black' }}>

                    <Pressable
                        onPress={() => setPreviewVisible(false)}
                        style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}
                    >
                        <Text style={{ color: 'white', fontSize: 18 }}>✕</Text>
                    </Pressable>

                    {previewData?.type === 'image' && (
                        <ImageZoom
                            cropWidth={Dimensions.get('window').width}
                            cropHeight={Dimensions.get('window').height}
                            imageWidth={Dimensions.get('window').width}
                            imageHeight={Dimensions.get('window').height}
                        >
                            <Image
                                source={{ uri: previewData.uri }}
                                style={{
                                    width: Dimensions.get('window').width,
                                    height: Dimensions.get('window').height,
                                }}
                                contentFit="contain"
                            />
                        </ImageZoom>
                    )}

                    {previewData?.type === 'video' && (
                        <Video
                            source={{ uri: previewData.uri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay={previewVisible}
                            useNativeControls
                        />
                    )}
                </View>
            </Modal>

        </View >
    );
}
