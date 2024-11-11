import React, { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface LocationState {
  paymentMethod?: string;
  pixQrCode?: string;
  boletoUrl?: string;
}

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!state) {
      alert("Nenhuma informação de pagamento foi encontrada. Redirecionando para o checkout.");
      navigate("/checkout");
    } else {
      console.log("Dados recebidos no SuccessPage:", state);
    }

    if (state?.paymentMethod === "pix" && !state.pixQrCode) {
      console.error("QR Code não encontrado para Pix.");
    } else if (state?.paymentMethod === "boleto" && !state.boletoUrl) {
      console.error("Link do boleto não encontrado.");
    }
  }, [state, navigate]);

  const paymentMethod = state?.paymentMethod || "Cartão de Crédito";
  const pixQrCode = state?.pixQrCode;
  const boletoUrl = state?.boletoUrl;

  const handleContinueShopping = () => navigate("/");
  const handleMeusPedidos = () => navigate("/my-orders");

  const getPaymentMessage = () => {
    switch (paymentMethod) {
      case "pix":
        return "Por favor, realize o pagamento via Pix dentro do prazo de 30 minutos. O QR Code está disponível abaixo para concluir a transação.";
      case "boleto":
        return "Seu boleto bancário foi gerado. O pagamento deve ser efetuado até a data de vencimento indicada.";
      default:
        return "O pagamento foi confirmado e não é necessário nenhuma ação adicional. Aguarde a confirmação do envio do seu pedido.";
    }
  };

  return (
<Box
  sx={{
    paddingBottom: 4,
    textAlign: "center",
    minHeight: "80vh", // Reduzindo a altura mínima para 80% da tela
    marginTop: "-100px", // Ajustando a posição para subir o conteúdo
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  }}
>

      <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
      <Typography variant="h4" sx={{ color: "#4caf50", fontWeight: "bold", mb: 1 }}>
        Pedido Realizado com Sucesso!
      </Typography>
      <Typography variant="body1" sx={{ maxWidth: 600, mt: 2 }}>
        Obrigado por confiar na <strong>Nato Pisos</strong>! Acompanhe seu pedido em <b>MEUS PEDIDOS</b>.
      </Typography>
      <Typography variant="h6" sx={{ mt: 2, color: "#555" }}>
        Método de Pagamento: {paymentMethod === "pix" ? "Pix" : paymentMethod === "boleto" ? "Boleto Bancário" : "Cartão de Crédito"}
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 600, mt: 2 }}>{getPaymentMessage()}</Typography>

      {paymentMethod === "pix" && pixQrCode && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">QR Code para Pagamento via Pix</Typography>
          <img src={pixQrCode} alt="QR Code Pix" style={{ width: 200, height: 200, marginTop: 10 }} />
        </Box>
      )}

      {paymentMethod === "boleto" && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Acesse seu boleto:</Typography>
          {boletoUrl ? (
            <a
              href={boletoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#007bff" }}
            >
              Visualizar Boleto Bancário
            </a>
          ) : (
            <Typography color="error">
              O link do boleto não está disponível. Por favor, verifique seus pedidos ou entre em contato com o suporte.
            </Typography>
          )}
        </Box>
      )}

      <Button
        variant="contained"
        onClick={handleContinueShopping}
        sx={{
          mt: 3,
          maxWidth: 300,
          backgroundColor: "#313926",
          color: "#fff",
          '&:hover': { backgroundColor: "#E6E3DB", color: "#313926" },
        }}
      >
        Continuar Comprando
      </Button>
      <Button
        variant="outlined"
        onClick={handleMeusPedidos}
        sx={{
          mt: 2,
          maxWidth: 300,
          borderColor: "#313926",
          color: "#313926",
          '&:hover': { backgroundColor: "#E6E3DB", borderColor: "#E6E3DB" },
        }}
      >
        Ir para meus pedidos
      </Button>
    </Box>
  );
};

export default SuccessPage;
