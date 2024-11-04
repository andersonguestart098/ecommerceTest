import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import ProductForm from "../components/ProductForm";
import BannerUpload from "../components/BannerUpload";

const Management: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<"product" | "banner" | null>(null);

  const handleSelectComponent = (component: "product" | "banner") => {
    setSelectedComponent(component);
  };

  return (
    <Box sx={{ padding: 4, textAlign: "center", backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ color: "#333", fontWeight: "bold" }}>
        Painel de Gerenciamento
      </Typography>
      
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
        <Button
          variant="contained"
          onClick={() => handleSelectComponent("product")}
          sx={{
            backgroundColor: selectedComponent === "product" ? "#313926" : "#E6E3DB",
            color: "#fff",
            fontWeight: "bold",
            transition: "background-color 0.3s ease",
            "&:hover": { backgroundColor: selectedComponent === "product" ? "#313926" : "#E6E3DB" },
          }}
        >
          Gerenciar Produtos
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSelectComponent("banner")}
          sx={{
            backgroundColor: selectedComponent === "banner" ? "#313926" : "#E6E3DB",
            color: "#fff",
            fontWeight: "bold",
            transition: "background-color 0.3s ease",
            "&:hover": { backgroundColor: selectedComponent === "banner" ? "#313926" : "#E6E3DB" },
          }}
        >
          Gerenciar Banners
        </Button>
      </Box>

      <Paper
        elevation={3}
        sx={{
          marginTop: 4,
          padding: 4,
          borderRadius: 2,
          backgroundColor: "#fff",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        {selectedComponent === "product" && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: "#333", fontWeight: "bold", marginBottom: 2 }}>
              Cadastro de Produtos
            </Typography>
            <ProductForm />
          </Box>
        )}
        {selectedComponent === "banner" && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: "#333", fontWeight: "bold", marginBottom: 2 }}>
              Upload de Banner
            </Typography>
            <BannerUpload />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Management;
