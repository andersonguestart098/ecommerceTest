import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false); // Controle para o carregamento do SDK
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [deviceId, setDeviceId] = useState<string | null>("default_device_id");
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [installmentOptions, setInstallmentOptions] = useState<number[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Executando useEffect para carregar dados iniciais");

    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser.id);
      console.log("ID do usuário capturado:", parsedUser.id);
    }

    const data = JSON.parse(localStorage.getItem("checkoutData") || "{}");
    setCheckoutData(data);
    console.log("Dados do checkout capturados:", data);

    if (!publicKey) {
      console.error("Chave pública do Mercado Pago não encontrada!");
      return;
    }

    console.log("Carregando SDK do Mercado Pago...");

    const loadMercadoPagoSdk = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.MercadoPago) {
          console.log("SDK do Mercado Pago já carregado");
          setSdkLoaded(true); // Marca o SDK como carregado
          resolve();
        } else {
          const scriptSdk = document.createElement("script");
          scriptSdk.src = "https://sdk.mercadopago.com/js/v2";
          scriptSdk.async = true;
          scriptSdk.onload = () => {
            console.log("SDK do Mercado Pago carregado com sucesso");
            setSdkLoaded(true); // Marca o SDK como carregado
            resolve();
          };
          scriptSdk.onerror = (error) => {
            console.error("Erro ao carregar o SDK:", error);
            reject(error);
          };
          document.body.appendChild(scriptSdk);
        }
      });
    };

    loadMercadoPagoSdk()
      .then(() => initializeMercadoPago())
      .catch((error) => console.error("Erro ao carregar o SDK:", error));
  }, [publicKey]);

  const initializeMercadoPago = async () => {
    console.log("Inicializando Mercado Pago...");
    const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });

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
  };

  // useEffect para montar o cardForm quando SDK está carregado e "Cartão" foi selecionado
  useEffect(() => {
    console.log("useEffect para configurar o cardForm");

    if (sdkLoaded && selectedPaymentMethod === "card" && publicKey) {
      console.log("Inicializando cardForm para pagamento com cartão");
      const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
      initializeCardForm(mp);
    } else {
      console.log("SDK não carregado ou selectedPaymentMethod não é 'card'");
    }
  }, [sdkLoaded, selectedPaymentMethod, publicKey, checkoutData.amount]);

  const initializeCardForm = (mp: any) => {
    console.log("Configurando o cardForm...");
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
          else {
            console.log("Formulário montado com sucesso");
            setIsMpReady(true);
          }
        },
        onSubmit: handleCardSubmit,
      },
    });
  };

  const handleCardSubmit = async (event: any) => {
    event.preventDefault();
    console.log("Submetendo formulário do cartão...");
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
        console.log("Pagamento aprovado");
        navigate("/sucesso");
      } else {
        console.warn("Pagamento pendente ou falhou:", response.data);
        alert("Pagamento pendente ou falhou. Verifique a transação.");
      }
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
      <button
        onClick={() => {
          console.log("Botão 'Cartão' clicado");
          setSelectedPaymentMethod("card");
        }}
      >
        Cartão
      </button>
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
    </div>
  );
};

export default Checkout;
