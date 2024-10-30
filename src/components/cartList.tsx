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
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCart();
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
      console.log("ID do usuário capturado:", parsedUser.id);
    }
  }, []);

  const totalProductAmount = cart
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2);

  const handleCheckout = () => {
    if (!selectedFreightOption) {
      alert("Por favor, selecione uma opção de frete antes de continuar.");
      return;
    }

    const freightPrice = Number(selectedFreightOption?.price || 0).toFixed(2);
    const totalPrice = (
      Number(totalProductAmount) + Number(freightPrice)
    ).toFixed(2);

    // Estrutura dos itens conforme esperado pelo Mercado Pago
    const items = cart.map((item) => ({
      productId: String(item.id),
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      description: item.description || "Produto sem descrição",
      category_id: item.category_id || "default",
    }));

    // Log para verificar os dados antes de salvar no `localStorage`
    console.log("Itens prontos para o localStorage:", items);

    // Validação para garantir que cada item tenha `productId` e `quantity`
    if (
      items.some((item) => item.productId === "undefined" || item.quantity <= 0)
    ) {
      console.error(
        "Erro: Um ou mais itens têm `productId` ou `quantity` inválidos."
      );
      alert("Erro ao processar itens: verifique o carrinho e tente novamente.");
      return;
    }

    // Armazenar os dados de checkout no localStorage, incluindo o userId
    localStorage.setItem(
      "checkoutData",
      JSON.stringify({ amount: totalProductAmount, totalPrice, items, userId })
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
                      primary={item.name}
                      secondary={`Quantidade: ${item.quantity}`}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2">
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
          <Box sx={{ padding: 2, backgroundColor: "#f9f9f9", mt: 2 }}>
            <TextField
              label="Insira seu CEP"
              value={cepDestino}
              onChange={(e) => setCepDestino(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => console.log("Calcular frete aqui")}
              fullWidth
            >
              Calcular Frete
            </Button>
            {freightOptions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  Opções de Frete Disponíveis:
                </Typography>
                <List>
                  {freightOptions.map((option) => (
                    <ListItem key={option.id}>
                      <ListItemButton
                        onClick={() => setSelectedFreightOption(option)}
                        selected={selectedFreightOption?.id === option.id}
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
              sx={{ fontWeight: "bold", mt: 2, textAlign: "right" }}
            >
              Valor Total do Pedido: R${" "}
              {(
                Number(totalProductAmount) +
                Number(selectedFreightOption?.price || 0)
              ).toFixed(2)}
            </Typography>
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
        </Paper>
      )}
    </Box>
  );
};

export default CartList;
