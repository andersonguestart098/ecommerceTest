import React, { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography, List, ListItem, Divider, Box, Avatar } from "@mui/material";
import PendingIcon from "@mui/icons-material/HourglassEmpty";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

const statusSteps = [
  { key: "PENDING", label: "Pendente", icon: <PendingIcon /> },
  { key: "PAYMENT_APPROVED", label: "Pagamento Aprovado", icon: <PaymentIcon /> },
  { key: "AWAITING_STOCK_CONFIRMATION", label: "Aguardando Estoque", icon: <CheckCircleIcon /> },
  { key: "SEPARATED", label: "Separado", icon: <AssignmentTurnedInIcon /> },
  { key: "DISPATCHED", label: "Despachado", icon: <LocalShippingIcon /> },
  { key: "DELIVERED", label: "Entregue", icon: <AssignmentTurnedInIcon /> },
];

const OrderTracking: React.FC = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3001/orders/me", {
          headers: { "x-auth-token": token },
        });
        console.log("Pedidos recebidos:", response.data); // Log para verificar os dados recebidos
        setOrders(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };
  
    fetchOrders();
  }, []);
  

  const renderProgressTracker = (currentStatus: string) => {
    const currentStepIndex = statusSteps.findIndex(step => step.key === currentStatus);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {statusSteps.map((step, index) => (
          <Box
            key={step.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              color: index <= currentStepIndex ? "#313926" : "#E6E3DB",
              zIndex: 2,
            }}
          >
            <Avatar
              sx={{
                backgroundColor: index === currentStepIndex ? "#313926" : index < currentStepIndex ? "#1565c0" : "#E6E3DB",
                color: "#fff",
                width: 40,
                height: 40,
                transition: "all 0.3s ease-in-out",
              }}
            >
              {step.icon}
            </Avatar>
            <Typography variant="caption" sx={{ marginTop: 1 }}>
              {step.label}
            </Typography>
          </Box>
        ))}

        {/* Barra de progresso */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0',
            height: '5px',
            backgroundColor: "#E6E3DB",
            zIndex: 1,
            display: 'flex',
          }}
        >
          <Box
            sx={{
              width: `calc(${(currentStepIndex + 0.5) / (statusSteps.length - 1)} * 100%)`, // Avança até metade do próximo
              height: '100%',
              backgroundColor: "#313926",
              transition: "width 0.3s ease-in-out",
            }}
          />
        </Box>
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
          {orders.map((order: any, index: number) => {
            console.log("Pedido recebido no frontend:", order); // Log para verificar cada pedido
            return (
              <div key={index}>
                <ListItem sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ flex: 1, width: '100%', textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Pedido ID: {order._id || order.id} {/* Ajuste para garantir que o ID certo seja exibido */}
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
            );
          })}
        </List>

        </Paper>
      )}
    </Box>
  );
};

export default OrderTracking;
