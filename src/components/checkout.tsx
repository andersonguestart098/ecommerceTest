import React, { useState } from "react";
import { CardPayment } from "@mercadopago/sdk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ICardPaymentBrickPayer, ICardPaymentFormData } from "@mercadopago/sdk-react/bricks/cardPayment/type";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState(100); // ajuste o valor conforme necessário

  const initialization = {
    amount: totalPrice,
  };

  const onSubmit = async (formData: ICardPaymentFormData<ICardPaymentBrickPayer>): Promise<void> => {
    try {
      const response = await axios.post(
        "https://seu-backend.herokuapp.com/payment/create-transparent",
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
