import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Typography } from "@mui/material";
import ProductCard from "./ProductCard";

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

  useEffect(() => {
    axios
      .get("http://localhost:3001/products")
      .then((response) => {
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
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
