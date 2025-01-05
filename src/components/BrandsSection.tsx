import React from "react";
import { Box, Typography, Grid, Avatar } from "@mui/material";

const brands = [
  { name: "Quickstep", logo: "/icones/quickstep.png" },
  { name: "VinilForte", logo: "/icones/vinilforte.png" },
  { name: "Eucafloor", logo: "/icones/eucafloor.jpg" },
  { name: "Mapei", logo: "/icones/mapei.png" },
  { name: "Santa Luzia", logo: "/icones/santaLuzia.png" },
];

interface BrandsSectionProps {
  onBrandClick: (brandName: string) => void;
}


const BrandsSection: React.FC<BrandsSectionProps> = ({ onBrandClick }) => {
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
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              onClick={() => onBrandClick(brand.name)} // Chama a função ao clicar
              sx={{ cursor: "pointer" }}
            >
              <Avatar
                alt={brand.name}
                src={brand.logo}
                sx={{
                  width: 125,
                  height: 125,
                  backgroundColor: "white",
                  mb: 2,
                  border: "2px solid #E6E3DB",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                  },
                }}
                imgProps={{
                  style: {
                    objectFit: "contain",
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
