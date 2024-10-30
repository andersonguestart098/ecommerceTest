export {};

declare global {
  interface Window {
    MP_DEVICE_SESSION_ID: string;
    MercadoPago: any; // Declare MercadoPago como `any` para evitar erros de tipo
  }
}
