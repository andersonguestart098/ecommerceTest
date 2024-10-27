// PendingPage.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PendingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <Box sx={{ padding: 3, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        ⏳ Pagamento Pendente
      </Typography>
      <Typography variant="body1" gutterBottom>
        Seu pagamento está em processo de análise. Você será notificado assim que for confirmado.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleReturnHome}
        sx={{ marginTop: 2 }}
      >
        Voltar para a Página Inicial
      </Button>
    </Box>
  );
};

export default PendingPage;
