import React, { useState } from "react";
import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Paper,
  Avatar,
  IconButton,
  TextField,
  ListItemButton,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import axios from "axios";

const CartList: React.FC = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCart();
  const navigate = useNavigate();
  const [cepDestino, setCepDestino] = useState<string>("");
  const [freightOptions, setFreightOptions] = useState<any[]>([]);
  const [loadingFreight, setLoadingFreight] = useState<boolean>(false);
  const [selectedFreightOption, setSelectedFreightOption] = useState<any>(null);

  const totalProductAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const obterTokenAcesso = async (): Promise<string> => {
    try {
      const response = await axios.get(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/shipping/token"
      );
      return response.data.token;
    } catch (error) {
      console.error("Erro ao obter token de acesso:", error);
      throw new Error("Falha ao obter token de acesso");
    }
  };

  const handleCalculateFreight = async () => {
    setLoadingFreight(true);
    try {
      const token = await obterTokenAcesso();
      const requestData = {
        cepOrigem: "01002001",
        cepDestino: cepDestino,
        height: 4,
        width: 12,
        length: 17,
        weight: 0.3,
      };
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/shipping/calculate",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setFreightOptions(response.data);
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      alert("Erro ao calcular frete. Confira o console para mais detalhes.");
    } finally {
      setLoadingFreight(false);
    }
  };

  const handleCheckout = () => {
    if (!selectedFreightOption) {
      alert("Por favor, selecione uma opção de frete antes de continuar.");
      return;
    }

    const totalPrice = totalProductAmount + (selectedFreightOption?.price || 0);
    console.log("Salvando no localStorage:", {
      amount: totalProductAmount,
      totalPrice,
    });
    localStorage.setItem(
      "checkoutData",
      JSON.stringify({ amount: totalProductAmount, totalPrice })
    );

    navigate("/checkout");
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <IconButton
        onClick={() => navigate("/")}
        sx={{ color: "#313926", marginBottom: "16px" }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", textAlign: "center" }}
      >
        <ShoppingCartIcon
          sx={{ fontSize: "2rem", verticalAlign: "middle", marginRight: 1 }}
        />
        Meu Carrinho
      </Typography>
      {/* Conteúdo do Carrinho */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleCheckout}
        fullWidth
        sx={{ mt: 2 }}
      >
        Finalizar Compra
      </Button>
    </Box>
  );
};

export default CartList;
