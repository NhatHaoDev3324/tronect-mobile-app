export interface ServiceType {
    stt?: number;
    id: string;
    image: string;
    slug: string;
    title: string;
    description: string;
    key_search: string[];
    created_at: string;
    updated_at: string;
}

export interface PartnerServiceType {
    stt?: number;
    id: string;
    category: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    house_number: string;
    lat: string;
    lng: string;
    image: string;
    title: string;
    description: string;
    price_note: string;
    working_hours: string;
    name: string;
    phone: string;
    zalo: string;
    status: string;
    created_at: string;
    updated_at: string;
}
