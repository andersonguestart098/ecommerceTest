import { loadMercadoPago } from '@mercadopago/sdk-js';

// Defina manualmente uma interface para o tipo MercadoPago
interface IMercadoPago {
    // Defina aqui métodos e propriedades que você sabe que a instância do Mercado Pago possui,
    // ou deixe-a vazia se não precisar de tipagem estrita.
}

export class MercadoPagoInstance {
    static publicKey = "APP_USR-2dc00785-51ed-4ac8-8086-e413c4490457";

    static loadedInstanceMercadoPago = false;
    static instanceMercadoPago: IMercadoPago | null = null;

    static async getInstance(): Promise<IMercadoPago | null> {
        if (this.publicKey) {
            if (!this.loadedInstanceMercadoPago) {
                await loadMercadoPago(this.publicKey);
                this.loadedInstanceMercadoPago = true;
            }
            if (!this.instanceMercadoPago) {
                this.instanceMercadoPago = new (window as any).MercadoPago(this.publicKey);
            }
            return this.instanceMercadoPago;
        } else {
            console.error('Expected the PUBLIC_KEY to render the MercadoPago SDK React');
            return null;
        }
    }
}
