export const getRoomName = (value: string) => {
    switch (value) {
        case "phong-tro-tphcm":
            return "Phòng trọ TP.HCM";
        case "chung-cu-tphcm":
            return "Chung cư TP.HCM";
        case "can-ho-tphcm":
            return "Căn hộ TP.HCM";
        case "ky-thuc-xa-tphcm":
            return "Ký túc xá TP.HCM";
        case "phong-o-ghep-tphcm":
            return "Phòng ở ghép TP.HCM";
        default:
            return value;
    }
};
