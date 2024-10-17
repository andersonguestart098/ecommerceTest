import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Typography } from "@mui/material";
import ProductCard from "./ProductCard";
import { useCart } from "../contexts/CartContext"; // Importa o contexto do carrinho

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  paymentOptions: string[];
  image: string;
  colors: { name: string; image: string }[];
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart } = useCart(); // Hook do carrinho

  useEffect(() => {
    console.log("Buscando produtos do backend...");
    axios
      .get("http://localhost:3001/products")
      .then((response) => {
        console.log("Produtos recebidos:", response.data);
        setProducts(response.data || []); // Garante que `products` seja uma lista
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar produtos:", error);
        setError("Erro ao carregar produtos. Tente novamente mais tarde.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Typography>Carregando produtos...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (products.length === 0) {
    return <Typography>Nenhum produto encontrado.</Typography>;
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          {/* Passa a função de adicionar ao carrinho como prop para o ProductCard */}
          <ProductCard 
            product={product} 
            addToCart={() => {
              console.log("Adicionando produto ao carrinho:", product);
              addToCart({ ...product, quantity: 1 });
              console.log("Produto adicionado com sucesso");
            }} 
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
