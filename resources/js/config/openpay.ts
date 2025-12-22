export const openpayConfig = {
    merchantId: import.meta.env.VITE_OPENPAY_MERCHANT_ID,
    publicKey: import.meta.env.VITE_OPENPAY_PUBLIC_KEY,
    isSandbox: import.meta.env.VITE_OPENPAY_IS_SANDBOX === 'true',
};