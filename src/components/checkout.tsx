import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
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
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);
  const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [userId, setUserId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

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
          const response = await axios.get(
            `https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/${storedUserId}`
          );
          setCheckoutData({
            firstName: response.data.name,
            lastName: response.data.last_name,
            email: response.data.email,
            identificationType: response.data.identification?.type || "CPF",
            identificationNumber:
              response.data.identification?.number || "00000000000",
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
              console.warn("Erro ao montar o formulário:", error);
            } else {
              setIsMpReady(true);
            }
          },
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
        first_name: formData.cardholderName
          ? formData.cardholderName.split(" ")[0]
          : "",
        last_name: formData.cardholderName
          ? formData.cardholderName.split(" ").slice(1).join(" ")
          : "",
        identification: {
          type: formData.identificationType,
          number: formData.identificationNumber,
        },
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

  const generateBoleto = async () => {
    if (!checkoutData.amount) {
      alert("Erro: o valor total do pedido não está definido.");
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
        setBoletoUrl(result.boleto_url); // Alteração para usar o campo correto 'boleto_url'
        setIsBoletoModalOpen(true);
      } else {
        console.error("Erro ao gerar boleto. Resposta:", result);
        alert("Erro ao gerar boleto.");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento com boleto:", error);
      alert("Erro ao processar pagamento com boleto.");
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
      <button
        onClick={() => {
          setSelectedPaymentMethod("boleto");
          generateBoleto();
        }}
      >
        Boleto Bancário
      </button>

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
