import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext"; // Importa o hook useCart


const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [mpInstance, setMpInstance] = useState<any>(null);
  const [cardFormInstance, setCardFormInstance] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [userId, setUserId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const { clearCart } = useCart();


  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      alert("Erro: Usuário não autenticado. Faça login para continuar.");
      navigate("/login");
      return;
    }

    setUserId(storedUserId);
    console.log("User ID:", storedUserId);

    const storedCheckoutData = localStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      console.log("Carregando dados do checkout do localStorage.");
      const parsedData = JSON.parse(storedCheckoutData);
      console.log("Dados carregados:", parsedData);
      setCheckoutData(parsedData);
    } else {
      fetchUserDataFromAPI(storedUserId);
    }
  }, [navigate]);

  const fetchUserDataFromAPI = async (userId: string) => {
    try {
      const response = await axios.get(`https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/${userId}`);
      const userData = {
        firstName: response.data.name,
        lastName: response.data.last_name,
        email: response.data.email,
        identificationType: response.data.identification?.type || "CPF",
        identificationNumber: response.data.identification?.number || "00000000000",
        amount: response.data.totalPrice || 100.5,
        shippingCost: response.data.shippingCost || 0,
        userId: userId,
      };
      setCheckoutData(userData);
      localStorage.setItem("checkoutData", JSON.stringify(userData));
    } catch (error) {
      console.error("Erro ao carregar os dados do usuário:", error);
      alert("Não foi possível carregar os dados do usuário.");
    }
  };

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
    if (sdkLoaded && mpInstance && selectedPaymentMethod === "card" && !cardFormInstance) {
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
          cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número do cartão" },
          expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/YY" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "Código de segurança" },
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nome do titular" },
          issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
          installments: { id: "form-checkout__installments", placeholder: "Número de parcelas" },
          identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de documento" },
          identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Número do documento" },
          cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "E-mail do titular" },
        },
        callbacks: {
          onFormMounted: (error: any) => error ? console.warn("Erro ao montar o formulário:", error) : setIsMpReady(true),
          onSubmit: handleCardSubmit,
        },
      });
      setCardFormInstance(cardForm);
    }
  };

  const handleCardSubmit = async (event: any) => {
    event.preventDefault();
    if (!cardFormInstance) return;

    const formData = cardFormInstance.getCardFormData();
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
        identification: { type: formData.identificationType, number: formData.identificationNumber },
      },
      userId: checkoutData.userId,
    };

    try {
      const response = await fetch(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        navigate("/sucesso");
      } else {
        alert("Pagamento pendente ou falhou.");
      }
    } catch (error) {
      alert("Erro ao finalizar o pagamento.");
    }
  };

  const generatePixQrCode = async () => {
    try {
      const response = await fetch("https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method_id: "pix",
          transaction_amount: Number(checkoutData.amount),
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
      });
  
      const result = await response.json();
      if (response.ok && result.point_of_interaction?.transaction_data?.qr_code_base64) {
        return `data:image/png;base64,${result.point_of_interaction.transaction_data.qr_code_base64}`;
      } else {
        alert("Erro ao gerar QR code Pix.");
      }
    } catch (error) {
      alert("Erro ao processar pagamento com Pix.");
    }
    return null;
  };
  
  const generateBoleto = async () => {
    try {
      const response = await fetch("https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method_id: "bolbradesco",
          transaction_amount: Number(checkoutData.amount),
          description: "Pagamento via Boleto Bancário",
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
      });
  
      const result = await response.json();
      if (response.ok && result.boleto_url) {
        return result.boleto_url;
      } else {
        alert("Erro ao gerar boleto.");
      }
    } catch (error) {
      alert("Erro ao processar pagamento com boleto.");
    }
    return null;
  };
  
  
  const handleContinue = async () => {
    let pixQrCode = null;
    let boletoUrl = null;
  
    if (selectedPaymentMethod === "pix") {
      pixQrCode = await generatePixQrCode();
    } else if (selectedPaymentMethod === "boleto") {
      boletoUrl = await generateBoleto();
    }
  
    clearCart(); // Limpa o carrinho após o pagamento ser concluído
  
    navigate("/sucesso", { 
      state: { 
        paymentMethod: selectedPaymentMethod,
        pixQrCode,
        boletoUrl
      } 
    });
  };
  
  

  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  };

  const paymentMethodsStyle = {
    flex: 1,
    marginRight: "20px",
    padding: "20px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
  };

  const summaryStyle: React.CSSProperties = {
    width: "300px",
    padding: "20px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    textAlign: "center" as "center",
  };

  const buttonStyle = {
    display: "block",
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    backgroundColor: "#FF6F00",
    color: "#FFF",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const paymentButtonStyle = (isSelected: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "15px",
    marginBottom: "10px",
    border: isSelected ? "2px solid #FF6F00" : "1px solid #e0e0e0",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: isSelected ? "#FFF6E0" : "#FFF",
  });

  return (
    <div style={containerStyle}>
    <div style={paymentMethodsStyle}>
      <h2>Forma de Pagamento</h2>
      
      {/* Seleção de método de pagamento */}
      <div style={paymentButtonStyle(selectedPaymentMethod === "pix")} onClick={() => setSelectedPaymentMethod("pix")}>
        <span>Pix</span>
      </div>
      <div style={paymentButtonStyle(selectedPaymentMethod === "boleto")} onClick={() => setSelectedPaymentMethod("boleto")}>
        <span>Boleto Bancário</span>
        {selectedPaymentMethod === "boleto" && (
          <p style={{ fontSize: "12px", color: "#555" }}>
            Até 5% de desconto. Você poderá visualizar ou imprimir o boleto após a finalização do pedido.
          </p>
        )}
      </div>
      <div style={paymentButtonStyle(selectedPaymentMethod === "card")} onClick={() => setSelectedPaymentMethod("card")}>
        <span>Cartão de Crédito</span>
      </div>

      {/* Formulário de cartão */}
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
    </div>

    <div style={summaryStyle}>
      <h2>Resumo</h2>
      <p>Valor dos Produtos: R$ {checkoutData.amount}</p>
      <p>Descontos: R$ {checkoutData.discount || "0,00"}</p>
      <p>Frete: R$ {checkoutData.shippingCost}</p>
      <p>
        <strong>Total: R$ {checkoutData.amount - (checkoutData.discount || 0)}</strong>
      </p>
      
      {/* Botão Continuar com a nova função */}
      <button style={buttonStyle} onClick={handleContinue}>
        Continuar
      </button>
      
      <button
        style={{ ...buttonStyle, backgroundColor: "#ddd", color: "#333", marginTop: "10px" }}
        onClick={() => navigate("/cart")}
      >
        Voltar
      </button>
    </div>
  </div>
  );
};

export default Checkout;
