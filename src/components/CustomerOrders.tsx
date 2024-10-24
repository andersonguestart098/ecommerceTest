import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";

const CustomerOrders: React.FC = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Buscar os pedidos do cliente logado
    const fetchCustomerOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/orders/me",
          {
            headers: { "x-auth-token": token },
          }
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos do cliente:", error);
      }
    };

    fetchCustomerOrders();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#313926" }}
      >
        Meus Pedidos
      </Typography>
      {orders.length === 0 ? (
        <Typography variant="body1">
          Você ainda não fez nenhum pedido.
        </Typography>
      ) : (
        <Paper elevation={3} sx={{ padding: 2, border: "1px solid #E6E3DB" }}>
          <List>
            {orders.map((order: any, index: number) => (
              <div key={index}>
                <ListItem>
                  <ListItemText
                    primary={`Pedido ID: ${order.id}`}
                    secondary={`Total: R$${order.totalPrice.toFixed(
                      2
                    )} - Status: ${order.status}`}
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default CustomerOrders;
