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
  TextField,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { initMercadoPago, CardForm } from "@mercadopago/sdk-js";

// Inicializa o SDK do Mercado Pago
initMercadoPago(process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY!);

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
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");
  const navigate = useNavigate();

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

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para finalizar a compra.");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    const cardFormData = {
      cardholderName: (
        document.getElementById("cardholderName") as HTMLInputElement
      ).value,
      cardNumber: (document.getElementById("cardNumber") as HTMLInputElement)
        .value,
      expirationDate: (
        document.getElementById("expirationDate") as HTMLInputElement
      ).value,
      securityCode: (
        document.getElementById("securityCode") as HTMLInputElement
      ).value,
      installments: 1, // ou o número de parcelas escolhido
      identificationType: "CPF", // ou outro tipo de identificação
      identificationNumber: "12345678909",
    };

    try {
      // Gera o token usando o SDK do Mercado Pago
      const cardForm = new CardForm({
        amount: totalPrice.toString(),
        form: {
          id: "form-checkout",
          cardholderName: { id: "cardholderName" },
          cardNumber: { id: "cardNumber" },
          expirationDate: { id: "expirationDate" },
          securityCode: { id: "securityCode" },
          installments: { id: "installments" },
          identificationType: { id: "identificationType" },
          identificationNumber: { id: "identificationNumber" },
        },
      });

      const { token: cardToken } = await cardForm.createCardToken();

      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/payment/create-transparent",
        {
          token: cardToken,
          transactionAmount: totalPrice,
          description: "Compra de produtos",
          installments: 1,
          paymentMethodId: paymentMethod,
          email: "usuario@teste.com",
          shippingCost,
          products: cart,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.data.status === "approved") {
        navigate("/sucesso");
      } else {
        alert("Pagamento pendente ou falhou. Verifique sua transação.");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao finalizar o pagamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <IconButton
        onClick={() => navigate("/")}
        sx={{
          color: "#313926",
          border: "1px solid #313926",
          marginBottom: "16px",
          "&:hover": { backgroundColor: "#e0e0e0" },
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

      <form id="form-checkout" onSubmit={handleCheckout}>
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
                Dados do Cartão:
              </Typography>
              <TextField
                id="cardholderName"
                label="Nome do Titular"
                fullWidth
                margin="normal"
                required
              />
              <TextField
                id="cardNumber"
                label="Número do Cartão"
                fullWidth
                margin="normal"
                required
              />
              <TextField
                id="expirationDate"
                label="Data de Validade (MM/YY)"
                fullWidth
                margin="normal"
                required
              />
              <TextField
                id="securityCode"
                label="Código de Segurança"
                fullWidth
                margin="normal"
                required
              />
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
                Total Geral: R$ {totalPrice.toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                type="submit"
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
      </form>
    </Box>
  );
};

export default Checkout;
