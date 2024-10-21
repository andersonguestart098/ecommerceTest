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
import { Box } from "@mui/material";
import OrderTrackingAdmin from "../components/OrderTrackingAdmin"; 
import OrderTrackingCustomer from "../components/OrderTrackingCustomer"; 
import ProductList from "../components/ProductList";

const App: React.FC = () => {
  const [images, setImages] = useState<{ imageUrl: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State to manage search filters (all as strings)
  const [filters, setFilters] = useState({
    searchTerm: "",
    color: "",
    minPrice: "",
    maxPrice: ""
  });

  // Update filters to accept strings for all properties
  const handleSearch = (searchTerm: string, color: string, minPrice: number | "", maxPrice: number | "") => {
    setFilters({
      searchTerm,
      color,
      minPrice: minPrice !== "" ? String(minPrice) : "",
      maxPrice: maxPrice !== "" ? String(maxPrice) : ""
    });
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("http://localhost:3001/banners");
        const formattedImages = response.data.map((resource: { imageUrl: string }) => ({
          imageUrl: resource.imageUrl,
        }));
        setImages(formattedImages);
      } catch (error) {
        console.error("Erro ao buscar imagens de banners:", error);
        setError("Erro ao buscar imagens de banners");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingTop: "94px" }}>
        <Router>
          <CartProvider>
            <Navbar onSearch={handleSearch} />
            <Box sx={{ marginTop: "0px" }}>
              <Routes>
                <Route path="/" element={<HomePage images={images} filters={filters} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/products" element={<ProductForm />} />
                <Route path="/cart" element={<CartList />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin/orders" element={<OrderTrackingAdmin />} />
                <Route path="/my-orders" element={<OrderTrackingCustomer />} />
                <Route path="/product-list" element={<ProductList {...filters} />} />
              </Routes>
            </Box>
          </CartProvider>
        </Router>
      </Box>
    </ThemeProvider>
  );
};

export default App;
