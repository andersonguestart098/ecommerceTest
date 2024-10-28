import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Button,
  Divider,
  Grid,
  Radio,
  FormControlLabel,
  RadioGroup,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"; // Example for PIX
import ReceiptIcon from "@mui/icons-material/Receipt"; // Example for Boleto
import CreditCardIcon from "@mui/icons-material/CreditCard"; // Example for Credit Card

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Checkout: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const storedShipping = localStorage.getItem("shippingCost");

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    if (storedShipping) {
      setShippingCost(parseFloat(storedShipping));
    }
  }, []);

  useEffect(() => {
    const total =
      cart.reduce((acc, item) => acc + item.price * item.quantity, 0) +
      shippingCost;
    setTotalPrice(total);
  }, [cart, shippingCost]);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para finalizar a compra.");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/create-payment",
        {
          products: cart,
          totalPrice,
          paymentMethod,
          shippingCost,
          email: "usuario@teste.com",
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const paymentUrl = response.data.init_point;
      window.location.href = paymentUrl;
    } catch (err) {
      console.error("Erro ao finalizar o pedido:", err);
      alert("Erro ao finalizar o pedido.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <IconButton
        onClick={handleContinueShopping}
        sx={{
          color: "#313926",
          border: "1px solid #313926",
          marginBottom: "16px",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#313926", textAlign: "center" }}
      >
        <ShoppingCartIcon
          sx={{ fontSize: "2rem", verticalAlign: "middle", marginRight: 1 }}
        />
        Resumo do Pedido
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              border: "1px solid #E6E3DB",
              borderRadius: "8px",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Forma de Pagamento:
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="PIX"
                control={
                  <Radio
                    sx={{
                      color: "#313926",
                      "&.Mui-checked": { color: "#313926" },
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <img
                      src="/icons8-pix.svg"
                      alt="PIX Logo"
                      style={{ width: 56, height: 56 }}
                    />
                    <Typography>PIX</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                value="Boleto Bancário"
                control={
                  <Radio
                    sx={{
                      color: "#313926",
                      "&.Mui-checked": { color: "#313926" },
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <img
                      src="/icons8-boleto-64.png"
                      alt="Boleto Logo"
                      style={{ width: 56, height: 56 }}
                    />
                    <Typography>Boleto Bancário</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                value="Cartão de Crédito"
                control={
                  <Radio
                    sx={{
                      color: "#313926",
                      "&.Mui-checked": { color: "#313926" },
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <img
                      src="/icons8-mastercard-credit-card-80.png"
                      alt="Cartão de Crédito Logo"
                      style={{ width: 56, height: 56 }}
                    />
                    <Typography>Cartão de Crédito</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              border: "1px solid #E6E3DB",
              borderRadius: "8px",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Resumo do Pedido
            </Typography>
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
                    <Avatar
                      variant="square"
                      src={item.image}
                      alt={item.name}
                      sx={{ width: 60, height: 60, marginRight: 2 }}
                    />
                    <ListItemText
                      primary={
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#313926" }}
                        >
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ fontSize: "0.9rem" }}
                        >
                          Quantidade: {item.quantity} | Preço: R${" "}
                          {item.price.toFixed(2)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mt: 2, textAlign: "right" }}
            >
              Total dos Produtos: R$ {(totalPrice - shippingCost).toFixed(2)}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mt: 1, textAlign: "right" }}
            >
              Frete: R$ {shippingCost.toFixed(2)}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mt: 1, textAlign: "right" }}
            >
              Total Geral: R$ {totalPrice.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              fullWidth
              sx={{
                mt: 3,
                backgroundColor: "#313926",
                "&:hover": { backgroundColor: "#1d2721" },
                padding: "10px 0",
                fontSize: "1rem",
                fontWeight: "bold",
                position: "relative",
              }}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={24} /> : null}
            >
              {isLoading ? "Processando..." : "Finalizar Pedido"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Checkout;
