import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [isMpReady, setIsMpReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("checkoutData") || "{}");
    setCheckoutData(data);

    if (!publicKey) {
      console.error("Chave pública do Mercado Pago não encontrada!");
      return;
    }

    const initializeMercadoPago = async () => {
      const mp = new (window as any).MercadoPago(publicKey, {
        locale: "pt-BR",
      });

      const deviceID = await new Promise<string>((resolve) => {
        const interval = setInterval(() => {
          const device = window.MP_DEVICE_SESSION_ID;
          if (device) {
            clearInterval(interval);
            resolve(device);
          }
        }, 100);
      });
      setDeviceId(deviceID);

      if (selectedPaymentMethod === "card") {
        mp.cardForm({
          amount: String(data.amount || 1),
          iframe: true,
          form: {
            id: "form-checkout",
            cardNumber: {
              id: "form-checkout__cardNumber",
              placeholder: "Número do cartão",
            },
            expirationDate: {
              id: "form-checkout__expirationDate",
              placeholder: "MM/YY",
            },
            securityCode: {
              id: "form-checkout__securityCode",
              placeholder: "Código de segurança",
            },
            cardholderName: {
              id: "form-checkout__cardholderName",
              placeholder: "Nome",
            },
            installments: {
              id: "form-checkout__installments",
              placeholder: "Parcelas",
            },
            identificationType: {
              id: "form-checkout__identificationType",
              placeholder: "Tipo de documento",
            },
            identificationNumber: {
              id: "form-checkout__identificationNumber",
              placeholder: "CPF",
            },
            cardholderEmail: {
              id: "form-checkout__cardholderEmail",
              placeholder: "E-mail",
            },
          },
          callbacks: {
            onFormMounted: (error: any) => {
              if (error) console.warn("Erro ao montar o formulário:", error);
              setIsMpReady(true);
            },
            onSubmit: handleCardSubmit,
          },
        });
      }
    };

    const scriptSdk = document.createElement("script");
    scriptSdk.src = "https://sdk.mercadopago.com/js/v2";
    scriptSdk.async = true;
    scriptSdk.onload = initializeMercadoPago;
    document.body.appendChild(scriptSdk);

    return () => {
      if (scriptSdk) {
        document.body.removeChild(scriptSdk);
      }
    };
  }, [publicKey, selectedPaymentMethod]);

  const handleCardSubmit = async (event: any) => {
    event.preventDefault();
    const formData = (window as any).MercadoPago.getCardFormData();
    const paymentData = {
      token: formData.token,
      issuer_id: formData.issuerId,
      payment_method_id: formData.paymentMethodId,
      transaction_amount: checkoutData.amount,
      installments: selectedInstallment,
      description: "Compra no e-commerce",
      payer: {
        email: formData.cardholderEmail,
        first_name: formData.cardholderName?.split(" ")[0] || "",
        last_name: formData.cardholderName?.split(" ").slice(1).join(" ") || "",
        identification: {
          type: formData.identificationType || "CPF",
          number: formData.identificationNumber,
        },
      },
      device_id: deviceId,
      items: checkoutData.items,
    };

    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        paymentData
      );
      if (response.data.status === "approved") {
        navigate("/sucesso");
      } else {
        alert("Pagamento pendente ou falhou. Verifique a transação.");
      }
    } catch (error) {
      console.error("Erro ao finalizar o pagamento:", error);
      alert("Erro ao finalizar o pagamento.");
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      <div>
        <button onClick={() => setSelectedPaymentMethod("card")}>
          Pagar com Cartão
        </button>
        <button onClick={() => setSelectedPaymentMethod("pix")}>
          Pagar com Pix
        </button>
        <button onClick={() => setSelectedPaymentMethod("boleto")}>
          Gerar Boleto
        </button>
      </div>

      {selectedPaymentMethod === "card" && (
        <form id="form-checkout" onSubmit={handleCardSubmit}>
          <div id="form-checkout__cardNumber"></div>
          <div id="form-checkout__expirationDate"></div>
          <div id="form-checkout__securityCode"></div>
          <input
            type="text"
            id="form-checkout__cardholderName"
            placeholder="Nome"
          />
          <input
            type="email"
            id="form-checkout__cardholderEmail"
            placeholder="E-mail"
          />
          <div id="form-checkout__identificationType"></div>
          <input
            type="text"
            id="form-checkout__identificationNumber"
            placeholder="CPF"
          />
          <button type="submit" disabled={!isMpReady}>
            Pagar
          </button>
        </form>
      )}
    </div>
  );
};

export default Checkout;
