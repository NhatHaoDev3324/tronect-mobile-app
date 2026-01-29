
export type LocationResult = {
    lat: number;
    lng: number;
    address: string;
    province?: string;
    district?: string;
    ward?: string;
    name?: string;
};

const geocodeByAddress = async (address: string): Promise<LocationResult> => {
    const url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
        address
    )}&api_key=${process.env.EXPO_PUBLIC_GOONG_API_KEY || "02J9Wx9p10tp03FhTnLFqxem0YjFaE03pBTiAU94"}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.results?.length) {
        console.log("Không tìm thấy tọa độ từ địa chỉ");
    }

    const result = data.results[0];
    const loc = result.geometry?.location;

    if (!loc?.lat || !loc?.lng) {
        console.log("Thiếu thông tin tọa độ");
    }

    return {
        lat: loc.lat,
        lng: loc.lng,
        address: result.formatted_address || address,
        province: result.compound?.province,
        district: result.compound?.district,
        ward: result.compound?.commune,
        name: result.name,
    };
};

export const getLocationFromAddress = async (address: string): Promise<LocationResult | null> => {
    try {
        return await geocodeByAddress(address);
    } catch {
        return null;
    }
};
