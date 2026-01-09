import api from "@/utils/axios";

export const tenantSendOtp = async (contact: string) => {
    const request = await api.post("/api/tenant/send-otp", { contact, typeContact: "email" });
    return request.data;
};

export const tenantRegisterWithEmail = async (username: string,  email: string, password: string, otp: string) => {
    const request = await api.post("/api/tenant/register-by-email", {username, email, password, otp});
    return request.data;
};

export const tenantLoginWithEmail = async (email: string, password: string) => {
    const request  = await api.post("/api/tenant/login/email", {email, password});
    return request.data;
}

export const tenantMyProfile = async () => {
    const request  = await api.get("/api/tenant/profile");
    return request.data;
}

export const tenantUpdatePass = async (oldPassword: string, newPassword: string) => {
    const request = await api.put("/api/tenant/update/pass", {oldPassword, newPassword });
    return request.data;
}

export const tenantUpdateAvatar = async (formData: FormData) => {
  const request = await api.put("/api/tenant/update/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return request.data;
};

export const tenantUpdate = async (username: string, email: string, phone: string, gender: string, date_of_birth: Date | undefined, bio: string, zalo: string  ) => {
    const request = await api.put("/api/tenant/update", { username, email, phone, gender, date_of_birth, bio, zalo });
    return request.data;
}