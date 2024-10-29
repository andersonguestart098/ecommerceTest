// Checkout.tsx
import React, { useState, useEffect } from "react";
import { CardPayment } from "@mercadopago/sdk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/bricks/cardPayment/type";
import { MercadoPagoInstance } from "../components/services/MercadoPagoInstance";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState(100); // ajuste o valor conforme necessário
  const [mercadoPago, setMercadoPago] = useState<any>(null);

  useEffect(() => {
    const initializeMercadoPago = async () => {
      const instance = await MercadoPagoInstance.getInstance(); // Agora usa a chave pública definida na classe
      setMercadoPago(instance);
    };
    initializeMercadoPago();
  }, []);

  if (!mercadoPago) {
    return <div>Carregando pagamento...</div>;
  }

  const initialization = {
    amount: totalPrice,
  };

  const onSubmit = async (
    formData: ICardPaymentFormData<ICardPaymentBrickPayer>
  ): Promise<void> => {
    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/create-transparent",
        formData
      );

      if (response.data.status === "approved") {
        navigate("/sucesso");
      } else {
        alert("Pagamento pendente ou falhou. Verifique sua transação.");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao finalizar o pagamento.");
    }
  };

  const onError = (error: any) => {
    console.error("Erro no Brick:", error);
  };

  const onReady = () => {
    console.log("Brick pronto!");
  };

  return (
    <div>
      <h2>Pagamento</h2>
      <CardPayment
        initialization={initialization}
        onSubmit={onSubmit}
        onError={onError}
        onReady={onReady}
      />
    </div>
  );
};

export default Checkout;
