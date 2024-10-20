import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress } from "@mui/material";

const OrderTrackingAdmin: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3001/orders", {
          headers: { "x-auth-token": localStorage.getItem("token") }
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        setError("Erro ao buscar pedidos");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <div>{error}</div>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Pedidos (Admin)</Typography>
      {orders.map((order, index) => (
        <Box key={index} sx={{ marginBottom: 2, padding: 2, border: "1px solid #ddd" }}>
          <Typography variant="h6">Pedido ID: {order.id}</Typography>
          <Typography>Total: {order.totalPrice}</Typography>
          {/* Adicione outras informações relevantes */}
        </Box>
      ))}
    </Box>
  );
};

export default OrderTrackingAdmin;
