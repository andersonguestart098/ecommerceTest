import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ErrorIcon from "@mui/icons-material/Error";

interface LocationState {
  message?: string;
}

const FailurePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null; // Casting explícito

  const message = state?.message || "Infelizmente, ocorreu um problema ao processar seu pagamento. Por favor, verifique seus dados e tente novamente.";

  const handleRetryPayment = () => {
    navigate("/checkout");
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
      {/* Ícone de erro */}
      <ErrorIcon sx={{ fontSize: 80, color: "#f44336", mb: 2 }} />

      {/* Mensagem de falha no pagamento */}
      <Typography variant="h4" gutterBottom sx={{ color: "#f44336", fontWeight: "bold" }}>
        Pagamento Falhou
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ maxWidth: 600 }}>
        {message}
      </Typography>

      {/* Botão para tentar novamente */}
      <Button
        variant="contained"
        onClick={handleRetryPayment}
        sx={{
          mt: 3,
          backgroundColor: "#313926",
          color: "#fff",
          "&:hover": { backgroundColor: "#313926" },
          padding: "10px 20px",
          fontWeight: "bold",
        }}
      >
        Tentar Novamente
      </Button>

      {/* Botão para voltar à página inicial */}
      <Button
        variant="outlined"
        onClick={() => navigate("/")}
        sx={{
          mt: 2,
          borderColor: "#313926",
          color: "#313926",
          padding: "10px 20px",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#ffebee",
            borderColor: "#313926",
          },
        }}
      >
        Voltar para a Página Inicial
      </Button>
    </Box>
  );
};

export default FailurePage;
