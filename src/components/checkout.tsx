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
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Checkout: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]); // Estado local do carrinho
  const [shippingCost, setShippingCost] = useState<number>(0); // Custo do frete
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");

  useEffect(() => {
    // Recupera o carrinho do localStorage
    const storedCart = localStorage.getItem("cart");
    const storedShipping = localStorage.getItem("shippingCost");

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    // Recupera o valor do frete do localStorage
    if (storedShipping) {
      setShippingCost(parseFloat(storedShipping));
    }
  }, []);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para finalizar a compra.");
      navigate("/login");
      return;
    }

    try {
      // Calcula o preço total, incluindo o custo de envio
      const totalPrice = cart.reduce(
        (total: number, product: CartItem) => total + product.price * product.quantity,
        0
      ) + shippingCost;

      console.log("Iniciando o processo de finalização do pedido...");
      console.log("Carrinho:", cart);
      console.log("Total:", totalPrice);
      console.log("Forma de Pagamento:", paymentMethod);

      // Faz a requisição para criar um novo pedido
      const response = await axios.post(
        "http://localhost:3001/orders",
        { products: cart, totalPrice, paymentMethod, shippingCost },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      console.log("Pedido finalizado com sucesso:", response.data);

      // Limpa o carrinho após finalizar a compra
      setCart([]);
      localStorage.removeItem("cart");
      localStorage.removeItem("shippingCost");

      // Navega para a página de confirmação do pedido
      navigate("/order-confirmation");
    } catch (err) {
      console.error("Erro ao finalizar o pedido:", err);
      alert("Erro ao finalizar o pedido.");
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };


  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
       {/* Botão de Voltar */}
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
        {/* Seleção de Método de Pagamento */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2, border: "1px solid #E6E3DB", borderRadius: "8px" }}>
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
                label="PIX"
              />
              <FormControlLabel
                value="Boleto Bancário"
                control={<Radio />}
                label="Boleto Bancário"
              />
              <FormControlLabel
                value="Cartão de Crédito"
                control={<Radio />}
                label="Cartão de Crédito"
              />
              <FormControlLabel
                value="NUPay"
                control={<Radio />}
                label="NUPay"
              />
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Resumo do Pedido */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2, border: "1px solid #E6E3DB", borderRadius: "8px" }}>
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
              Total dos Produtos: R$ {totalPrice.toFixed(2)}
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
              Total Geral: R$ {(totalPrice + shippingCost).toFixed(2)}
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
