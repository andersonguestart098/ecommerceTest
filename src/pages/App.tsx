import React, { useState, useEffect } from "react";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import theme from "../theme/CustomTheme";
import HomePage from "../pages/HomePage";
import BannerUpload from "../components/BannerUpload";
import ProductForm from "../components/ProductForm";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import CartList from "../components/cartList";
import Checkout from "../components/checkout";
import Navbar from "../components/Navbar";
import { CartProvider } from "../contexts/CartContext";
import { SocketProvider } from "../contexts/SocketContext";
import { Box } from "@mui/material";
import OrderTrackingAdmin from "../components/OrderTrackingAdmin";
import OrderTrackingCustomer from "../components/OrderTrackingCustomer";
import ProductList from "../components/ProductList";
import SuccessPage from "../components/mercadoPago/sucesso";
import FailurePage from "../components/mercadoPago/falha";
import PendingPage from "../components/mercadoPago/pendente";
import Management from "../components/gerenciador";
import MeusDados from "../components/MeusDados";
import WhatsAppIcon from '@mui/icons-material/WhatsApp'; // Importe o ícone do WhatsApp
import { Fab, Typography } from '@mui/material'; // Importe os componentes do Material-UI


const App: React.FC = () => {
  const [images, setImages] = useState<{ imageUrl: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const [filters, setFilters] = useState({
    searchTerm: "",
    color: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleSearch = (
    searchTerm: string,
    color: string,
    minPrice: number | "",
    maxPrice: number | ""
  ) => {
    setFilters({
      searchTerm,
      color,
      minPrice: minPrice !== "" ? String(minPrice) : "",
      maxPrice: maxPrice !== "" ? String(maxPrice) : "",
    });
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/banners"
        );
        const formattedImages = response.data.map(
          (resource: { imageUrl: string }) => ({
            imageUrl: resource.imageUrl,
          })
        );
        setImages(formattedImages);
      } catch (error) {
        console.error("Erro ao buscar imagens de banners:", error);
        setError("Erro ao buscar imagens de banners");
      }
    };
    fetchImages();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <ThemeProvider theme={theme}>
      <SocketProvider>
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            minHeight: "100vh",
            paddingTop: "94px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Router>
          <Box
  sx={{
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: 1,
    paddingBottom:15,
  }}
>
  <Typography
    variant="body2"
    sx={{
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      color: "#fff",
      padding: "12px 16px", // Aumentei o padding para destacar mais
      borderRadius: "20px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      fontSize: "0.90rem", // Aumentei o tamanho da fonte
      fontWeight: "bold", // Deixei o texto em negrito
    }}
  >
    Agende a visita do nosso instalador
  </Typography>
  <Fab
  color="primary"
  aria-label="whatsapp"
  onClick={() => window.open("https://wa.me/555198688559", "_blank")} // Número de WhatsApp formatado corretamente
  sx={{
    backgroundColor: "#25D366", // Cor do WhatsApp
    width: 56, // Tamanho do botão
    height: 56, // Tamanho do botão
    "&:hover": {
      backgroundColor: "#128C7E", // Cor ao passar o mouse
    },
  }}
>

    <WhatsAppIcon sx={{ color: "#fff", fontSize: "2rem" }} /> {/* Aumentei o tamanho do ícone */}
  </Fab>
</Box>
            <CartProvider>
              <Navbar
                onSearch={handleSearch}
                showSearch={showSearch}
                toggleSearch={toggleSearch}
              />
              <Box sx={{ marginTop: "0px", position: "relative", zIndex: 5 }}>
                <Routes>
                  <Route
                    path="/"
                    element={<HomePage images={images} filters={filters} />}
                  />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/products" element={<ProductForm />} />
                  <Route path="/cart" element={<CartList />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderTrackingAdmin />} />
                  <Route
                    path="/my-orders"
                    element={<OrderTrackingCustomer />}
                  />
                  <Route
                    path="/product-list"
                    element={<ProductList {...filters} />}
                  />
                  <Route path="/meus-dados" element={<MeusDados />} />
                  <Route path="/sucesso" element={<SuccessPage />} />
                  <Route path="/falha" element={<FailurePage />} />
                  <Route path="/pendente" element={<PendingPage />} />
                  <Route path="/admin" element={<Management />} />
                </Routes>
              </Box>
            </CartProvider>
          </Router>
        </Box>
      </SocketProvider>
    </ThemeProvider>
  );
};

export default App;
