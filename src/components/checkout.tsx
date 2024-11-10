import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Estados
  const [isMpReady, setIsMpReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [mpInstance, setMpInstance] = useState<any>(null);
  const [cardFormInstance, setCardFormInstance] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<any>({});
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [cardPreview, setCardPreview] = useState({
    cardNumber: "•••• •••• •••• ••••",
    cardHolder: "NOME DO TITULAR",
    expiration: "MM/YY",
  });
  

  useEffect(() => {
    console.log("Dados do checkout:", checkoutData);
  }, [checkoutData]);


  const formRef = useRef<HTMLFormElement | null>(null);

  const validateForm = (): boolean => {
    const fields = [
      "form-checkout__cardNumber",
      "form-checkout__expirationDate",
      "form-checkout__securityCode",
      "form-checkout__cardholderName",
      "form-checkout__cardholderEmail",
      "form-checkout__identificationNumber",
    ];

    let isValid = true;

    fields.forEach((fieldId) => {
      const field = document.getElementById(fieldId) as HTMLInputElement;
      if (!field?.value) {
        console.error(`Campo obrigatório faltando: ${fieldId}`);
        isValid = false;
      }
    });

    return isValid;
  };

  const calculateTransactionAmount = (): number | null => {
    try {
      const amount = parseFloat((checkoutData.amount || "0").replace(",", "."));
      const shippingCost = parseFloat((checkoutData.shippingCost || "0").replace(",", "."));
      const transactionAmount = amount + shippingCost;

      if (isNaN(transactionAmount) || transactionAmount <= 0) {
        throw new Error("Valor da transação inválido");
      }

      return parseFloat(transactionAmount.toFixed(2));
    } catch (error) {
      console.error("Erro ao calcular o valor da transação:", error);
      return null;
    }
  };

  useEffect(() => {
    const publicKey = "TEST-b5aec00c-9c26-47ec-b013-448dd8ffda2c";
    if (window.MercadoPago) {
      setMpInstance(new window.MercadoPago(publicKey, { locale: "pt-BR" }));
      setSdkLoaded(true);
    } else {
      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.onload = () => {
        setMpInstance(new window.MercadoPago(publicKey, { locale: "pt-BR" }));
        setSdkLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, []);

  
  useEffect(() => {
    if (sdkLoaded && mpInstance && selectedPaymentMethod === "card") {
      const amount = calculateTransactionAmount();

      if (!amount || amount <= 0) {
        console.error("Valor inválido para a transação");
        return;
      }

      const cardForm = mpInstance.cardForm({
        amount: amount,
        form: {
          id: "form-checkout",
          cardNumber: { id: "form-checkout__cardNumber" },
          expirationDate: { id: "form-checkout__expirationDate" },
          securityCode: { id: "form-checkout__securityCode" },
          cardholderName: { id: "form-checkout__cardholderName" },
          cardholderEmail: { id: "form-checkout__cardholderEmail" },
          installments: { id: "form-checkout__installments" },
          identificationType: { id: "form-checkout__identificationType" },
          identificationNumber: { id: "form-checkout__identificationNumber" },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) {
              console.error("Erro ao montar formulário:", JSON.stringify(error));
              alert("Erro ao montar formulário. Recarregue a página.");
            } else {
              setIsMpReady(true);
            }
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            try {
              const formData = await cardFormInstance?.createCardToken();
              handleCardSubmit(formData);
            } catch (err) {
              alert("Erro ao processar pagamento. Tente novamente.");
            }
          },
          onFetching: (resource: any) => {
            console.log(`Carregando recurso: ${resource}`);
          },
          onError: (error: any) => {
            console.error("Erro no cardForm:", JSON.stringify(error));
          },
        },
      });

      setCardFormInstance(cardForm);
    }
  }, [sdkLoaded, mpInstance, selectedPaymentMethod]);
  
  const handleCardSubmit = async (formData: any) => {
    try {
      const paymentData = {
        transaction_amount: calculateTransactionAmount(),
        token: formData.token,
        payment_method_id: formData.paymentMethodId,
        installments: Number(formData.installments || 1),
        issuer_id: formData.issuerId,
        description: "Compra via Cartão de Crédito",
        payer: {
          email: formData.cardholderEmail,
          first_name: formData.cardholderName.split(" ")[0],
        },
        userId: checkoutData.userId,
      };

      const response = await fetch("/payment/process_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "approved") {
          navigate("/sucesso", { state: { paymentMethod: "cartao" } });
        } else {
          navigate("/pendente");
        }
      } else {
        navigate("/falha");
      }
    } catch (error) {
      console.error(error);
      navigate("/falha");
    }
  };
  
  const handleContinue = async () => {
    if (selectedPaymentMethod === "pix") {
      await generatePixQrCode();
    } else if (selectedPaymentMethod === "boleto") {
      await generateBoleto();
    }
  };

  const generateBoleto = async () => {
    const transactionAmount = calculateTransactionAmount();

    if (!transactionAmount) return;

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
        navigate("/sucesso", { state: { paymentMethod: "boleto", boletoUrl: result.boleto_url } });
      } else {
        alert("Erro ao gerar boleto.");
      }
    } catch (error) {
      alert("Erro ao processar boleto.");
    }
  };

  const generatePixQrCode = async () => {
    const transactionAmount = calculateTransactionAmount();

    if (!transactionAmount) return;

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
      if (response.ok && result.qr_code_base64) {
        setPixQrCode(`data:image/png;base64,${result.qr_code_base64}`);
        clearCart();
        navigate("/sucesso", { state: { paymentMethod: "pix", pixQrCode: result.qr_code_base64 } });
      } else {
        alert("Erro ao gerar QR Code Pix.");
      }
    } catch (error) {
      alert("Erro ao processar Pix.");
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      alert("Erro: Usuário não autenticado. Faça login.");
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
      alert("Não foi possível carregar os dados.");
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

  if (!isMpReady && selectedPaymentMethod === "card") {
    return <Typography>Carregando formulário de pagamento...</Typography>;
  }

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
  <form
    id="form-checkout"
    ref={formRef}
    onSubmit={(e) => {
      e.preventDefault(); // Evitar refresh da página
      if (validateForm()) {
        cardFormInstance
          ?.createCardToken()
          .then((formData: any) => {
            handleCardSubmit(formData); // Submete os dados de pagamento
          })
          .catch((error: any) => {
            console.error("Erro ao criar token:", JSON.stringify(error, null, 2));
            alert("Erro ao processar o pagamento. Tente novamente.");
          });
      } else {
        console.error("Validação do formulário falhou!");
      }
    }}
  >
    <input id="form-checkout__cardNumber" placeholder="Número do cartão" />
    <input id="form-checkout__expirationDate" placeholder="MM/YY" />
    <input id="form-checkout__securityCode" placeholder="CVC" />
    <input id="form-checkout__cardholderName" placeholder="Nome do titular" />
    <input id="form-checkout__cardholderEmail" placeholder="E-mail" />
    <select id="form-checkout__issuer">
      <option value="">Selecione o banco emissor</option>
    </select>
    <select id="form-checkout__installments">
      <option value="">Número de parcelas</option>
    </select>
    <select id="form-checkout__identificationType">
      <option value="CPF">CPF</option>
    </select>
    <input id="form-checkout__identificationNumber" placeholder="Número do documento" />
  </form>
)}

<Button
  onClick={async () => {
    if (selectedPaymentMethod === "card") {
      if (validateForm() && formRef.current) {
        try {
          formRef.current.requestSubmit(); // Submete o form do cartão via botão "Continuar"
        } catch (err) {
          console.error("Erro ao submeter formulário:", JSON.stringify(err, null, 2));
        }
      } else {
        console.error("Validação do formulário falhou!");
      }
    } else {
      await handleContinue(); // Chama PIX ou Boleto dependendo
    }
  }}
  disabled={selectedPaymentMethod === "card" && !isMpReady}
  sx={{
    backgroundColor: "#313926",
    color: "#FFF",
    mt: 2,
    "&:hover": { backgroundColor: "#2a2e24" },
  }}
>
  Continuar
</Button>


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
