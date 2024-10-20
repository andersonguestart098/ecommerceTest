import React from "react";
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
  Grid,
  IconButton,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const CartList: React.FC = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useCart(); // Obtém o carrinho do contexto
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    navigate("/checkout");
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
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#313926", textAlign: "center" }}
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
          sx={{ padding: 2, maxWidth: 800, margin: "0 auto", mt: 3 }}
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
                          Quantidade: {item.quantity}
                        </Typography>
                      }
                    />
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                      Preço unitário: R$ {item.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Total: R$ {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => increaseQuantity(item.id)}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>

          <Box sx={{ padding: 2, backgroundColor: "#f9f9f9", mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Opções de Frete:
            </Typography>
            <Typography variant="body2">
              Calcule o frete para sua região.
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mt: 2, textAlign: "right" }}
            >
              Valor Total do Pedido: R$ {totalPrice.toFixed(2)}
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleContinueShopping}
                fullWidth
                sx={{
                  borderColor: "#313926",
                  color: "#313926",
                  "&:hover": { backgroundColor: "#e0e0e0" },
                  padding: "10px 0", // Ajuste para o mesmo padding do botão "Finalizar Pedido"
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                Continuar Comprando
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckoutRedirect}
                fullWidth
                sx={{
                  backgroundColor: "#313926",
                  "&:hover": { backgroundColor: "#1d2721" },
                  padding: "10px 0",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                Finalizar Pedido
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default CartList;
