import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  SnackbarContent,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrderTrackingAdmin: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const navigate = useNavigate();

  // Função para buscar pedidos
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/orders", {
        headers: { "x-auth-token": token },
      });
      setOrders(response.data);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError("Erro ao carregar pedidos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Chama a função para buscar pedidos quando o componente monta
  useEffect(() => {
    fetchOrders();
  }, []);

  // Atualiza o status do pedido
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/orders/update-status/${orderId}`,
        { status: newStatus },
        {
          headers: { "x-auth-token": token },
        }
      );
      setSnackbarMessage(`Status do pedido ${orderId} atualizado para ${newStatus}`);
      setOpenSnackbar(true);
      fetchOrders(); // Recarrega os pedidos para refletir a mudança
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      alert("Erro ao atualizar status do pedido");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBackClick}
          sx={{
            color: "#313926",
            borderColor: "#313926",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
        >
          Voltar
        </Button>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Pedidos (Admin)
        </Typography>
      </Box>

      {loading ? (
        <CircularProgress color="inherit" />
      ) : error ? (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      ) : (
        <Paper elevation={3} sx={{ padding: 2, border: "1px solid #E6E3DB" }}>
          {orders.map((order, index) => (
            <Box key={index} sx={{ marginBottom: 2, padding: 2, border: "1px solid #ddd" }}>
              <Typography variant="h6">Pedido ID: {order.id}</Typography>
              <Typography>Total: R$ {order.totalPrice.toFixed(2)}</Typography>
              <Button
                onClick={() => updateOrderStatus(order.id, "DISPATCHED")}
                variant="contained"
                sx={{
                  mt: 1,
                  backgroundColor: "#313926",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#1d2721" },
                }}
              >
                Marcar como Despachado
              </Button>
            </Box>
          ))}
        </Paper>
      )}

      {/* Snackbar para notificações */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <SnackbarContent
          style={{ backgroundColor: "#fff", color: "#313926", fontFamily: "Arial, sans-serif", fontSize: "1rem" }}
          message={snackbarMessage}
        />
      </Snackbar>
    </Box>
  );
};

export default OrderTrackingAdmin;
