import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import {
  Box,
  Typography,
  Button,
  TextField,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";

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
  const { clearCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  const [cardPreview, setCardPreview] = useState({
    cardNumber: "•••• •••• •••• ••••",
    cardHolder: "NOME DO TITULAR",
    expiration: "MM/YY",
  });

  const updateCardPreview = (field: string, value: string) => {
    setCardPreview((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      alert("Erro: Usuário não autenticado. Faça login para continuar.");
      navigate("/login");
      return;
    }

    const storedOrderStatus = localStorage.getItem("orderCompleted");
    if (storedOrderStatus === "true") {
      setIsOrderCompleted(true);
    } else {
      const storedCheckoutData = localStorage.getItem("checkoutData");
      if (storedCheckoutData) {
        console.log("Checkout data retrieved:", storedCheckoutData);
        setCheckoutData(JSON.parse(storedCheckoutData));
      } else {
        fetchUserDataFromAPI(storedUserId);
      }
    }
  }, [navigate]);

  const fetchUserDataFromAPI = async (userId: string) => {
    try {
      const response = await axios.get(
        `https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/${userId}`
      );
      const userData = {
        firstName: response.data.name,
        lastName: response.data.last_name,
        email: response.data.email,
        identificationType: response.data.identification?.type || "CPF",
        identificationNumber:
          response.data.identification?.number || "00000000000",
        amount: response.data.totalPrice || 100.5,
        shippingCost: response.data.shippingCost || 0,
        userId: userId,
      };
      console.log("User data fetched:", userData);
      setCheckoutData(userData);
      localStorage.setItem("checkoutData", JSON.stringify(userData));
    } catch (error) {
      alert("Não foi possível carregar os dados do usuário.");
    }
  };

  useEffect(() => {
    const loadMercadoPagoSdk = async () => {
      if (!publicKey) {
        console.error("Public key não está definida.");
        return;
      }

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
        scriptSdk.onerror = () => {
          console.error("Erro ao carregar o SDK do MercadoPago.");
        };
        document.body.appendChild(scriptSdk);
      }
    };

    loadMercadoPagoSdk();
  }, [publicKey]);

  useEffect(() => {
    if (sdkLoaded && mpInstance && selectedPaymentMethod === "card") {
      initializeCardForm();
    }
  }, [sdkLoaded, mpInstance, selectedPaymentMethod]);

  const initializeCardForm = () => {
    if (mpInstance && formRef.current) {
      const formattedAmount = String(
        (checkoutData.amount || 100.5).toString().replace(",", ".")
      );

      const cardForm = mpInstance.cardForm({
        amount: formattedAmount,
        form: {
          id: "form-checkout",
          cardNumber: { id: "form-checkout__cardNumber" },
          expirationDate: { id: "form-checkout__expirationDate" },
          securityCode: { id: "form-checkout__securityCode" },
          cardholderName: { id: "form-checkout__cardholderName" },
          issuer: { id: "form-checkout__issuer" }, // Este deve ser um <select>
          installments: { id: "form-checkout__installments" }, // Este deve ser um <select>
          identificationType: { id: "form-checkout__identificationType" }, // Este deve ser um <select>
          identificationNumber: { id: "form-checkout__identificationNumber" },
          cardholderEmail: { id: "form-checkout__cardholderEmail" },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) {
              console.warn("Erro ao montar formulário:", error);
            } else {
              setIsMpReady(true);
            }
          },
          onError: (error: any) => {
            console.error("Erro no cardForm:", error);
          },
          onSubmit: async () => {
            const formData = cardForm.getCardFormData();
            if (!formData.token) {
              console.warn("Token não gerado, revise os campos do formulário.");
              return;
            }
            handleCardSubmit(formData);
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
    if (!formData.token || !formData.installments || !formData.issuerId) {
      alert("Por favor, preencha todos os campos obrigatórios.");
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

    console.log("Payment data being sent:", paymentData);

    try {
      const response = await fetch(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );

      if (response.ok) {
        clearCart();
        navigate("/sucesso", { state: { paymentMethod: "card" } });
      } else {
        alert("Pagamento pendente ou falhou.");
      }
    } catch (error) {
      console.error("Erro ao finalizar o pagamento:", error);
      alert("Erro ao finalizar o pagamento.");
    }
  };

  const calculateTransactionAmount = () => {
    // Garantindo que o transaction_amount é um número, incluindo frete
    const amount = parseFloat(checkoutData.amount.replace(",", ".")) || 0;
    const shippingCost =
      parseFloat(checkoutData.shippingCost.replace(",", ".")) || 0;
    const transactionAmount = amount + shippingCost;

    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      console.error("Valor de transaction_amount inválido:", transactionAmount);
      alert("Erro: valor de transação inválido.");
      return null; // Retorna null para indicar erro
    }

    return transactionAmount; // Retorna o valor válido
  };

  const markOrderAsCompleted = () => {
    localStorage.setItem("orderCompleted", "true");
    setIsOrderCompleted(true);
  };

  const clearCheckoutData = () => {
    setCheckoutData({
      amount: 0,
      shippingCost: 0,
      email: "",
      firstName: "",
      lastName: "",
      identificationType: "",
      identificationNumber: "",
      userId: null,
    });
    localStorage.removeItem("checkoutData");
  };

  const generatePixQrCode = async () => {
    const transactionAmount = calculateTransactionAmount();
    if (transactionAmount === null) {
      return;
    }

    try {
      const response = await fetch(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/process_payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_method_id: "pix",
            transaction_amount: transactionAmount,
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
      if (
        response.ok &&
        result.point_of_interaction?.transaction_data?.qr_code_base64
      ) {
        setPixQrCode(
          `data:image/png;base64,${result.point_of_interaction.transaction_data.qr_code_base64}`
        );
        clearCart();
        clearCheckoutData();
        markOrderAsCompleted();
        navigate("/sucesso", {
          state: { paymentMethod: "pix" },
        });
      } else {
        alert("Erro ao gerar QR code Pix: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao processar pagamento com Pix:", error);
      alert("Erro ao processar pagamento com Pix.");
    }
  };

  const generateBoleto = async () => {
    const transactionAmount = calculateTransactionAmount();
    if (transactionAmount === null) {
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
            transaction_amount: transactionAmount,
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
        clearCart();
        clearCheckoutData();
        markOrderAsCompleted();
        navigate("/sucesso", {
          state: { paymentMethod: "boleto" },
        });
      } else {
        alert(
          "Erro ao gerar boleto: " + (result.message || "Erro desconhecido")
        );
      }
    } catch (error) {
      console.error("Erro ao processar pagamento com boleto:", error);
      alert("Erro ao processar pagamento com boleto.");
    }
  };

  const handleReturnToHome = () => {
    navigate("/");
  };

  if (isOrderCompleted) {
    return (
      <Box sx={{ textAlign: "center", padding: "20px" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Compra já realizada com sucesso!
        </Typography>
        <Button
          variant="contained"
          onClick={handleReturnToHome}
          sx={{ backgroundColor: "#313926", color: "#fff" }}
        >
          Voltar para a Página Inicial
        </Button>
      </Box>
    );
  }

  const handleContinue = async () => {
    if (selectedPaymentMethod === "pix") {
      await generatePixQrCode();
    } else if (selectedPaymentMethod === "boleto") {
      await generateBoleto();
    }
  };

  const paymentButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px",
    marginBottom: "10px",
    border: isSelected ? "2px solid #313926" : "1px solid #E6E3DB",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: isSelected ? "#E6E3DB" : "#FFF",
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        gap: "20px",
      }}
    >
      <Box
        sx={{
          flex: 1,
          padding: "20px",
          border: "1px solid #E6E3DB",
          borderRadius: "8px",
          backgroundColor: "#F9F9F7",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#313926" }}
        >
          Forma de Pagamento
        </Typography>

        {selectedPaymentMethod === "card" && (
          <Box
            sx={{
              backgroundColor: "#313926",
              color: "#FFF",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <Typography variant="body2">{cardPreview.cardNumber}</Typography>
            <Typography variant="body2">{cardPreview.cardHolder}</Typography>
            <Typography variant="body2">{cardPreview.expiration}</Typography>
          </Box>
        )}

        <Box
          onClick={() => setSelectedPaymentMethod("pix")}
          sx={paymentButtonStyle(selectedPaymentMethod === "pix")}
        >
          <span>Pix</span>
        </Box>
        <Box
          onClick={() => setSelectedPaymentMethod("boleto")}
          sx={paymentButtonStyle(selectedPaymentMethod === "boleto")}
        >
          <span>Boleto Bancário</span>
        </Box>
        <Box
          onClick={() => setSelectedPaymentMethod("card")}
          sx={paymentButtonStyle(selectedPaymentMethod === "card")}
        >
          <span>Cartão de Crédito</span>
        </Box>

        {selectedPaymentMethod === "card" && (
          <Box sx={{ mt: 2 }}>
            <form id="form-checkout" ref={formRef}>
              <input
                id="form-checkout__cardNumber"
                placeholder="Número do Cartão"
                style={{
                  marginBottom: "16px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                id="form-checkout__expirationDate"
                placeholder="MM/YY"
                style={{
                  marginBottom: "16px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                id="form-checkout__securityCode"
                placeholder="CVC"
                style={{
                  marginBottom: "16px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                id="form-checkout__cardholderName"
                placeholder="Nome do Titular"
                style={{
                  marginBottom: "16px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                id="form-checkout__identificationNumber"
                placeholder="Número do Documento"
                style={{
                  marginBottom: "16px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                id="form-checkout__cardholderEmail"
                type="email"
                placeholder="E-mail"
                style={{
                  marginBottom: "16px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />

              <select
                id="form-checkout__issuer"
                style={{ display: "none" }}
              ></select>
              <select
                id="form-checkout__installments"
                style={{ display: "none" }}
              ></select>
              <select
                id="form-checkout__identificationType"
                style={{ display: "none" }}
              ></select>

              <Button
                type="submit"
                fullWidth
                sx={{
                  backgroundColor: isMpReady ? "#313926" : "#B0B0B0",
                  color: "#FFF",
                  mt: 2,
                  "&:hover": {
                    backgroundColor: isMpReady ? "#2a2e24" : "#B0B0B0",
                  },
                }}
                disabled={!isMpReady}
              >
                Pagar
              </Button>
            </form>
          </Box>
        )}

        {selectedPaymentMethod !== "card" && (
          <Button
            onClick={handleContinue}
            sx={{
              backgroundColor: "#313926",
              color: "#FFF",
              width: "100%",
              mt: 2,
              "&:hover": { backgroundColor: "#2a2e24" },
            }}
          >
            Continuar
          </Button>
        )}
      </Box>

      <Box
        sx={{
          width: isMobile ? "100%" : "300px",
          padding: "20px",
          border: "1px solid #E6E3DB",
          borderRadius: "8px",
          backgroundColor: "#F9F9F7",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#313926", mb: 2 }}
        >
          Resumo
        </Typography>

        {/* Alinhamento à esquerda e linha sutil */}
        <Box sx={{ textAlign: "left", mb: 1 }}>
          <Typography>
            Valor dos Produtos: R$ {checkoutData.amount || "0,00"}
          </Typography>
          <Divider sx={{ borderColor: "#E6E3DB", my: 1 }} />
          <Typography>
            Descontos: R$ {checkoutData.discount || "0,00"}
          </Typography>
          <Divider sx={{ borderColor: "#E6E3DB", my: 1 }} />
          <Typography>
            Frete: R$ {checkoutData.shippingCost || "0,00"}
          </Typography>
        </Box>

        {/* Cálculo do total com conversão de string para número */}
        <Typography sx={{ fontWeight: "bold", mt: 1 }}>
          Total: R${" "}
          {(
            (parseFloat((checkoutData.amount || "0,00").replace(",", ".")) ||
              0) -
            (parseFloat((checkoutData.discount || "0,00").replace(",", ".")) ||
              0) +
            (parseFloat(
              (checkoutData.shippingCost || "0,00").replace(",", ".")
            ) || 0)
          )
            .toFixed(2)
            .replace(".", ",")}
        </Typography>
      </Box>
    </Box>
  );
};

export default Checkout;
