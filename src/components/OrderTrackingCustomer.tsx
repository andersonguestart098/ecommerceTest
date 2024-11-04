import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  List,
  ListItem,
  Divider,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
  Snackbar,
  SnackbarContent,
  IconButton,
} from "@mui/material";
import PendingIcon from "@mui/icons-material/HourglassEmpty";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";
import { useSocket } from "../contexts/SocketContext";
import { useNavigate } from "react-router-dom";

// Define a type for order
interface Order {
  id: string;
  _id?: string;
  totalPrice: number;
  status: string;
}

// Define your status steps
const statusSteps = [
  { key: "PENDING", label: "Pendente", icon: <PendingIcon />, defaultColor: "#E6E3DB" },
  { key: "PAYMENT_APPROVED", label: "Pagamento Aprovado", icon: <PaymentIcon />, defaultColor: "#E6E3DB" },
  { key: "AWAITING_STOCK_CONFIRMATION", label: "Aguardando Estoque", icon: <CheckCircleIcon />, defaultColor: "#E6E3DB" },
  { key: "SEPARATED", label: "Separado", icon: <AssignmentTurnedInIcon />, defaultColor: "#E6E3DB" },
  { key: "DISPATCHED", label: "Despachado", icon: <LocalShippingIcon />, defaultColor: "#E6E3DB" },
  { key: "DELIVERED", label: "Entregue", icon: <AssignmentTurnedInIcon />, defaultColor: "#E6E3DB" },
];

const OrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("Fetching orders...");
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("Token not found in localStorage. Redirecting to login.");
          navigate("/login");
          return;
        }

        console.log("Token found:", token);
        const response = await axios.get(
          "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/orders/me",
          { headers: { "x-auth-token": token } }
        );

        console.log("Orders fetched successfully:", response.data);
        setOrders(response.data);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 403) {
          console.warn("Acesso negado para o usuário. Redirecionando para login.");
          alert("Acesso negado. Por favor, faça login novamente.");
          navigate("/login");
        } else if (error.response?.status === 401) {
          console.warn("Token inválido ou expirado. Redirecionando para login.");
          alert("Token inválido ou expirado. Por favor, faça login novamente.");
          navigate("/login");
        } else {
          console.error("Erro inesperado ao buscar pedidos:", error);
        }
      }
    };

    fetchOrders();

    // Listen for order updates
    console.log("Setting up WebSocket listener for order updates...");
    socket?.on("orderStatusUpdated", (update: { orderId: string; status: string }) => {
      console.log("Received order status update:", update);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === update.orderId || order._id === update.orderId
            ? { ...order, status: update.status }
            : order
        )
      );

      setSnackbarMessage(`Status do pedido ${update.orderId} atualizado para ${update.status}`);
      setOpenSnackbar(true);
    });

    return () => {
      console.log("Cleaning up WebSocket listener...");
      socket?.off("orderStatusUpdated");
    };
  }, [socket, navigate]);

  const handleCloseSnackbar = () => {
    console.log("Closing snackbar...");
    setOpenSnackbar(false);
  };

  const handleContinueShopping = () => {
    console.log("Navigating back to home...");
    navigate("/");
  };

  return (
    <Box sx={{ padding: 3 }}>
      <IconButton
        onClick={handleContinueShopping}
        sx={{
          color: "#313926",
          border: "1px solid #313926",
          mb: 3,
          "&:hover": { backgroundColor: "#e0e0e0" },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#313926" }}>
        Meus Pedidos
      </Typography>
      {orders.length === 0 ? (
        <Typography variant="body1">Nenhum pedido encontrado.</Typography>
      ) : (
        <Paper elevation={3} sx={{ padding: 2, border: "1px solid #E6E3DB" }}>
          <List>
            {orders.map((order, index) => (
              <div key={index}>
                <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <Box sx={{ flex: 1, width: "100%", textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Pedido ID: {order._id || order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: R${order.totalPrice.toFixed(2).replace(".", ",")}
                    </Typography>
                  </Box>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </Paper>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <SnackbarContent
          style={{
            backgroundColor: "#fff",
            color: "#313926",
            fontFamily: "Arial, sans-serif",
            fontSize: "1rem",
          }}
          message={snackbarMessage}
        />
      </Snackbar>
    </Box>
  );
};

export default OrderTracking;
