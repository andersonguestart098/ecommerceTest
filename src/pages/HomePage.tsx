import React, { useState } from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import Banner from "../components/Banner";
import InfoSection from "../components/InfoSection";
import BrandsSection from "../components/BrandsSection";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";

interface HomePageProps {
  images: {
    imageUrl: string;
  }[];
  filters: {
    searchTerm: string;
    color: string;
    minPrice: string;
    maxPrice: string;
  };
}

const HomePage: React.FC<HomePageProps> = ({ images, filters }) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  // Atualiza o filtro com base na marca selecionada
  const handleBrandClick = (brandName: string) => {
    setSelectedBrand(brandName);
  };

  // Limpa o filtro de marca
  const clearFilter = () => {
    setSelectedBrand("");
  };

  // Combina os filtros de marca e barra de pesquisa
  const combinedSearchTerm = selectedBrand
    ? `${filters.searchTerm} ${selectedBrand}`.trim()
    : filters.searchTerm;

  return (
    <div className="home-page">
      {images.length > 0 ? <Banner images={images} /> : <div></div>}
      <InfoSection />

      {/* Seção de Marcas */}
      <BrandsSection onBrandClick={handleBrandClick} />

      {/* Botão de limpar filtro */}
      {selectedBrand && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            my: 3,
          }}
        >
          <Typography variant="h6" sx={{ marginRight: 2, fontWeight: "bold" }}>
            Mostrando produtos da marca: {selectedBrand}
          </Typography>
          <Button
            variant="outlined"
            onClick={clearFilter}
            sx={{
              color: "#313926",
              borderColor: "#313926",
              "&:hover": {
                backgroundColor: "#E6E3DB",
                borderColor: "#313926",
              },
            }}
          >
            Limpar Filtro
          </Button>
        </Box>
      )}

      {/* Lista de Produtos */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ProductList
          searchTerm={combinedSearchTerm}
          color={filters.color}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
        />
      </Container>

      <Footer />
    </div>
  );
};

export default HomePage;
