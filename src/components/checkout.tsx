import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [mpInstance, setMpInstance] = useState<any>(null);
  const [cardFormInstance, setCardFormInstance] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [userId, setUserId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log("User ID from localStorage:", storedUserId);  // Log User ID
    if (!storedUserId) {
      alert("Erro: Usuário não autenticado. Faça login para continuar.");
      navigate("/login");
      return;
    }
    setUserId(storedUserId);

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/${storedUserId}`
        );
        console.log("Dados do usuário carregados:", response.data);  // Log User Data
        setCheckoutData({
          firstName: response.data.name,
          lastName: response.data.last_name,
          email: response.data.email,
          identificationType: response.data.identification?.type || "CPF",
          identificationNumber: response.data.identification?.number || "00000000000",
          amount: response.data.totalPrice || 100.5,
          shippingCost: response.data.shippingCost || 0,
          userId: storedUserId,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        alert("Não foi possível carregar os dados do usuário.");
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const loadMercadoPagoSdk = async () => {
      console.log("Carregando SDK do Mercado Pago...");
      if (window.MercadoPago) {
        console.log("SDK já carregado.");
        setSdkLoaded(true);
        setMpInstance(new window.MercadoPago(publicKey, { locale: "pt-BR" }));
      } else {
        const scriptSdk = document.createElement("script");
        scriptSdk.src = "https://sdk.mercadopago.com/js/v2";
        scriptSdk.async = true;
        scriptSdk.onload = () => {
          console.log("SDK do Mercado Pago carregado com sucesso.");
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
    if (sdkLoaded && mpInstance && selectedPaymentMethod === "card" && !cardFormInstance) {
      initializeCardForm();
    }
  }, [sdkLoaded, mpInstance, selectedPaymentMethod, cardFormInstance]);

  const initializeCardForm = () => {
    if (mpInstance && formRef.current) {
      console.log("Inicializando CardForm...");
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
          issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
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
            if (error) {
              console.warn("Form Mounted handling error:", error);
            } else {
              console.log("Form mounted com sucesso");
              setIsMpReady(true);
            }
          },
          onSubmit: handleCardSubmit,
          onFetching: (resource: any) => {
            console.log("Fetching resource:", resource);
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
      setCardFormInstance(cardForm);
    }
  };

  const handleCardSubmit = async (event: any) => {
    event.preventDefault();
    if (!cardFormInstance) return;

    const formData = cardFormInstance.getCardFormData();
    console.log("Dados do cartão recebidos:", formData);

    if (!formData.token) {
      alert("Erro ao gerar token do cartão. Tente novamente.");
      return;
    }

    const paymentData = {
      token: formData.token,
      issuer_id: formData.issuerId,
      payment_method_id: formData.paymentMethodId,
      transaction_amount: Number(checkoutData.amount || 100.5),
      installments: Number(formData.installments || 1),
      description: "Descrição do produto",
      payer: {
        email: formData.cardholderEmail,
        first_name: formData.cardholderName ? formData.cardholderName.split(" ")[0] : "",
        last_name: formData.cardholderName ? formData.cardholderName.split(" ").slice(1).join(" ") : "",
        identification: {
          type: formData.identificationType,
          number: formData.identificationNumber,
        },
      },
      userId: checkoutData.userId,
    };

    console.log("Dados de pagamento a serem enviados:", paymentData);

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

      const result = await response.json();
      console.log("Resposta do pagamento:", result);

      if (response.ok) {
        console.log("Pagamento processado com sucesso.");
        navigate("/sucesso");
      } else {
        console.warn("Pagamento pendente ou falhou. Status:", response.status);
        alert("Pagamento pendente ou falhou.");
      }
    } catch (error) {
      console.error("Erro ao finalizar o pagamento:", error);
      alert("Erro ao finalizar o pagamento.");
    }
  };

  const generatePixQrCode = async () => {
    try {
      console.log("Gerando QR Code para Pix...");
  
      const response = await fetch(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_method_id: "pix",
            transaction_amount: Number(checkoutData.amount || 100.5),
            description: "Pagamento via Pix",
            payer: {
              email: checkoutData.email,
              first_name: checkoutData.firstName,
              last_name: checkoutData.lastName,
              identification: {
                type: checkoutData.identificationType,
                number: checkoutData.identificationNumber,
              },
            },
            userId: checkoutData.userId,
          }),
        }
      );
  
      const result = await response.json();
      console.log("Resposta do Mercado Pago:", result);
  
      if (response.ok && result.point_of_interaction?.transaction_data?.qr_code_base64) {
        setPixQrCode(`data:image/png;base64,${result.point_of_interaction.transaction_data.qr_code_base64}`);
      } else {
        console.warn("Erro ao gerar QR code Pix:", result);
        alert("Erro ao gerar QR code Pix.");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento com Pix:", error);
      alert("Erro ao processar pagamento com Pix.");
    }
  };
  

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
  <h2>Resumo do Pedido</h2>
  <p>Total: R$ {checkoutData.amount}</p>
  <p>Frete: R$ {checkoutData.shippingCost}</p>
  <h3>Selecione a forma de pagamento</h3>
  <button onClick={() => setSelectedPaymentMethod("card")}>Cartão</button>
  <button onClick={() => setSelectedPaymentMethod("pix")}>Pix</button>
  <button onClick={() => setSelectedPaymentMethod("boleto")}>Boleto Bancário</button>

  {selectedPaymentMethod === "card" && (
    <form id="form-checkout" ref={formRef} onSubmit={handleCardSubmit}>
      <div id="form-checkout__cardNumber" className="container"></div>
      <div id="form-checkout__expirationDate" className="container"></div>
      <div id="form-checkout__securityCode" className="container"></div>
      <input type="text" id="form-checkout__cardholderName" placeholder="Nome do titular" />
      <select id="form-checkout__issuer"></select>
      <select id="form-checkout__installments"></select>
      <select id="form-checkout__identificationType"></select>
      <input type="text" id="form-checkout__identificationNumber" placeholder="Número do documento" />
      <input type="email" id="form-checkout__cardholderEmail" placeholder="E-mail do titular" />
      <button type="submit" id="form-checkout__submit" disabled={!isMpReady}>Pagar</button>
      <progress value="0" className="progress-bar">Carregando...</progress>
    </form>
  )}

  {selectedPaymentMethod === "pix" && (
    <div>
      <button onClick={generatePixQrCode}>Gerar QR Code Pix</button>
      {pixQrCode && (
        <div>
          <h4>Escaneie o QR Code para pagamento via Pix</h4>
          <img src={pixQrCode} alt="QR Code Pix" style={{ width: "200px", height: "200px" }} />
        </div>
      )}
    </div>
  )}
</div>

  );
};

export default Checkout;
