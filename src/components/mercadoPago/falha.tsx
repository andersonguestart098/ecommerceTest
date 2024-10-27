// FailurePage.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const FailurePage: React.FC = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate("/checkout");
  };

  return (
    <Box sx={{ padding: 3, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        ❌ Pagamento Falhou
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ocorreu um problema ao processar o seu pagamento. Por favor, tente novamente.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleRetryPayment}
        sx={{ marginTop: 2 }}
      >
        Tentar Novamente
      </Button>
    </Box>
  );
};

export default FailurePage;
