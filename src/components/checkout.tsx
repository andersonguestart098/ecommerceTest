import React, { useState } from "react";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
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
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para finalizar a compra.");
      navigate("/login");
      return;
    }

    try {
      const totalPrice = cart.reduce(
        (total, product) => total + product.price * product.quantity,
        0
      );

      console.log("Iniciando o processo de finalização do pedido...");
      console.log("Carrinho:", cart);
      console.log("Total:", totalPrice);
      console.log("Forma de Pagamento:", paymentMethod);

      const response = await axios.post(
        "http://localhost:3001/orders",
        { products: cart, totalPrice, paymentMethod },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      console.log("Pedido finalizado com sucesso:", response.data);
      clearCart();
      navigate("/order-confirmation");
    } catch (err) {
      console.error("Erro ao finalizar o pedido:", err);
      alert("Erro ao finalizar o pedido.");
    }
  };

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
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
        {/* Payment Method Selection */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Forma de Pagamento:
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="PIX"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src="/images/pix.png"
                      alt="PIX"
                      style={{ width: 30, height: 30, marginRight: 8 }}
                    />
                    PIX
                  </Box>
                }
              />
              <FormControlLabel
                value="Boleto Bancário"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src="/images/boleto.png"
                      alt="Boleto Bancário"
                      style={{ width: 30, height: 30, marginRight: 8 }}
                    />
                    Boleto Bancário
                  </Box>
                }
              />
              <FormControlLabel
                value="Cartão de Crédito"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src="/images/cartao.png"
                      alt="Cartão de Crédito"
                      style={{ width: 30, height: 30, marginRight: 8 }}
                    />
                    Cartão de Crédito
                  </Box>
                }
              />
              <FormControlLabel
                value="NUPay"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src="/images/nupay.png"
                      alt="NUPay"
                      style={{ width: 30, height: 30, marginRight: 8 }}
                    />
                    NUPay
                  </Box>
                }
              />
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
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
                          sx={{ fontWeight: "bold", color: "#1565c0" }}
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
            {/* Show selected payment method */}
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mt: 3, textAlign: "left" }}
            >
              Método de Pagamento:
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <img
                src={`/images/${paymentMethod.toLowerCase().replace(/\s/g, "")}.png`}
                alt={paymentMethod}
                style={{ width: 30, height: 30, marginRight: 8 }}
              />
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {paymentMethod}
              </Typography>
            </Box>
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
              }}
            >
              Finalizar Pedido
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Checkout;
