import React, { useState, useEffect } from "react";
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
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const navigate = useNavigate();
  const [cepDestino, setCepDestino] = useState<string>("");
  const [freightOptions, setFreightOptions] = useState<any[]>([]);
  const [loadingFreight, setLoadingFreight] = useState<boolean>(false);
  const [selectedFreightOption, setSelectedFreightOption] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser.id);
      localStorage.setItem("userId", parsedUser.id);
    }
  }, []);

  const totalProductAmount = cart
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2);

  const handleCalculateFreight = async () => {
    setLoadingFreight(true);
    try {
      const tokenResponse = await axios.get(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/shipping/token"
      );
      const token = tokenResponse.data.token;

      const requestData = {
        cepOrigem: "01002001",
        cepDestino,
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
      alert("Erro ao calcular frete. Verifique o console para mais detalhes.");
    } finally {
      setLoadingFreight(false);
    }
  };

  const handleCheckout = () => {
    if (!selectedFreightOption) {
      alert("Por favor, selecione uma opção de frete antes de continuar.");
      return;
    }

    const freightPrice = Number(selectedFreightOption?.price || 0).toFixed(2);
    const totalPrice = (
      Number(totalProductAmount) + Number(freightPrice)
    ).toFixed(2);

    const items = cart.map((item) => ({
      productId: String(item.id),
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      description: item.description || "Produto sem descrição",
      category_id: item.category_id || "default",
    }));

    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        amount: totalPrice,
        totalPrice,
        items,
        userId,
      })
    );

    navigate("/checkout");
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <IconButton
        onClick={() => navigate("/")}
        sx={{
          color: "#313926",
          marginBottom: "16px",
          "&:hover": { backgroundColor: "#e0e0e0" },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          color: "#313926",
        }}
      >
        <ShoppingCartIcon
          sx={{ fontSize: "2rem", verticalAlign: "middle", marginRight: 1 }}
        />
        Meu Carrinho
      </Typography>
      {cart.length === 0 ? (
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ textAlign: "center", mt: 4 }}
        >
          Seu carrinho está vazio.
        </Typography>
      ) : (
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            maxWidth: 800,
            margin: "0 auto",
            mt: 3,
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <List>
            {cart.map((item) => (
              <div key={item.id}>
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      variant="square"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: 60,
                        height: 60,
                        marginRight: 2,
                        borderRadius: "8px",
                      }}
                    />
                    <ListItemText
                      primary={item.name}
                      secondary={`Quantidade: ${item.quantity}`}
                      primaryTypographyProps={{ fontWeight: "bold", color: "#313926" }}
                      secondaryTypographyProps={{ color: "#777" }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#313926" }}>
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton onClick={() => increaseQuantity(item.id)}>
                      <AddIcon />
                    </IconButton>
                    <IconButton onClick={() => decreaseQuantity(item.id)}>
                      <RemoveIcon />
                    </IconButton>
                    <IconButton onClick={() => removeFromCart(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
          <Box sx={{ padding: 2, backgroundColor: "#fafafa", mt: 2, borderRadius: "10px" }}>
            <TextField
              label="Insira seu CEP"
              value={cepDestino}
              onChange={(e) => setCepDestino(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 2, backgroundColor: "#fff" }}
            />
            <Button
              variant="contained"
              onClick={handleCalculateFreight}
              fullWidth
              sx={{
                backgroundColor: "#313926",
                "&:hover": { backgroundColor: "#282a2a" },
              }}
              disabled={loadingFreight}
            >
              {loadingFreight ? "Calculando..." : "Calcular Frete"}
            </Button>
            {freightOptions.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  maxHeight: 150,
                  overflowY: "auto",
                  borderRadius: "8px",
                  padding: 1,
                  backgroundColor: "#f1f1f1",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, color: "#313926" }}>
                  Opções de Frete Disponíveis:
                </Typography>
                <List>
                  {freightOptions.map((option) => (
                    <ListItem key={option.id}>
                      <ListItemButton
                        onClick={() => setSelectedFreightOption(option)}
                        selected={selectedFreightOption?.id === option.id}
                        sx={{
                          borderRadius: "8px",
                          "&.Mui-selected": {
                            backgroundColor: "#313926",
                            color: "#fff",
                            "& .MuiListItemText-primary": { color: "#fff" },
                            "& .MuiListItemText-secondary": { color: "#fff" },
                          },
                        }}
                      >
                        <ListItemText
                          primary={`${option.name} - R$ ${option.price}`}
                          secondary={`Prazo: ${option.delivery_time} dias úteis`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mt: 2,
                textAlign: "right",
                color: "#313926",
              }}
            >
              Valor Total do Pedido: R${" "}
              {(Number(totalProductAmount) + Number(selectedFreightOption?.price || 0)).toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              onClick={handleCheckout}
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: "#00b300",
                "&:hover": { backgroundColor: "#009900" },
              }}
            >
              Finalizar Compra
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CartList;
