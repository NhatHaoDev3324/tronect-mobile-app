import { RoleType } from "./authType";

export interface PaymentType {
    stt: number;
    id: string;
    product_name: string;
    product_package: string;
    amount: string;
    status: string;
    created_at: Date;
    landlord: {
        id: string;
        email: string;
        username: string;
        phone: string;
        role: RoleType;
        picture: string;
        zalo: string;
        bio: string;
    },
}