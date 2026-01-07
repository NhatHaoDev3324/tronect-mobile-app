export type GenderType = "male" | "female" | "gay" | "les" | "other" | "no_share" | "not_provided";

export const getGenderName = (genderName?: GenderType): string => {
    if (!genderName) return "Không xác định";
    switch (genderName) {
        case "male":
            return "Nam";
        case "female":
            return "Nữ";
        case "gay":
            return "Đồng tính nam";
        case "les":
            return "Đồng tính nữ";
        case "other":
            return "Khác";
        case "no_share":
            return "Không muốn chia sẻ";
        case "not_provided":
            return "Chưa cung cấp";
        default:
            return "Không xác định";
    }
};
