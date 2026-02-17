
export type TIPaymentResult = {
    clientSecret: string;
    amount: number;
    transactionId?: string;
};

export type TPaymentIntent = {
    rentId: string;
};

export type TPaymentConfirmation = {
    transactionId: string;
    rentId: string;
    amount: number;
    status: string;
    gatewayData?: any;
}
