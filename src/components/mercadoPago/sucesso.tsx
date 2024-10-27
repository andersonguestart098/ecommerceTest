import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

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
      {/* Ícone de sucesso */}
      <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />

      {/* Mensagem de sucesso e agradecimento */}
      <Typography variant="h4" gutterBottom sx={{ color: "#4caf50", fontWeight: "bold" }}>
        Pagamento Realizado com Sucesso!
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ maxWidth: 600 }}>
        Obrigado por confiar na <strong>Nato Pisos</strong>! Sua compra foi concluída com sucesso, e estamos animados para que você aproveite nossos produtos. Em breve, você receberá um e-mail com todos os detalhes do seu pedido.
      </Typography>

      {/* Botão para continuar comprando */}
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

      {/* Botão para retornar à página inicial */}
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
