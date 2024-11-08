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
import { Snackbar, Alert } from "@mui/material"; // Adicione essas importações

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [cardPreview, setCardPreview] = useState({
    cardNumber: "•••• •••• •••• ••••",
    cardHolder: "NOME DO TITULAR",
    expiration: "MM/YY",
    securityCode: "",
  });

  const updateCardPreview = (field: string, value: string) => {
    setCardPreview((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      setSnackbarMessage(
        "Erro: Usuário não autenticado. Faça login para continuar."
      );
      setSnackbarOpen(true);
      navigate("/login", { state: { from: "/checkout" } }); // Redireciona com a rota de origem
      return;
    }

    const storedCheckoutData = localStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      setCheckoutData(JSON.parse(storedCheckoutData));
    } else {
      fetchUserDataFromAPI(storedUserId);
    }
  }, [navigate]);

  // Snackbar handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      alert("Erro: Usuário não autenticado. Faça login para continuar.");
      navigate("/login");
      return;
    }

    const storedCheckoutData = localStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      setCheckoutData(JSON.parse(storedCheckoutData));
    } else {
      fetchUserDataFromAPI(storedUserId);
    }
  }, [navigate]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      alert("Erro: Usuário não autenticado. Faça login para continuar.");
      navigate("/login");
      return;
    }

    const storedCheckoutData = localStorage.getItem("checkoutData");
    if (storedCheckoutData) {
      console.log("Checkout data retrieved:", storedCheckoutData);
      setCheckoutData(JSON.parse(storedCheckoutData));
    } else {
      fetchUserDataFromAPI(storedUserId);
    }
  }, [navigate]);

  // Função para carregar dados do usuário, caso necessário
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
        isCompleted: false, // Novo campo para controlar a finalização
      };
      setCheckoutData(userData);
      localStorage.setItem("checkoutData", JSON.stringify(userData));
    } catch (error) {
      alert("Não foi possível carregar os dados do usuário.");
    }
  };

  // Carrega o SDK do MercadoPago
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

  // Inicializa o formulário do MercadoPago
  useEffect(() => {
    if (sdkLoaded && mpInstance && selectedPaymentMethod === "card") {
      initializeCardForm();
    }
  }, [sdkLoaded, mpInstance, selectedPaymentMethod]);

  const handlePaymentSuccess = (
    method: string,
    qrCodeData: string | null = null,
    boletoUrlData: string | null = null
  ) => {
    // Atualiza o estado com o QR Code ou Boleto se estiver disponível
    if (method === "pix" && qrCodeData) {
      setPixQrCode(qrCodeData);
    } else if (method === "boleto" && boletoUrlData) {
      setBoletoUrl(boletoUrlData);
    }

    const updatedCheckoutData = { ...checkoutData, isCompleted: true };
    localStorage.setItem("checkoutData", JSON.stringify(updatedCheckoutData));

    // Limpa o carrinho e marca o pedido como concluído
    setCheckoutData({});
    clearCart();

    // Navega para a página de sucesso após uma pequena pausa para garantir que o estado foi atualizado
    setTimeout(() => {
      navigate("/sucesso", {
        state: {
          paymentMethod: method,
          pixQrCode: qrCodeData,
          boletoUrl: boletoUrlData,
        },
      });
      localStorage.removeItem("checkoutData");
    }, 100);
  };

  const initializeCardForm = () => {
    if (mpInstance && !cardFormInstance && formRef.current) {
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
          issuer: { id: "form-checkout__issuer" },
          installments: { id: "form-checkout__installments" },
          identificationType: { id: "form-checkout__identificationType" },
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
            setSnackbarMessage(
              "Erro ao processar o formulário. Por favor, tente novamente."
            );
            setSnackbarOpen(true);
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

  useEffect(() => {
    const fetchCheckoutData = async () => {
      const storedUserId = localStorage.getItem("userId");

      if (!storedUserId) {
        setSnackbarMessage(
          "Erro: Usuário não autenticado. Faça login para continuar."
        );
        setSnackbarOpen(true);
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      const storedCheckoutData = localStorage.getItem("checkoutData");
      if (storedCheckoutData) {
        setCheckoutData(JSON.parse(storedCheckoutData));
      } else {
        await fetchUserDataFromAPI(storedUserId);
      }
    };

    fetchCheckoutData();
  }, [navigate]);

  const handleCardSubmit = async (formData: any) => {
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
        first_name: formData.cardholderName?.split(" ")[0] || "",
        last_name: formData.cardholderName?.split(" ").slice(1).join(" ") || "",
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

      if (response.ok) {
        handlePaymentSuccess("card");
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
    const amount =
      parseFloat(checkoutData.amount.toString().replace(",", ".")) || 0;

    const shippingCost =
      parseFloat(checkoutData.shippingCost.toString().replace(",", ".")) || 0;

    const transactionAmount = amount + shippingCost;

    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      console.error("Valor de transaction_amount inválido:", transactionAmount);
      alert("Erro: valor de transação inválido.");
      return null; // Retorna null para indicar erro
    }

    return parseFloat(transactionAmount.toFixed(2)); // Retorna o valor com duas casas decimais
  };

  const generatePixQrCode = async () => {
    if (checkoutData.isCompleted) {
      alert("Este pedido já foi pago.");
      return;
    }

    const transactionAmount = calculateTransactionAmount();
    if (transactionAmount === null) return;

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
        const qrCodeData = `data:image/png;base64,${result.point_of_interaction.transaction_data.qr_code_base64}`;
        handlePaymentSuccess("pix", qrCodeData);
      } else {
        alert("Erro ao gerar QR code Pix: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao processar pagamento com Pix:", error);
      alert("Erro ao processar pagamento com Pix.");
    }
  };

  const generateBoleto = async () => {
    if (checkoutData.isCompleted) {
      alert("Este pedido já foi pago.");
      return;
    }

    const transactionAmount = calculateTransactionAmount();
    if (transactionAmount === null) return;

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
        handlePaymentSuccess("boleto", null, result.boleto_url);
      } else {
        alert(
          "Erro ao gerar boleto: " + (result.message || "Erro desconhecido")
        );
      }
    } catch (error) {
      console.error("Erro ao processar pagamento com boleto:", error);
      alert("Erro ao Processar Pagamento com boleto.");
    }
  };

  const isExpirationValid = (value: string) => {
    // Valida o formato MM/YY e checa se a data é válida e futura.
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;

    const [month, year] = value.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100; // Últimos dois dígitos do ano atual
    const currentMonth = new Date().getMonth() + 1;

    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false; // Data de expiração inválida ou no passado
    }

    return true;
  };

  const isCvcValid = (value: string) => {
    return /^\d{3,4}$/.test(value); // Valida 3 ou 4 dígitos numéricos
  };

  const isFormValid = () => {
    const isCardNumberValid =
      cardPreview.cardNumber.replace(/\s/g, "").length === 16;
    const expirationValid = isExpirationValid(cardPreview.expiration);
    const isCardHolderValid = cardPreview.cardHolder.trim().length > 0;
    const cvcValid = isCvcValid(cardPreview.securityCode);

    console.log("Validação: ", {
      isCardNumberValid,
      isExpirationValid: expirationValid,
      isCardHolderValid,
      isCvcValid: cvcValid,
    });

    return (
      isCardNumberValid && expirationValid && isCardHolderValid && cvcValid
    );
  };

  const handleContinue = async () => {
    if (selectedPaymentMethod === "pix") {
      await generatePixQrCode();
    } else if (selectedPaymentMethod === "boleto") {
      await generateBoleto();
    }
  };

  const formatExpirationDate = (value: string) => {
    return value
      .replace(/\D/g, "") // Remove não numéricos
      .replace(/(\d{2})(\d{2})/, "$1/$2") // Adiciona /
      .slice(0, 5); // Limita a 5 caracteres
  };

  const getCardBrandLogo = (cardNumber: string) => {
    if (cardNumber.startsWith("4")) {
      return "/bandeiras/visa.svg"; // Caminho para o logo da Visa
    } else if (cardNumber.startsWith("5")) {
      return "/bandeiras/master.png"; // Caminho para o logo da Mastercard
    } else if (cardNumber.startsWith("3")) {
      return "/bandeiras/amex.png"; // Caminho para o logo da Amex
    } else {
      return ""; // Caminho para um logo padrão
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "") // Remove não numéricos
      .replace(/(\d{4})(?=\d)/g, "$1 "); // Adiciona espaço a cada 4 dígitos
  };

  const formatCVC = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 3); // Apenas 3 dígitos numéricos
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

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

        {/* Botões de seleção de forma de pagamento */}
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

        {/* Exibição do cartão virtual somente quando "Cartão de Crédito" for selecionado */}
        {selectedPaymentMethod === "card" && (
          <>
            <Box
              sx={{
                width: "350px",
                height: "200px",
                backgroundColor: "#313926",
                color: "#FFF",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={getCardBrandLogo(cardPreview.cardNumber)}
                alt="Bandeira do cartão"
                sx={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  width: "50px",
                  display: getCardBrandLogo(cardPreview.cardNumber)
                    ? "block"
                    : "none",
                }}
              />

              <Box sx={{ fontSize: "1.5rem", letterSpacing: "3px" }}>
                {cardPreview.cardNumber || "**** **** **** ****"}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>{cardPreview.cardHolder || "NOME DO TITULAR"}</Box>
                <Box>
                  {formatExpirationDate(cardPreview.expiration) || "MM/YY"}
                </Box>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <form
                id="form-checkout"
                ref={formRef}
                onSubmit={handleCardSubmit}
              >
                <input
                  type="text"
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
                  type="text"
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
                  type="text"
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
                  type="text"
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
                  type="email"
                  id="form-checkout__cardholderEmail"
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
                <input
                  type="text"
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

                <Button
                  type="submit"
                  fullWidth
                  sx={{
                    backgroundColor:
                      !isMpReady || !isFormValid() ? "#B0B0B0" : "#313926",
                    color: "#FFF",
                    mt: 2,
                    "&:hover": {
                      backgroundColor:
                        !isMpReady || !isFormValid() ? "#B0B0B0" : "#2a2e24",
                    },
                  }}
                  disabled={!isMpReady || !isFormValid()} // Desabilita dinamicamente
                >
                  Pagar
                </Button>
              </form>
            </Box>
          </>
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

        {/* Informações detalhadas do resumo */}
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
