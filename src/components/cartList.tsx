import React from "react";
import { useCart } from "../contexts/CartContext";
import { Button, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Para redirecionamento

const CartList: React.FC = () => {
  const { cart } = useCart(); // Pega o estado do carrinho
  const navigate = useNavigate();

  // Função para redirecionar para o checkout
  const handleCheckoutRedirect = () => {
    navigate("/checkout");
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Meu Carrinho
      </Typography>

      {/* Exibe mensagem se o carrinho estiver vazio */}
      {cart.length === 0 ? (
        <Typography variant="h6" color="textSecondary">
          Seu carrinho está vazio.
        </Typography>
      ) : (
        <List>
          {cart.map((item) => (
            <div key={item.id}>
              <ListItem>
                <ListItemText
                  primary={item.name}
                  secondary={`Quantidade: ${item.quantity} | Preço: R$ ${item.price.toFixed(2)}`}
                />
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      )}

      {/* Botão para redirecionar ao checkout */}
      {cart.length > 0 && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleCheckoutRedirect}
          sx={{ mt: 2 }}
        >
          Finalizar Pedido
        </Button>
      )}
    </div>
  );
};

export default CartList;
