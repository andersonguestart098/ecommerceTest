import React, { useEffect, useState } from "react";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme/CustomTheme";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import BannerUpload from "../components/BannerUpload";
import ProductForm from "../components/ProductForm";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import CartList from "../components/cartList";
import Checkout from "../components/checkout";
import { CartProvider } from "../contexts/CartContext"; // Importa o CartProvider

const App: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("http://localhost:3001/banners");
        const formattedImages = response.data.map((resource: any) => ({
          imageUrl: resource.imageUrl,
        }));
        setImages(formattedImages);
        setLoading(false);
      } catch (error) {
        setError("Erro ao buscar imagens de banners");
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {/* Envolva o CartProvider para que todos os componentes tenham acesso ao carrinho */}
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage images={images} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<ProductForm />} />
            <Route path="/cart" element={<CartList />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </CartProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
