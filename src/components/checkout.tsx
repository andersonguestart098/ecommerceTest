import React from "react";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para finalizar a compra.");
      navigate("/login");
      return;
    }

    try {
      const totalPrice = cart.reduce(
        (total, product) => total + product.price * product.quantity,
        0
      );

      const response = await axios.post(
        "http://localhost:3001/orders",
        { products: cart, totalPrice },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      console.log("Pedido finalizado com sucesso:", response.data);
      clearCart();
      navigate("/order-confirmation");
    } catch (err) {
      console.error("Erro ao finalizar o pedido:", err);
      alert("Erro ao finalizar o pedido.");
    }
  };

  return (
    <div>
      <h2>Resumo do Pedido</h2>
      {cart.map((item) => (
        <div key={item.id}>
          <p>{item.name}</p>
          <p>Quantidade: {item.quantity}</p>
          <p>Preço: R$ {item.price}</p>
        </div>
      ))}
      <button onClick={handleCheckout}>Finalizar Pedido</button>
    </div>
  );
};

export default Checkout;
