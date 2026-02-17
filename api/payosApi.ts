import api from "@/utils/axios";

export const paymentLink = async (id_payment: string, amount: number, description:string, itemName:string, itemPrice: number, quantity: number, expiry:string, postType:string, tempPostId:string) => {
    const response = await api.post(`/api/payos/create-payment-link`, {
        id_payment,
        amount,
        description,
        itemName,
        itemPrice,
        quantity,
        expiry,
        postType,
        tempPostId
    });

    return response.data;
};

export const paymentExtendLink = async (id_payment: string, amount: number, description:string, itemName:string, itemPrice: number, quantity: number, expiry:string, postType:string, postId: string) => {
    const response = await api.post(`/api/payos/create-payment-extend-link`, {
        id_payment,
        amount,
        description,
        itemName,
        itemPrice,
        quantity,
        expiry,
        postType,
        postId
    });

    return response.data;
};
