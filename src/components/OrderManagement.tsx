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
  Button,
  Grid,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

type StatusIconProps = {
  status: string;
  onClick: () => void;
  isSelected: boolean;
};

const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  onClick,
  isSelected,
}) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: "pointer",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "scale(1.2)",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
      },
      padding: "8px",
      borderRadius: "50%",
      backgroundColor: isSelected ? "#4caf50" : "#E6E3DB",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 40,
      height: 40,
    }}
  >
    {status === "Verificando Estoque" ? (
      <HourglassEmptyIcon sx={{ color: isSelected ? "#fff" : "#313926" }} />
    ) : (
      <CheckCircleIcon sx={{ color: isSelected ? "#fff" : "#313926" }} />
    )}
  </Box>
);

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/orders",
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
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/orders/${orderId}`,
        { status: newStatus },
        {
          headers: { "x-auth-token": token },
        }
      );
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
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#313926" }}
      >
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

                    {/* Status Buttons */}
                    <Grid item xs={12}>
                      <StatusIcon
                        status="Verificando Estoque"
                        isSelected={order.status === "Verificando Estoque"}
                        onClick={() =>
                          updateOrderStatus(order.id, "Verificando Estoque")
                        }
                      />
                      <StatusIcon
                        status="Pedido Enviado"
                        isSelected={order.status === "Pedido Enviado"}
                        onClick={() =>
                          updateOrderStatus(order.id, "Pedido Enviado")
                        }
                      />
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
