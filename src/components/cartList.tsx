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
  Snackbar,
  SnackbarContent,
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
  const [userId, setUserId] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser.id);
      localStorage.setItem("userId", parsedUser.id);
      console.log("User ID set:", parsedUser.id);
    }
  }, []);

  const totalProductAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  console.log("Total product amount:", totalProductAmount);

  const totalPrice = totalProductAmount.toFixed(2);

  const handleCheckout = () => {
    const user = localStorage.getItem("user"); // Verifica se o usuário está logado

    if (!user) {
      setOpenSnackbar(true); // Exibe o Snackbar para informar que precisa logar
      setTimeout(() => {
        navigate("/login", {
          state: { from: cart.length > 0 ? "/checkout" : "/" }, // Define para onde redirecionar após login
        });
      }, 2000);
      return;
    }

    const items = cart.map((item) => ({
      productId: String(item.id),
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      description: item.description || "Produto sem descrição",
      category_id: item.category_id || "default",
    }));

    // Salva os dados de checkout no localStorage para reutilização
    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        amount: totalProductAmount.toFixed(2).replace(".", ","), // Apenas total dos produtos
        shippingCost: "0.00", // Frete será calculado no checkout
        totalPrice: totalPrice.replace(".", ","),
        items,
        userId,
      })
    );

    navigate("/checkout"); // Redireciona para a página de checkout
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <SnackbarContent
          message="Você precisa estar logado para finalizar a compra."
          sx={{
            backgroundColor: "#313926",
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
          }}
        />
      </Snackbar>
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
            {cart.map((item) => {
              const selectedColor = JSON.parse(
                localStorage.getItem(`selectedColor_${item.id}`) || "{}"
              );
              return (
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
                        src={selectedColor.image || item.image}
                        alt={item.name}
                        sx={{
                          width: 60,
                          height: 60,
                          marginRight: 2,
                          borderRadius: "8px",
                        }}
                      />
                      <ListItemText
                        primary={`${item.name} - Cor: ${
                          selectedColor.name || "Padrão"
                        }`}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Quantidade: {item.quantity}
                            </Typography>
                            <br />
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              component="span"
                            >
                              {item.description}
                            </Typography>
                          </>
                        }
                        primaryTypographyProps={{
                          fontWeight: "bold",
                          color: "#313926",
                        }}
                        secondaryTypographyProps={{ color: "#777" }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#313926" }}>
                        R${" "}
                        {(item.price * item.quantity)
                          .toFixed(2)
                          .replace(".", ",")}
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
              );
            })}
          </List>
          <Box
            sx={{
              padding: 2,
              backgroundColor: "#fafafa",
              mt: 2,
              borderRadius: "10px",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mt: 2,
                textAlign: "right",
                color: "#313926",
              }}
            >
              Valor Total do Pedido: R$ {totalPrice.replace(".", ",")}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleCheckout}
              fullWidth
              sx={{
                mt: 2,
                color: "#313926",
                borderColor: "#313926",
                "&:hover": {
                  backgroundColor: "#00b300",
                  borderColor: "#00b300",
                  color: "#fff",
                },
              }}
            >
              Finalizar Compra
            </Button>
            <Button
              variant="outlined"
              onClick={handleCheckout}
              fullWidth
              sx={{
                mt: 2,
                color: "#313926",
                borderColor: "#313926",
                "&:hover": {
                  backgroundColor: "#313926",
                  borderColor: "#313926",
                  color: "#fff",
                },
              }}
            >
              Continuar Comprando
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CartList;
