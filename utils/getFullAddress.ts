export const getFullAddress = (provinceValue: string, districtValue: string, wardValue: string, streetValue: string, houseNumberValue: string) => {
    const parts = [
        houseNumberValue && `Số ${houseNumberValue}`,
        streetValue,
        wardValue,
        districtValue,
        provinceValue,
    ].filter(Boolean);

    return parts.join(",  ");
};  