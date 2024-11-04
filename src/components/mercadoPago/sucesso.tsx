import React, { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extrai os dados passados no `state`
  const paymentMethod = location.state?.paymentMethod || "Cartão de Crédito";
  const pixQrCode = location.state?.pixQrCode;
  const boletoUrl = location.state?.boletoUrl;

  // Verifica o que foi passado via state
  useEffect(() => {
    console.log("Dados recebidos no SuccessPage:", {
      paymentMethod,
      pixQrCode,
      boletoUrl,
    });
  }, [paymentMethod, pixQrCode, boletoUrl]);

  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        padding: 4,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />

      <Typography variant="h4" gutterBottom sx={{ color: "#4caf50", fontWeight: "bold" }}>
        Pagamento Realizado com Sucesso!
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ maxWidth: 600 }}>
        Obrigado por confiar na <strong>Nato Pisos</strong>! Sua compra foi concluída com sucesso, e estamos animados
        para que você aproveite nossos produtos. Em breve, você receberá um e-mail com todos os detalhes do seu pedido.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ color: "#555", marginTop: 2 }}>
        Método de Pagamento: {paymentMethod === "pix" ? "Pix" : paymentMethod === "boleto" ? "Boleto Bancário" : "Cartão de Crédito"}
      </Typography>

      {paymentMethod === "pix" && pixQrCode && (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h6">QR Code para Pagamento via Pix</Typography>
          <img src={pixQrCode} alt="QR Code Pix" style={{ marginTop: 10, width: 200, height: 200 }} />
        </Box>
      )}

      {paymentMethod === "boleto" && boletoUrl && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Clique no link abaixo para acessar seu boleto:</Typography>
          <a href={boletoUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10, display: "block", color: "#007bff" }}>
            Visualizar Boleto Bancário
          </a>
        </Box>
      )}

      <Button
        variant="contained"
        onClick={handleContinueShopping}
        sx={{
          mt: 3,
          backgroundColor: "#313926",
          color: "#fff",
          "&:hover": { backgroundColor: "#313926" },
          padding: "10px 20px",
          fontWeight: "bold",
        }}
      >
        Continuar Comprando
      </Button>

      <Button
        variant="outlined"
        onClick={handleContinueShopping}
        sx={{
          mt: 2,
          borderColor: "#313926",
          color: "#313926",
          padding: "10px 20px",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#e8f5e9",
            borderColor: "#313926",
          },
        }}
      >
        Voltar para a Página Inicial
      </Button>
    </Box>
  );
};

export default SuccessPage;
