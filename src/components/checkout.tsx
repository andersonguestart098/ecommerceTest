import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [mpInstance, setMpInstance] = useState<any>(null);
  const [cardFormInstance, setCardFormInstance] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [checkoutData, setCheckoutData] = useState<any>({});

  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const loadMercadoPagoSdk = async () => {
      if (window.MercadoPago) {
        setSdkLoaded(true);
        setMpInstance(new window.MercadoPago(publicKey, { locale: "pt-BR" }));
      } else {
        const scriptSdk = document.createElement("script");
        scriptSdk.src = "https://sdk.mercadopago.com/js/v2";
        scriptSdk.async = true;
        scriptSdk.onload = () => {
          setSdkLoaded(true);
          setMpInstance(new window.MercadoPago(publicKey, { locale: "pt-BR" }));
        };
        scriptSdk.onerror = () => console.error("Erro ao carregar o SDK.");
        document.body.appendChild(scriptSdk);
      }
    };

    loadMercadoPagoSdk();
  }, [publicKey]);

  useEffect(() => {
    if (
      sdkLoaded &&
      mpInstance &&
      selectedPaymentMethod === "card" &&
      !cardFormInstance
    ) {
      initializeCardForm();
    }
  }, [sdkLoaded, mpInstance, selectedPaymentMethod, cardFormInstance]);

  const initializeCardForm = () => {
    if (mpInstance && formRef.current) {
      const cardForm = mpInstance.cardForm({
        amount: String(checkoutData.amount || 100.5),
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
            placeholder: "Nome do titular",
          },
          issuer: {
            id: "form-checkout__issuer",
            placeholder: "Banco emissor",
          },
          installments: {
            id: "form-checkout__installments",
            placeholder: "Número de parcelas",
          },
          identificationType: {
            id: "form-checkout__identificationType",
            placeholder: "Tipo de documento (ex: CPF)",
          },
          identificationNumber: {
            id: "form-checkout__identificationNumber",
            placeholder: "Número do documento",
          },
          cardholderEmail: {
            id: "form-checkout__cardholderEmail",
            placeholder: "E-mail do titular",
          },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error)
              return console.warn("Form Mounted handling error: ", error);
            console.log("Form mounted");
            setIsMpReady(true);
          },
          onSubmit: handleCardSubmit,
          onFetching: (resource: any) => {
            console.log("Fetching resource: ", resource);
            const progressBar = document.querySelector(".progress-bar");
            if (progressBar) {
              progressBar.removeAttribute("value");
            }
            return () => {
              if (progressBar) progressBar.setAttribute("value", "0");
            };
          },
        },
      });
      setCardFormInstance(cardForm); // Armazena a instância para reutilização
    }
  };

  const handleCardSubmit = async (event: any) => {
    event.preventDefault();
    if (!cardFormInstance) return;

    const formData = cardFormInstance.getCardFormData();
    const [firstName, ...lastNameParts] = formData.cardholderName
      ? formData.cardholderName.split(" ")
      : ["", ""]; // Se undefined, usa strings vazias

    const paymentData = {
      token: formData.token,
      issuer_id: formData.issuerId,
      payment_method_id: formData.paymentMethodId,
      transaction_amount: Number(checkoutData.amount || 100.5),
      installments: Number(formData.installments || 1),
      description: "Descrição do produto",
      payer: {
        email: formData.cardholderEmail,
        first_name: firstName,
        last_name: lastNameParts.join(" "),
        identification: {
          type: formData.identificationType,
          number: formData.identificationNumber,
        },
      },
    };

    try {
      const response = await fetch(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (response.status === 200) {
        navigate("/sucesso");
      } else {
        alert("Pagamento pendente ou falhou.");
      }
    } catch (error) {
      console.error("Erro ao finalizar o pagamento:", error);
      alert("Erro ao finalizar o pagamento.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <style>{`
        #form-checkout {
          display: flex;
          flex-direction: column;
          max-width: 600px;
        }
        .container {
          height: 18px;
          display: inline-block;
          border: 1px solid rgb(118, 118, 118);
          border-radius: 2px;
          padding: 1px 2px;
        }
      `}</style>
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
        <form id="form-checkout" ref={formRef} onSubmit={handleCardSubmit}>
          <div id="form-checkout__cardNumber" className="container"></div>
          <div id="form-checkout__expirationDate" className="container"></div>
          <div id="form-checkout__securityCode" className="container"></div>
          <input
            type="text"
            id="form-checkout__cardholderName"
            placeholder="Nome do titular"
          />
          <select id="form-checkout__issuer"></select>
          <select id="form-checkout__installments"></select>
          <select id="form-checkout__identificationType"></select>
          <input
            type="text"
            id="form-checkout__identificationNumber"
            placeholder="Número do documento"
          />
          <input
            type="email"
            id="form-checkout__cardholderEmail"
            placeholder="E-mail do titular"
          />
          <button
            type="submit"
            id="form-checkout__submit"
            disabled={!isMpReady}
          >
            Pagar
          </button>
          <progress value="0" className="progress-bar">
            Carregando...
          </progress>
        </form>
      )}
    </div>
  );
};

export default Checkout;
