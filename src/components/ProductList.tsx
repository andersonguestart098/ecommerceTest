import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Typography, CircularProgress, Box } from "@mui/material";
import ProductCard from "./ProductCard";
import { useCart } from "../contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  paymentOptions: string[];
  image: string[];
  metersPerBox: number;
  colors: { name: string; image: string }[];
}

interface ProductListProps {
  searchTerm: string;
  color: string;
  minPrice: string;
  maxPrice: string;
}

const ProductList: React.FC<ProductListProps> = ({
  searchTerm,
  color,
  minPrice,
  maxPrice,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Buscando produtos com filtros...");
      const response = await axios.get("http://localhost:3001/products", {
        params: {
          search: searchTerm,
          color,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        },
      });

      const processedProducts = response.data.map((product: any) => ({
        ...product,
        image:
          typeof product.image === "string"
            ? JSON.parse(product.image)
            : product.image,
      }));

      setProducts(processedProducts || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setError("Erro ao carregar produtos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // UseEffect to fetch products initially and whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, color, minPrice, maxPrice]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress color="inherit" sx={{ color: "#313926" }} />
      </Box>
    );
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
            product={product}
            addToCart={(product) => addToCart(product)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
