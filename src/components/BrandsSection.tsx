import React from "react";
import { Box, Typography, Grid, Avatar } from "@mui/material";

const brands = [
  { name: "Arquitech", logo: "/produtos/icones/arquitech.png" },
  { name: "Quickstep", logo: "/produtos/icones/quickstep.png" },
  { name: "Eucafloor", logo: "/produtos/icones/eucafloor.jpg" },
  { name: "Santa Luzia", logo: "/produtos/icones/santaLuzia.png" },
];

const BrandsSection = () => {
  return (
    <Box sx={{ py: 5 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#313926" }}
      >
        As Melhores Marcas
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {brands.map((brand, index) => (
          <Grid item key={index} xs={6} sm={4} md={3} lg={2}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                alt={brand.name}
                src={brand.logo}
                sx={{
                  width: 125,
                  height: 125,
                  mb: 2,
                  border: "2px solid #E6E3DB", // Borda leve
                  transition: "transform 0.3s ease, box-shadow 0.3s ease", // Animação suave
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // Sombra inicial
                  "&:hover": {
                    transform: "translateY(-10px)", // Efeito de elevação
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)", // Sombra mais intensa no hover
                  },
                }}
                imgProps={{
                  style: {
                    objectFit: "contain", // Mantém a imagem com as proporções originais
                  },
                }}
              />
              <Typography
                variant="body1"
                align="center"
                sx={{ fontSize: 18, color: "#313926" }}
              >
                {brand.name}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BrandsSection;
