import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [isMpReady, setIsMpReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [mpInstance, setMpInstance] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      alert("Erro: Usuário não autenticado. Faça login para continuar.");
      navigate("/login");
      return;
    }

    setUserId(storedUserId);

    const storedCheckoutData = localStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      setCheckoutData(JSON.parse(storedCheckoutData));
    } else {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/${storedUserId}`);
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
          alert("Não foi possível carregar os dados do usuário.");
        }
      };
      fetchUserData();
    }
  }, [navigate]);

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

  const generateBoleto = async () => {
    if (!checkoutData.amount || checkoutData.amount <= 0) {
      alert("Erro: o valor total do pedido não está definido ou é inválido.");
      return;
    }
  
    try {
      const response = await fetch(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
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
        }
      );
  
      const result = await response.json();
      if (response.ok && result.boleto_url) {
        setBoletoUrl(result.boleto_url);
        setIsBoletoModalOpen(true);
      } else {
        alert("Erro ao gerar boleto.");
      }
    } catch (error) {
      alert("Erro ao processar pagamento com boleto.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Resumo do Pedido</h2>
      <p>Total: R$ {checkoutData.amount}</p>
      <p>Frete: R$ {checkoutData.shippingCost}</p>
      <h3>Selecione a forma de pagamento</h3>
      <button onClick={() => setSelectedPaymentMethod("boleto")}>Boleto Bancário</button>

      {selectedPaymentMethod === "boleto" && (
        <button onClick={generateBoleto}>Gerar Boleto Bancário</button>
      )}

      <Modal
        isOpen={isBoletoModalOpen}
        onRequestClose={() => setIsBoletoModalOpen(false)}
        contentLabel="Boleto Bancário"
        style={{
          content: {
            maxWidth: "400px",
            margin: "auto",
            textAlign: "center",
            padding: "20px",
          },
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
        }}
      >
        <h3>Pagamento via Boleto Bancário</h3>
        <p>Utilize o link abaixo para acessar o boleto:</p>
        {boletoUrl && (
          <a href={boletoUrl} target="_blank" rel="noopener noreferrer">
            Visualizar Boleto
          </a>
        )}
        <button
          onClick={() => setIsBoletoModalOpen(false)}
          style={{
            marginTop: "10px",
            backgroundColor: "#d63031",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Fechar
        </button>
      </Modal>
    </div>
  );
};

export default Checkout;
