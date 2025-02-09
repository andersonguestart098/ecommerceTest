import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DiscountIcon from "@mui/icons-material/Discount";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

const InfoSection: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#E6E3DB",
        padding: "10px 0", // Padding ajustado para mais espaço em telas menores
        borderTop: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        {/* Frete Grátis */}
        <Grid item xs={12} sm={6} md={3} sx={{ textAlign: "center" }}>
          <LocalShippingIcon sx={{ fontSize: 32, color: "#313926" }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", fontSize: 14, color: "#313926" }}
          >
            Consultar Região
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: 12, color: "#313926" }}
          >
           Saiba Mais Sobre a Cobertura
          </Typography>
        </Grid>

        {/* Parcelamento */}
        <Grid item xs={12} sm={6} md={3} sx={{ textAlign: "center" }}>
          <CreditCardIcon sx={{ fontSize: 32, color: "#313926" }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", fontSize: 14, color: "#313926" }}
          >
            Parcelamento em até 3x
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: 12, color: "#313926" }}
          >
            No Cartão de Crédito
          </Typography>
        </Grid>

        {/* Desconto */}
        <Grid item xs={12} sm={6} md={3} sx={{ textAlign: "center" }}>
          <DiscountIcon sx={{ fontSize: 32, color: "#313926" }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", fontSize: 14, color: "#313926" }}
          >
            5% de Desconto
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: 12, color: "#313926" }}
          >
            À Vista no Pix
          </Typography>
        </Grid>

        {/* Devolução e Garantia */}
        <Grid item xs={12} sm={6} md={3} sx={{ textAlign: "center" }}>
          <VerifiedUserIcon sx={{ fontSize: 32, color: "#313926" }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", fontSize: 14, color: "#313926" }}
          >
            Devolução e Garantia
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: 12, color: "#313926" }}
          >
            7 Dias para Devolver sem Custo
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InfoSection;
