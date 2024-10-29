// global.d.ts
export {};

declare global {
  interface Window {
    MP_DEVICE_SESSION_ID: string;
  }
}
