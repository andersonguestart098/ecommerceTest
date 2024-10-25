import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Snackbar,
  SnackbarContent,
  Avatar,
  Divider,
  IconButton,
  List,
  ListItem,
  Chip,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PendingIcon from "@mui/icons-material/HourglassEmpty";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";

interface Order {
  id: string;
  totalPrice: number;
  status: string;
}

const statusSteps = [
  {
    key: "PENDING",
    label: "Pendente",
    icon: <PendingIcon />,
  },
  {
    key: "PAYMENT_APPROVED",
    label: "Pagamento Aprovado",
    icon: <PaymentIcon />,
  },
  {
    key: "AWAITING_STOCK_CONFIRMATION",
    label: "Aguardando Estoque",
    icon: <CheckCircleIcon />,
  },
  {
    key: "SEPARATED",
    label: "Separado",
    icon: <AssignmentTurnedInIcon />,
  },
  {
    key: "DISPATCHED",
    label: "Despachado",
    icon: <LocalShippingIcon />,
  },
  {
    key: "DELIVERED",
    label: "Entregue",
    icon: <AssignmentTurnedInIcon />,
  },
];

const OrderTrackingAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/orders",
        {
          headers: { "x-auth-token": token },
        }
      );
      setOrders(response.data);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError("Erro ao carregar pedidos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/orders/update-status/${orderId}`,
        { status: newStatus },
        {
          headers: { "x-auth-token": token },
        }
      );
      setSnackbarMessage(
        `Status do pedido ${orderId} atualizado para ${newStatus}`
      );
      setOpenSnackbar(true);
      fetchOrders();
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      alert("Erro ao atualizar status do pedido");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const renderProgressTracker = (currentStatus: string) => {
    const currentStepIndex = statusSteps.findIndex(
      (step) => step.key === currentStatus
    );

    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {statusSteps.map((step, index) => {
          let backgroundColor = "#E6E3DB"; // Default color for future steps
          if (index < currentStepIndex) {
            backgroundColor = "#4CAF50"; // Completed step
          } else if (index === currentStepIndex) {
            backgroundColor = "#313926"; // Current step
          }

          return (
            <motion.div
              key={step.key}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                padding: "8px",
              }}
            >
              <Avatar
                sx={{
                  backgroundColor: backgroundColor,
                  color: "#fff",
                  width: 50,
                  height: 50,
                  boxShadow: index === currentStepIndex ? "0px 0px 15px rgba(0,0,0,0.3)" : "",
                  transition: "all 0.3s ease-in-out",
                  cursor: "pointer",
                }}
              >
                {step.icon}
              </Avatar>
              <Typography
                variant="caption"
                sx={{ color: index <= currentStepIndex ? "#313926" : "#E6E3DB" }}
              >
                {step.label}
              </Typography>
              {index < statusSteps.length - 1 && (
                <Box
                  sx={{
                    height: "30px",
                    width: "2px",
                    backgroundColor:
                      index < currentStepIndex ? "#4CAF50" : "#E6E3DB",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <IconButton
          onClick={() => navigate("/")}
          sx={{
            color: "#313926",
            border: "1px solid #313926",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
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
        <Paper
          elevation={3}
          sx={{ padding: 2, border: "1px solid #E6E3DB", borderRadius: "10px" }}
        >
          <List>
            {orders.map((order, index) => (
              <div key={index}>
                <ListItem
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    padding: 2,
                  }}
                >
                  <Box sx={{ width: "100%", textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Pedido ID: {order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: R$ {order.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    {renderProgressTracker(order.status)}
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {statusSteps.map((step) => (
                      <Chip
                        key={step.key}
                        label={step.label}
                        onClick={() => updateOrderStatus(order.id, step.key)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            order.status === step.key ? "#313926" : "#E6E3DB",
                          color: "#fff",
                          "&:hover": { backgroundColor: "#4CAF50" },
                        }}
                      />
                    ))}
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

export default OrderTrackingAdmin;
