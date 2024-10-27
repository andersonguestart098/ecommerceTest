// SuccessPage.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <Box sx={{ padding: 3, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        🎉 Pagamento Realizado com Sucesso!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Obrigado pela sua compra! Você receberá um e-mail com os detalhes do pedido em breve.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleContinueShopping}
        sx={{ marginTop: 2 }}
      >
        Continuar Comprando
      </Button>
    </Box>
  );
};

export default SuccessPage;
