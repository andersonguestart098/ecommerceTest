import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card"); // "card", "pix" ou "boleto"
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [deviceId, setDeviceId] = useState<string | null>("default_device_id");
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [installmentOptions, setInstallmentOptions] = useState<number[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Captura userId do localStorage
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser.id);
      console.log("ID do usuário capturado:", parsedUser.id);
    }

    // Recupera dados do checkout
    const data = JSON.parse(localStorage.getItem("checkoutData") || "{}");
    setCheckoutData(data);

    if (!data.userId) {
      console.error("User ID não encontrado no localStorage.");
      return;
    }

    if (!publicKey) {
      console.error("Chave pública do Mercado Pago não encontrada!");
      return;
    }

    const initializeMercadoPago = async () => {
      const mp = new (window as any).MercadoPago(publicKey, {
        locale: "pt-BR",
      });

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
      console.log("Device ID gerado:", capturedDeviceId);

      if (selectedPaymentMethod === "card") {
        const cardForm = mp.cardForm({
          amount: String(data.amount > 1 ? data.amount : 1),
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
              placeholder: "Titular do cartão",
            },
            issuer: {
              id: "form-checkout__issuer",
              placeholder: "Banco emissor",
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
              if (error)
                return console.warn("Erro ao montar o formulário: ", error);
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
      document.body.removeChild(scriptSdk);
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
      userId: checkoutData.userId,
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

  const handlePixSubmit = async () => {
    if (!userId) {
      console.error("User ID não encontrado.");
      return;
    }

    try {
      const userResponse = await axios.get(
        `https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/${userId}`
      );
      const userData = userResponse.data;

      const paymentData = {
        transaction_amount: checkoutData.amount,
        payment_method_id: "pix",
        payer: {
          email: userData.email,
          first_name: userData.name.split(" ")[0],
          last_name: userData.name.split(" ").slice(1).join(" "),
          identification: { type: "CPF", number: userData.cpf },
          phone: userData.phone,
          address: {
            street_name: userData.address.street,
            zip_code: userData.address.postalCode,
            city: userData.address.city,
            state: userData.address.state,
          },
        },
        items: checkoutData.items,
        userId: checkoutData.userId,
        device_id: deviceId,
      };

      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        paymentData
      );
      alert("QR Code para Pix gerado com sucesso! Verifique o link.");
      navigate("/sucesso");
    } catch (error) {
      console.error("Erro ao processar Pix:", error);
    }
  };

  const handleBoletoSubmit = async () => {
    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          transaction_amount: checkoutData.amount,
          payment_method_id: "bolbradesco",
          payer: { email: checkoutData.email },
          description: "Compra no e-commerce",
          items: checkoutData.items,
          userId: checkoutData.userId,
          device_id: deviceId,
        }
      );
      alert("Boleto gerado com sucesso! Verifique o link.");
      navigate("/sucesso");
    } catch (error) {
      console.error("Erro ao processar boleto:", error);
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
          <div id="form-checkout__cardNumber" className="container"></div>
          <div id="form-checkout__expirationDate" className="container"></div>
          <div id="form-checkout__securityCode" className="container"></div>
          <input
            type="text"
            id="form-checkout__cardholderName"
            placeholder="Titular do cartão"
          />
          <select id="form-checkout__issuer"></select>
          <select
            id="form-checkout__installments"
            value={selectedInstallment}
            onChange={(e) => setSelectedInstallment(Number(e.target.value))}
          >
            {installmentOptions.map((installment) => (
              <option key={installment} value={installment}>
                {installment}x
              </option>
            ))}
          </select>
          <select id="form-checkout__identificationType"></select>
          <input
            type="text"
            id="form-checkout__identificationNumber"
            placeholder="CPF"
          />
          <input
            type="email"
            id="form-checkout__cardholderEmail"
            placeholder="E-mail"
          />
          <button
            type="submit"
            id="form-checkout__submit"
            disabled={!isMpReady}
          >
            Pagar com Cartão
          </button>
        </form>
      )}

      {selectedPaymentMethod === "pix" && (
        <button onClick={handlePixSubmit}>Gerar QR Code para Pix</button>
      )}

      {selectedPaymentMethod === "boleto" && (
        <button onClick={handleBoletoSubmit}>Gerar Boleto</button>
      )}
    </div>
  );
};

export default Checkout;
