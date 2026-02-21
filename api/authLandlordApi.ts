import api from "@/utils/axios";

export const landlordRegister = async (username: string, email: string, phone: string, password: string) => {
    const request = await api.post("/api/landlord/register", { username, email, phone, password });
    return request.data;
}

export const landlordRegisterSendOtp = async (typeContact: string, contact: string) => {
    const request = await api.post("/api/landlord/send-otp", { typeContact, contact });
    return request.data;
}
export const landlordRegisterByEmail = async (data: {
    username: string;
    cccd: string;
    date_of_birth: string;
    gender: string;
    province: string;
    district: string;
    ward: string;
    address: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
}) => {
    const request = await api.post("/api/landlord/register-by-email", data);
    return request.data;
};

export const landlordRegisterByPhone = async (username: string, phone: string, password: string, otp: string) => {
    const request = await api.post("/api/landlord/register-by-phone", { username, phone, password, otp });
    return request.data;
}

export const landlordLoginWithEmail = async (email: string, password: string) => {
    const request = await api.post("/api/landlord/login/email", { email, password });
    return request.data;
}

export const landlordLoginWithPhone = async (phone: string, password: string) => {
    const request = await api.post("/api/landlord/login/phone", { phone, password });
    return request.data;
}

export const landlordMyProfile = async () => {
    const request = await api.get("/api/landlord/profile");
    return request.data;
}

export const landlordForgotPassword = async (email: string) => {
    const request = await api.post("/api/forgot-password", { email });
    return request.data.data;
}

export const landlordResetPassword = async (token: string | null, newPassword: string) => {
    const request = await api.post("/api/reset-password", { token, newPassword });
    return request.data;
}

export const landlordLoginGoogle = async (code: string) => {
    const request = await api.post("/api/landlord/google", { code });
    return request.data;
}

export const landlordUpdate = async (username: string, email: string, phone: string, gender: string, date_of_birth: Date | undefined, bio: string, zalo: string) => {
    const request = await api.put("/api/landlord/update", { username, email, phone, gender, date_of_birth, bio, zalo });
    return request.data;
}

export const landlordUpdatePass = async (oldPassword: string, newPassword: string) => {
    const request = await api.put("/api/landlord/update/pass", { oldPassword, newPassword });
    return request.data;
}

export const landlordUpdateAvatar = async (formData: FormData) => {
    const request = await api.put("/api/landlord/update/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return request.data;
};

export const landlordMyInfo = async (id: string) => {
    const request = await api.get(`/api/landlord/info/${id}`);
    return request.data.data;
}

export const SendLandlordOTPResetPass = async (email: string) => {
    const request = await api.post("/api/landlord/send-otp-resetPass", { email });
    return request.data;
}
export const VerifyOTPLandlord = async (email: string, otp: string) => {
    const request = await api.post("/api/landlord/verifyOTP", { email, otp });
    return request.data;
}
export const ResetPassLandlord = async (id: string, newPassword: string) => {
    const request = await api.post("/api/landlord/resetPass", { id, newPassword });
    return request.data;
}