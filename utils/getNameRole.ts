export const getNameRole = (role: string | null) => {
    if (!role) return "Không xác định";
    switch (role) {
        case "admin":
            return "Quản trị viên";
        case "landlord":
            return "Chủ trọ";
        case "tenant":
            return "Người thuê";
        default:
            return role;
    }
};
