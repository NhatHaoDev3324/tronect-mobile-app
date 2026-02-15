import {
    landlordRegisterByEmail,
    landlordRegisterSendOtp,
} from "@/api/authLandlordApi";
import DropdownComponent from "@/components/customs/DropdownComponent";
import { OtpModal } from "@/components/customs/OtpModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { isAxiosError } from "axios";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    useColorScheme,
    View
} from "react-native";
import Toast from "react-native-toast-message";

interface LocationAPI {
    code: number;
    name: string;
    codename: string;
}

interface LocationItem {
    value: string;
    label: string;
}

const StepBar = ({ step }: { step: number }) => {
    const steps = ["Thông tin", "Địa chỉ", "Tài khoản", "OTP"];
    return (
        <View className="flex-row justify-between mb-6 px-2">
            {steps.map((label, i) => {
                const index = i + 1;
                const active = step === index;
                const done = step > index;

                return (
                    <View key={label} className="items-center flex-1 relative">
                        {i < steps.length - 1 && (
                            <View
                                className={`absolute top-[18px] left-[50%] right-[-50%] h-[2px] z-[-1] ${step > index ? "bg-green-500" : "bg-muted"
                                    }`}
                            />
                        )}

                        <View
                            className={`w-9 h-9 rounded-full items-center justify-center border-2 ${done
                                ? "bg-green-500 border-green-500"
                                : active
                                    ? "bg-primary border-primary"
                                    : "bg-background border-muted"
                                }`}
                        >
                            <Text
                                className={`font-bold ${done || active ? "text-white" : "text-muted-foreground"
                                    }`}
                            >
                                {done ? "✓" : index}
                            </Text>
                        </View>
                        <Text
                            className={`text-xs mt-1 text-center font-medium ${active ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            {label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const Step1Info = ({
    form,
    handleChange,
    errors,
    showDatePicker,
    setShowDatePicker,
}: {
    form: any;
    handleChange: (msg: string, val: any) => void;
    errors: any;
    showDatePicker: boolean;
    setShowDatePicker: (v: boolean) => void;
}) => {
    return (
        <View className="gap-4">
            <View className="gap-1">
                <Label nativeID="fullName">
                    Họ và tên <Text className="text-red-500">*</Text>
                </Label>
                <Input
                    value={form.fullName}
                    onChangeText={(v) => handleChange("fullName", v)}
                    placeholder="Nhập họ và tên"
                />
                {errors.fullName && (
                    <Text className="text-red-500 text-xs">{errors.fullName}</Text>
                )}
            </View>

            <View className="gap-1">
                <Label nativeID="cccd">
                    CCCD <Text className="text-red-500">*</Text>
                </Label>
                <Input
                    keyboardType="number-pad"
                    value={form.cccd}
                    onChangeText={(v) => handleChange("cccd", v)}
                    placeholder="Nhập số CCCD"
                    maxLength={12}
                />
                {errors.cccd && (
                    <Text className="text-red-500 text-xs">{errors.cccd}</Text>
                )}
            </View>

            <View className="gap-1">
                <Label>
                    Ngày sinh <Text className="text-red-500">*</Text>
                </Label>
                <Pressable
                    onPress={() => {
                        Keyboard.dismiss();
                        setShowDatePicker(true);
                    }}
                    className="border border-input rounded-xl px-3 py-3 bg-background"
                >
                    <Text
                        className={form.birthday ? "text-foreground" : "text-muted-foreground"}
                    >
                        {form.birthday
                            ? new Date(form.birthday).toLocaleDateString("vi-VN")
                            : "Chọn ngày sinh"}
                    </Text>
                </Pressable>
                {errors.birthday && (
                    <Text className="text-red-500 text-xs">{errors.birthday}</Text>
                )}
            </View>

            <View className="gap-1">
                <Label>
                    Giới tính <Text className="text-red-500">*</Text>
                </Label>
                <View className="flex-row gap-2 flex-wrap">
                    {[
                        { label: "Nam", value: "male" },
                        { label: "Nữ", value: "female" },
                        { label: "Khác", value: "other" },
                        { label: "Không chia sẻ", value: "no_share" },
                    ].map((g) => (
                        <Pressable
                            key={g.value}
                            onPress={() => {
                                Keyboard.dismiss();
                                handleChange("gender", g.value);
                            }}
                            className={`px-3 py-1 rounded-full border ${form.gender === g.value
                                ? "bg-[#20ab90] border-[#20ab90]"
                                : "bg-background border-input"
                                }`}
                        >
                            <Text
                                className={
                                    form.gender === g.value ? "text-white" : "text-foreground"
                                }
                            >
                                {g.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                {errors.gender && (
                    <Text className="text-red-500 text-xs">{errors.gender}</Text>
                )}
            </View>
        </View>
    );
};

const Step2Address = ({
    form,
    handleChange,
    errors,
    provinces,
    districts,
    wards,
    onProvinceChange,
    onDistrictChange,
    onWardChange,
}: {
    form: any;
    handleChange: (key: string, val: any) => void;
    errors: any;
    provinces: LocationItem[];
    districts: LocationItem[];
    wards: LocationItem[];
    onProvinceChange: (val: string) => void;
    onDistrictChange: (val: string) => void;
    onWardChange: (val: string) => void;
}) => {
    return (
        <View className="gap-4">
            <View className="gap-1">
                <Label>
                    Tỉnh/Thành phố <Text className="text-red-500">*</Text>
                </Label>
                <DropdownComponent
                    placeholder="Chọn tỉnh/thành phố"
                    data={provinces}
                    value={form.province}
                    onChange={onProvinceChange}
                />
                {errors.province && (
                    <Text className="text-red-500 text-xs">{errors.province}</Text>
                )}
            </View>

            <View className="gap-1">
                <Label>
                    Quận/Huyện <Text className="text-red-500">*</Text>
                </Label>
                <DropdownComponent
                    placeholder="Chọn quận/huyện"
                    data={districts}
                    value={form.district}
                    onChange={onDistrictChange}
                    disabled={!form.province}
                />
                {errors.district && (
                    <Text className="text-red-500 text-xs">{errors.district}</Text>
                )}
            </View>

            <View className="gap-1">
                <Label>
                    Phường/Xã <Text className="text-red-500">*</Text>
                </Label>
                <DropdownComponent
                    placeholder="Chọn phường/xã"
                    data={wards}
                    value={form.ward}
                    onChange={onWardChange}
                    disabled={!form.district}
                />
                {errors.ward && (
                    <Text className="text-red-500 text-xs">{errors.ward}</Text>
                )}
            </View>

            <View className="gap-1">
                <Label>
                    Địa chỉ đầy đủ <Text className="text-red-500">*</Text>
                </Label>
                <Input
                    value={form.address}
                    onChangeText={(v) => handleChange("address", v)}
                    placeholder="Nhập địa chỉ đầy đủ của bạn"
                />
                {errors.address && (
                    <Text className="text-red-500 text-xs">{errors.address}</Text>
                )}
            </View>
        </View>
    );
};

const Step3Account = ({
    form,
    handleChange,
    errors,
    securePass,
    setSecurePass,
    secureConfirm,
    setSecureConfirm,
    handleSendOtp,
    loading,
}: {
    form: any;
    handleChange: (key: string, val: any) => void;
    errors: any;
    securePass: boolean;
    setSecurePass: (v: boolean) => void;
    secureConfirm: boolean;
    setSecureConfirm: (v: boolean) => void;
    handleSendOtp: () => void;
    loading: boolean;
}) => {
    return (
        <View className="gap-4">
            <View className="gap-1">
                <Label>
                    Email <Text className="text-red-500">*</Text>
                </Label>
                <Input
                    value={form.email}
                    onChangeText={(v) => handleChange("email", v)}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {errors.email && (
                    <Text className="text-red-500 text-xs">{errors.email}</Text>
                )}
            </View>

            <View className="gap-1">
                <Label>
                    Số điện thoại <Text className="text-red-500">*</Text>
                </Label>
                <Input
                    value={form.phone}
                    onChangeText={(v) => handleChange("phone", v)}
                    placeholder="0123456789"
                    keyboardType="phone-pad"
                />
                {errors.phone && (
                    <Text className="text-red-500 text-xs">{errors.phone}</Text>
                )}
            </View>

            <View className="gap-1">
                <Label>
                    Mật khẩu <Text className="text-red-500">*</Text>
                </Label>
                <View className="relative">
                    <Input
                        value={form.password}
                        onChangeText={(v) => handleChange("password", v)}
                        placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                        secureTextEntry={securePass}
                        className="pr-10"
                    />
                    <Pressable
                        onPress={() => setSecurePass(!securePass)}
                        className="absolute right-3 top-3"
                    >
                        <Ionicons
                            name={securePass ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color="gray"
                        />
                    </Pressable>
                </View>
                {errors.password && (
                    <Text className="text-red-500 text-xs">{errors.password}</Text>
                )}
            </View>

            <View className="gap-1">
                <Label>
                    Xác nhận mật khẩu <Text className="text-red-500">*</Text>
                </Label>
                <View className="relative">
                    <Input
                        value={form.confirmPassword}
                        onChangeText={(v) => handleChange("confirmPassword", v)}
                        placeholder="Nhập lại mật khẩu"
                        secureTextEntry={secureConfirm}
                        className="pr-10"
                    />
                    <Pressable
                        onPress={() => setSecureConfirm(!secureConfirm)}
                        className="absolute right-3 top-3"
                    >
                        <Ionicons
                            name={secureConfirm ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color="gray"
                        />
                    </Pressable>
                </View>
                {errors.confirmPassword && (
                    <Text className="text-red-500 text-xs">{errors.confirmPassword}</Text>
                )}
            </View>
        </View>
    );
};

export default function RegisterScreen() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const colorScheme = useColorScheme();

    const [form, setForm] = useState({
        fullName: "",
        cccd: "",
        birthday: "",
        gender: "",

        province: "",
        district: "",
        ward: "",


        provinceName: "",
        districtName: "",
        wardName: "",
        address: "",

        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [securePass, setSecurePass] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);

    const [provinces, setProvinces] = useState<LocationItem[]>([]);
    const [districts, setDistricts] = useState<LocationItem[]>([]);
    const [wards, setWards] = useState<LocationItem[]>([]);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());

    const [loading, setLoading] = useState(false);
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const logoSource =
        colorScheme === "dark"
            ? require("@/assets/logo/dark-LogoWithWord-v.png")
            : require("@/assets/logo/light-LogoWithWord-v.png");

    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then((res) => res.json())
            .then((data) => {
                setProvinces(
                    data.map((p: LocationAPI) => ({
                        value: String(p.code),
                        label: p.name,
                    }))
                );
            })
            .catch((err) => console.error("Province fetch error", err));
    }, []);

    useEffect(() => {
        if (!form.province) return;
        fetch(`https://provinces.open-api.vn/api/p/${form.province}?depth=2`)
            .then((res) => res.json())
            .then((data) => {
                setDistricts(
                    data.districts.map((d: LocationAPI) => ({
                        value: String(d.code),
                        label: d.name,
                    }))
                );
                setForm((p) => ({ ...p, district: "", ward: "", districtName: "", wardName: "" }));
                setWards([]);
            })
            .catch(console.error);
    }, [form.province]);

    useEffect(() => {
        if (!form.district) return;
        fetch(`https://provinces.open-api.vn/api/d/${form.district}?depth=2`)
            .then((res) => res.json())
            .then((data) => {
                setWards(
                    data.wards.map((w: LocationAPI) => ({
                        value: String(w.code),
                        label: w.name,
                    }))
                );
                setForm((p) => ({ ...p, ward: "", wardName: "" }));
            })
            .catch(console.error);
    }, [form.district]);

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowDatePicker(false);
            if (selectedDate) {
                setDate(selectedDate);
                handleChange("birthday", selectedDate.toISOString());
            }
        } else {
            if (selectedDate) {
                setDate(selectedDate);
            }
        }
    };

    const confirmIOSDate = () => {
        handleChange("birthday", date.toISOString());
        setShowDatePicker(false);
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
        if (!form.cccd.trim()) newErrors.cccd = "Vui lòng nhập số CCCD";
        else if (form.cccd.length !== 12) newErrors.cccd = "CCCD phải có 12 số";

        if (!form.birthday) newErrors.birthday = "Vui lòng chọn ngày sinh";
        if (!form.gender) newErrors.gender = "Vui lòng chọn giới tính";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!form.province) newErrors.province = "Vui lòng chọn tỉnh/thành phố";
        if (!form.district) newErrors.district = "Vui lòng chọn quận/huyện";
        if (!form.ward) newErrors.ward = "Vui lòng chọn phường/xã";
        if (!form.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ chi tiết";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};
        if (!form.email.trim()) newErrors.email = "Vui lòng nhập email";
        else if (!validateEmail(form.email)) newErrors.email = "Email không hợp lệ";

        if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
        else if (form.phone.length < 9) newErrors.phone = "Số điện thoại không hợp lệ";

        if (!form.password) newErrors.password = "Vui lòng nhập mật khẩu";
        else if (form.password.length < 6) newErrors.password = "Mật khẩu tối thiểu 6 ký tự";

        if (form.password !== form.confirmPassword)
            newErrors.confirmPassword = "Mật khẩu không khớp";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        } else if (step === 3 && validateStep3()) {
            handleSendOtp();
        }
    };

    const handleBack = () => {
        if (step === 1) router.back();
        else setStep((s) => (s - 1) as any);
    };

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            await landlordRegisterSendOtp("email", form.email);
            setOtpOpen(true);
            setStep(4);
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                Toast.show({
                    type: "error",
                    text1: "Lỗi",
                    text2: err.response?.data?.message || "Gửi OTP thất bại",
                });
            } else {
                Toast.show({ type: "error", text1: "Lỗi", text2: "Có lỗi xảy ra" });
            }
        } finally {
            setLoading(false);
        }
    };

    const onVerifyOtp = async (otp: string) => {
        setOtpLoading(true);
        try {
            const payload = {
                username: form.fullName,
                cccd: form.cccd,
                date_of_birth: form.birthday,
                gender: form.gender,
                province: form.provinceName,
                district: form.districtName,
                ward: form.wardName,
                address: form.address,
                email: form.email,
                phone: form.phone,
                password: form.password,
                otp,
            };

            const res = await landlordRegisterByEmail(payload);

            if (!res?.status) {
                throw new Error(res?.message || "Đăng ký thất bại");
            }

            Toast.show({
                type: "success",
                text1: "Đăng ký thành công",
                text2: "Vui lòng đăng nhập để tiếp tục",
            });
            setOtpOpen(false);
            router.replace("/landlord/login");
        } catch (err: any) {
            const msg = isAxiosError(err)
                ? err.response?.data?.message
                : err.message || "Xác thực OTP thất bại";
            Toast.show({ type: "error", text1: "Lỗi", text2: msg });
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center bg-background">
            <KeyboardAvoidingView

                behavior={Platform.select({ ios: "padding", android: undefined })}
                keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, padding: 20 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center mb-6 mt-4">
                        <Image
                            source={logoSource}
                            style={{ height: 60, width: 320 }}
                            contentFit="contain"
                        />
                        <Text className="text-center text-muted-foreground mt-2" onPress={() => console.log(form)}>
                            Đăng ký tài khoản Tronect với vai trò Chủ trọ
                        </Text>
                    </View>

                    <StepBar step={step} />

                    <View className="flex-1">
                        {step === 1 && (
                            <Step1Info
                                form={form}
                                handleChange={handleChange}
                                errors={errors}
                                showDatePicker={showDatePicker}
                                setShowDatePicker={setShowDatePicker}
                            />
                        )}
                        {step === 2 && (
                            <Step2Address
                                form={form}
                                handleChange={handleChange}
                                errors={errors}
                                provinces={provinces}
                                districts={districts}
                                wards={wards}
                                onProvinceChange={(val) => {
                                    const item = provinces.find(p => p.value === val);
                                    handleChange("province", val);
                                    handleChange("provinceName", item ? item.label : "");
                                }}
                                onDistrictChange={(val) => {
                                    const item = districts.find(d => d.value === val);
                                    handleChange("district", val);
                                    handleChange("districtName", item ? item.label : "");
                                }}
                                onWardChange={(val) => {
                                    const item = wards.find(w => w.value === val);
                                    handleChange("ward", val);
                                    handleChange("wardName", item ? item.label : "");
                                }}
                            />
                        )}
                        {step === 3 && (
                            <Step3Account
                                form={form}
                                handleChange={handleChange}
                                errors={errors}
                                securePass={securePass}
                                setSecurePass={setSecurePass}
                                secureConfirm={secureConfirm}
                                setSecureConfirm={setSecureConfirm}
                                handleSendOtp={handleNext}
                                loading={loading}
                            />
                        )}
                        {step === 4 && (
                            <View className="items-center justify-center flex-1">
                                <Text className="text-muted-foreground mb-4">Vui lòng nhập mã OTP đã được gửi đến email</Text>
                                <Button onPress={() => setOtpOpen(true)} variant="outline">
                                    <Text>Nhập OTP</Text>
                                </Button>
                            </View>
                        )}
                    </View>

                    <View className="mt-6 flex-row gap-4">
                        {step > 1 && (
                            <Button className="w-1/2" onPress={handleBack} variant="outline">
                                <Text className="font-bold text-foreground">Quay lại</Text>
                            </Button>
                        )}
                        {step < 4 && (
                            <Button className={`flex-1 ${step === 1 ? "w-full" : "w-1/2"}`} variant={"tronect"} onPress={handleNext}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text className="font-bold text-white">Tiếp tục</Text>}
                            </Button>
                        )}
                        {step === 4 && (
                            <Button className="w-1/2" onPress={() => setOtpOpen(true)}>
                                <Text className="font-bold text-white">Xác thực</Text>
                            </Button>
                        )}
                    </View>

                    <View className="mt-6 flex-row justify-center gap-2 pb-6">
                        <Text className="text-muted-foreground">Bạn đã có tài khoản?</Text>
                        <Pressable onPress={() => router.push("/landlord/login")} hitSlop={10}>
                            <Text className="font-bold text-primary">Đăng nhập</Text>
                        </Pressable>
                    </View>
                    <Pressable
                        onPress={() => router.back()}
                        className="self-center flex-row items-center gap-1"
                    >
                        <Ionicons name="chevron-back" size={18} color="gray" />
                        <Text className="text-muted-foreground">Quay lại</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>

            {Platform.OS === "ios" && (
                <Modal visible={showDatePicker} transparent animationType="fade">
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-background rounded-t-2xl p-4">
                            <View className="flex-row justify-end mb-4">
                                <Pressable onPress={confirmIOSDate}>
                                    <Text className="font-bold text-primary">Xong</Text>
                                </Pressable>
                            </View>
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="spinner"
                                maximumDate={new Date()}
                                onChange={onDateChange}
                            />
                        </View>
                    </View>
                </Modal>
            )}

            {Platform.OS === "android" && showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="calendar"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                />
            )}

            <OtpModal
                open={otpOpen}
                email={form.email}
                loading={otpLoading}
                onClose={() => {
                    setOtpOpen(false);
                }}
                onSubmit={onVerifyOtp}
                onResend={async () => {
                    setOtpOpen(false);
                    await handleSendOtp();
                }}
            />
        </View>
    );
}
