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
    <Box sx={{ padding: 4, textAlign: "center", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
      <Typography variant="h4" sx={{ color: "#4caf50", fontWeight: "bold" }}>
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
      {paymentMethod === "boleto" && boletoUrl && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Acesse seu boleto:</Typography>
          <a href={boletoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff" }}>Visualizar Boleto Bancário</a>
        </Box>
      )}

      <Button variant="contained" onClick={handleContinueShopping} sx={{ mt: 3, maxWidth: 300 }}>Continuar Comprando</Button>
      <Button variant="outlined" onClick={handleMeusPedidos} sx={{ mt: 2, maxWidth: 300 }}>Ir para meus pedidos</Button>
    </Box>
  );
};

export default SuccessPage;
