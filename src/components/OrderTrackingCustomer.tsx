import React, { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography, List, ListItem, Divider, Box, Avatar, useMediaQuery, useTheme } from "@mui/material";
import PendingIcon from "@mui/icons-material/HourglassEmpty";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { motion } from "framer-motion"; // Importando Framer Motion para animações

const statusSteps = [
  { key: "PENDING", label: "Pendente", icon: <PendingIcon />, defaultColor: "#E6E3DB" }, // Cor padrão
  { key: "PAYMENT_APPROVED", label: "Pagamento Aprovado", icon: <PaymentIcon />, defaultColor: "#E6E3DB" }, // Cor padrão
  { key: "AWAITING_STOCK_CONFIRMATION", label: "Aguardando Estoque", icon: <CheckCircleIcon />, defaultColor: "#E6E3DB" }, // Cor padrão
  { key: "SEPARATED", label: "Separado", icon: <AssignmentTurnedInIcon />, defaultColor: "#E6E3DB" }, // Cor padrão
  { key: "DISPATCHED", label: "Despachado", icon: <LocalShippingIcon />, defaultColor: "#E6E3DB" }, // Cor padrão
  { key: "DELIVERED", label: "Entregue", icon: <AssignmentTurnedInIcon />, defaultColor: "#E6E3DB" }, // Cor padrão
];

const OrderTracking: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Verifica se o dispositivo é móvel

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3001/orders/me", {
          headers: { "x-auth-token": token },
        });
        setOrders(response.data);
      } catch (error: any) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };
    fetchOrders();
  }, []);

  const renderProgressTracker = (currentStatus: string) => {
    const currentStepIndex = statusSteps.findIndex(step => step.key === currentStatus);
  
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: 'center', 
        justifyContent: isMobile ? 'center' : 'space-between',
        position: 'relative' 
      }}>
        {statusSteps.map((step, index) => (
          <motion.div
            key={step.key}
            animate={index === currentStepIndex ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 1.38, repeat: Infinity }}
            style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
          >
            <Avatar
              sx={{
                backgroundColor: 
                  index < currentStepIndex ? "#4CAF50" : // Verde para etapas concluídas
                  index === currentStepIndex ? "#313926" : // Azul para etapa atual
                  step.defaultColor, // Cor padrão para as outras
                color: "#fff",
                width: 40,
                height: 40,
                marginBottom: 1,
                transition: "all 0.3s ease-in-out",
              }}
            >
              {step.icon}
            </Avatar>
            <Typography variant="caption" sx={{ color: index <= currentStepIndex ? "#313926" : "#E6E3DB" }}>
              {step.label}
            </Typography>
            {index < statusSteps.length - 1 && (
              <Box sx={{
                width: isMobile ? '2px' : '50px',
                height: isMobile ? '20px' : '2px',
                backgroundColor: index < currentStepIndex ? "#4CAF50" : "#E6E3DB", // Verde para barra de conexão concluída
                margin: isMobile ? "5px 0" : "0 5px",
              }} />
            )}
          </motion.div>
        ))}
      </Box>
    );
  };
  
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#313926" }}>
        Meus Pedidos
      </Typography>
      {orders.length === 0 ? (
        <Typography variant="body1">Nenhum pedido encontrado.</Typography>
      ) : (
        <Paper elevation={3} sx={{ padding: 2, border: "1px solid #E6E3DB" }}>
          <List>
            {orders.map((order: any, index: number) => (
              <div key={index}>
                <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1, width: '100%', textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Pedido ID: {order._id || order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: R${order.totalPrice.toFixed(2).replace('.', ',')}
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    {renderProgressTracker(order.status)}
                  </Box>
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

export default OrderTracking;
