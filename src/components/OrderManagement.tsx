import React, { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography, List, ListItem, ListItemText, Divider, Box, Button, Grid } from "@mui/material";

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Buscar todos os pedidos do backend
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3001/orders", {
          headers: { "x-auth-token": token },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3001/orders/${orderId}`,
        { status: newStatus },
        {
          headers: { "x-auth-token": token },
        }
      );
      // Atualizar a lista de pedidos após alterar o status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar o status do pedido:", error);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#313926" }}>
        Gestão de Pedidos
      </Typography>
      {orders.length === 0 ? (
        <Typography variant="body1">Nenhum pedido encontrado.</Typography>
      ) : (
        <Paper elevation={3} sx={{ padding: 2, border: "1px solid #E6E3DB" }}>
          <List>
            {orders.map((order, index) => (
              <div key={index}>
                <ListItem>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6">
                        Pedido ID: {order.id}
                      </Typography>
                      <Typography variant="body1">
                        Total: R$ {order.totalPrice.toFixed(2)}
                      </Typography>
                      <Typography variant="body1">
                        Status: {order.status}
                      </Typography>
                      <Typography variant="body2">
                        Endereço de Entrega: {order.deliveryAddress}
                      </Typography>
                      <Typography variant="body2">
                        Tipo de Frete: {order.shippingType}
                      </Typography>
                      <Typography variant="body2">
                        Forma de Pagamento: {order.paymentMethod}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Produtos:
                      </Typography>
                      <List>
                        {order.products.map((product: any, idx: number) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={`${product.name} - Quantidade: ${product.quantity}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>

                    {/* Botões para atualizar o status do pedido */}
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => updateOrderStatus(order.id, "Verificando Estoque")}
                        sx={{ marginRight: 1 }}
                      >
                        Verificando Estoque
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => updateOrderStatus(order.id, "Pedido Enviado")}
                      >
                        Pedido Enviado
                      </Button>
                    </Grid>
                  </Grid>
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

export default OrderManagement;
