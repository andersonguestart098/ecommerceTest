import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Typography } from "@mui/material";
import ProductCard from "./ProductCard";
import { useCart } from "../contexts/CartContext"; // Importa o hook do contexto

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  paymentOptions: string[];
  image: string[]; // Change to an array of strings
  metersPerBox: number;
  colors: { name: string; image: string }[];
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart(); // Obtém a função addToCart do contexto

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Buscando produtos do backend...");
        const response = await axios.get("http://localhost:3001/products");

        // Parse the `image` field if it's a string, to ensure it is treated as an array
        const processedProducts = response.data.map((product: any) => ({
          ...product,
          image: typeof product.image === 'string' ? JSON.parse(product.image) : product.image,
        }));

        console.log("Produtos recebidos:", processedProducts);
        setProducts(processedProducts || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError("Erro ao carregar produtos. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
          <ProductCard 
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              discount: product.discount,
              paymentOptions: product.paymentOptions,
              image: product.image, // Utilize o array de URLs do banco de dados
              metersPerBox: product.metersPerBox,
              colors: product.colors,
            }} 
            addToCart={(product) => addToCart(product)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
