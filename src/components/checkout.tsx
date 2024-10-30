import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [deviceId, setDeviceId] = useState<string | null>("default_device_id");
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [installmentOptions, setInstallmentOptions] = useState<number[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  let mpInstance: any; // Adicionar uma variável para armazenar a instância do MercadoPago

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser.id);
    }

    const data = JSON.parse(localStorage.getItem("checkoutData") || "{}");
    setCheckoutData(data);

    if (!publicKey) {
      console.error("Chave pública do Mercado Pago não encontrada!");
      return;
    }

    const loadMercadoPagoSdk = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.MercadoPago) {
          setSdkLoaded(true);
          resolve();
        } else {
          const scriptSdk = document.createElement("script");
          scriptSdk.src = "https://sdk.mercadopago.com/js/v2";
          scriptSdk.async = true;
          scriptSdk.onload = () => {
            setSdkLoaded(true);
            resolve();
          };
          scriptSdk.onerror = (error) => reject(error);
          document.body.appendChild(scriptSdk);
        }
      });
    };

    loadMercadoPagoSdk()
      .then(() => initializeMercadoPago())
      .catch((error) => console.error("Erro ao carregar o SDK:", error));
  }, [publicKey]);

  const initializeMercadoPago = async () => {
    if (!publicKey) return;
    mpInstance = new window.MercadoPago(publicKey, { locale: "pt-BR" });

    const capturedDeviceId = await new Promise<string>((resolve) => {
      const interval = setInterval(() => {
        const device = window.MP_DEVICE_SESSION_ID;
        if (device) {
          clearInterval(interval);
          resolve(device);
        }
      }, 100);
    });
    setDeviceId(capturedDeviceId);
  };

  useEffect(() => {
    if (sdkLoaded && selectedPaymentMethod === "card" && publicKey) {
      if (mpInstance) {
        initializeCardForm(mpInstance);
      } else {
        console.warn("Instância do MercadoPago não está definida.");
      }
    }
  }, [sdkLoaded, selectedPaymentMethod, publicKey, checkoutData.amount]);

  const initializeCardForm = (mp: any) => {
    mp.cardForm({
      amount: String(checkoutData.amount > 1 ? checkoutData.amount : 1),
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
          placeholder: "Titular do cartão",
        },
        issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
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
          if (error) console.warn("Erro ao montar o formulário: ", error);
          else setIsMpReady(true);
        },
        onSubmit: handleCardSubmit,
      },
    });
  };

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
      userId: checkoutData.userId,
    };

    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        paymentData
      );
      if (response.data.status === "approved") navigate("/sucesso");
      else alert("Pagamento pendente ou falhou. Verifique a transação.");
    } catch (error) {
      console.error("Erro ao finalizar o pagamento:", error);
      alert("Erro ao finalizar o pagamento.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Resumo do Pedido</h2>
      <p>Total: R$ {checkoutData.totalPrice}</p>
      <p>Frete: R$ {checkoutData.shippingCost}</p>
      <h3>Selecione a forma de pagamento</h3>
      <button onClick={() => setSelectedPaymentMethod("card")}>Cartão</button>
      <button onClick={() => setSelectedPaymentMethod("pix")}>Pix</button>
      <button onClick={() => setSelectedPaymentMethod("boleto")}>
        Boleto Bancário
      </button>
      {selectedPaymentMethod === "card" && (
        <form id="form-checkout" onSubmit={handleCardSubmit}>
          {/* Campos do formulário */}
          <button
            type="submit"
            id="form-checkout__submit"
            disabled={!isMpReady}
          >
            Pagar com Cartão
          </button>
        </form>
      )}
    </div>
  );
};

export default Checkout;
