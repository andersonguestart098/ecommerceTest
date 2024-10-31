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
import { motion } from "framer-motion";
import { useSocket } from "../contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Define a type for order
interface Order {
  id: string;
  _id?: string;
  totalPrice: number;
  status: string;
}

// Define your status steps
const statusSteps = [
  {
    key: "PENDING",
    label: "Pendente",
    icon: <PendingIcon />,
    defaultColor: "#E6E3DB",
  },
  {
    key: "PAYMENT_APPROVED",
    label: "Pagamento Aprovado",
    icon: <PaymentIcon />,
    defaultColor: "#E6E3DB",
  },
  {
    key: "AWAITING_STOCK_CONFIRMATION",
    label: "Aguardando Estoque",
    icon: <CheckCircleIcon />,
    defaultColor: "#E6E3DB",
  },
  {
    key: "SEPARATED",
    label: "Separado",
    icon: <AssignmentTurnedInIcon />,
    defaultColor: "#E6E3DB",
  },
  {
    key: "DISPATCHED",
    label: "Despachado",
    icon: <LocalShippingIcon />,
    defaultColor: "#E6E3DB",
  },
  {
    key: "DELIVERED",
    label: "Entregue",
    icon: <AssignmentTurnedInIcon />,
    defaultColor: "#E6E3DB",
  },
];

const OrderTracking: React.FC = () => {
  // Explicitly type the orders state
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
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/orders/me",
          {
            headers: { "x-auth-token": token },
          }
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };
    fetchOrders();

    // Listen for order updates
    socket?.on(
      "orderStatusUpdated",
      (update: { orderId: string; status: string }) => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === update.orderId || order._id === update.orderId
              ? { ...order, status: update.status }
              : order
          )
        );

        // Show notification to the user
        setSnackbarMessage(
          `Status do pedido ${update.orderId} atualizado para ${update.status}`
        );
        setOpenSnackbar(true);
      }
    );

    return () => {
      socket?.off("orderStatusUpdated");
    };
  }, [socket]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const renderProgressTracker = (currentStatus: string) => {
    const currentStepIndex = statusSteps.findIndex(
      (step) => step.key === currentStatus
    );

    const handleContinueShopping = () => {
      navigate("/");
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: isMobile ? "center" : "space-between",
          position: "relative",
        }}
      >
        {/* Botão de Voltar */}
        <IconButton
          onClick={handleContinueShopping}
          sx={{
            color: "#313926",
            border: "1px solid #313926",
            marginBottom: "16px",
            "&:hover": {
              backgroundColor: "#e0e0e0",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        {statusSteps.map((step, index) => (
          <motion.div
            key={step.key}
            animate={index === currentStepIndex ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 1.38, repeat: Infinity }}
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Avatar
              sx={{
                backgroundColor:
                  index < currentStepIndex
                    ? "#4CAF50"
                    : index === currentStepIndex
                    ? "#313926"
                    : step.defaultColor,
                color: "#fff",
                width: 40,
                height: 40,
                marginBottom: 1,
                transition: "all 0.3s ease-in-out",
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
                  width: isMobile ? "2px" : "50px",
                  height: isMobile ? "20px" : "2px",
                  backgroundColor:
                    index < currentStepIndex ? "#4CAF50" : "#E6E3DB",
                  margin: isMobile ? "5px 0" : "0 5px",
                }}
              />
            )}
          </motion.div>
        ))}
      </Box>
    );
  };

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
        <Typography variant="body1">Nenhum pedido encontrado.</Typography>
      ) : (
        <Paper elevation={3} sx={{ padding: 2, border: "1px solid #E6E3DB" }}>
          <List>
            {orders.map((order, index) => (
              <div key={index}>
                <ListItem
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1, width: "100%", textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Pedido ID: {order._id || order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: R${order.totalPrice.toFixed(2).replace(".", ",")}
                    </Typography>
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    {renderProgressTracker(order.status)}
                  </Box>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </Paper>
      )}

      {/* Snackbar for notifications */}
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
