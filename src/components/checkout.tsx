import React, { useState, useEffect } from "react";
import { CardPayment } from "@mercadopago/sdk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/bricks/cardPayment/type";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState(100); // ajuste o valor conforme necessário
  const [mercadoPago, setMercadoPago] = useState<any>(null);

  const publicKey =
    process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY ||
    "APP_USR-51fa4fd6-96e4-4133-bd76-398dc77afe2e";

  useEffect(() => {
    if (!publicKey) {
      console.error("Chave pública não encontrada!");
      return;
    }

    // Inicializa o MercadoPago após a carga do SDK
    const mpInstance = new (window as any).MercadoPago(publicKey);
    setMercadoPago(mpInstance);
  }, [publicKey]);

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
