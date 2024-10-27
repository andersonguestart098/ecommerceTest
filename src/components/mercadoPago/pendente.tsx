// PendingPage.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

const PendingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
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
      {/* Ícone de pendente */}
      <HourglassEmptyIcon sx={{ fontSize: 80, color: "#ffa726", mb: 2 }} />

      {/* Mensagem de pagamento pendente */}
      <Typography variant="h4" gutterBottom sx={{ color: "#ffa726", fontWeight: "bold" }}>
        Pagamento Pendente
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ maxWidth: 600 }}>
        Seu pagamento está em processo de análise. Você será notificado assim que for confirmado.
      </Typography>

      {/* Botão para retornar à página inicial */}
      <Button
        variant="contained"
        onClick={handleReturnHome}
        sx={{
          mt: 3,
          backgroundColor: "#313926",
          color: "#fff",
          "&:hover": { backgroundColor: "#313926" },
          padding: "10px 20px",
          fontWeight: "bold",
        }}
      >
        Voltar para a Página Inicial
      </Button>
    </Box>
  );
};

export default PendingPage;
