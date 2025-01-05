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
  image: string[] | string;
  metersPerBox: number;
  colors: { name: string; image: string; imageRefIndex: number }[];
}

interface ProductListProps {
  searchTerm: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  showAll?: boolean; // Tornando opcional
}

const ProductList: React.FC<ProductListProps> = ({
  searchTerm,
  color,
  minPrice,
  maxPrice,
  showAll = false,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, string | undefined> = {
          color,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        };

        if (!showAll) {
          params.search = searchTerm; // Apenas adiciona `search` se não for para mostrar tudo
        }

        const response = await axios.get(
          "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/products",
          { params }
        );

        const processedProducts = response.data.map((product: any) => ({
          ...product,
          image:
            typeof product.image === "string"
              ? JSON.parse(product.image)
              : product.image,
          colors: product.colors.map((color: any, index: number) => ({
            ...color,
            imageRefIndex: color.imageRefIndex ?? index,
          })),
        }));

        setProducts(processedProducts || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError("Erro ao carregar produtos. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, color, minPrice, maxPrice, showAll]);

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
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  
  if (filteredProducts.length === 0) {
    return (
      <Typography sx={{ textAlign: "center", marginTop: 4 }}>
        Nenhum produto encontrado.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {filteredProducts.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <ProductCard product={product} addToCart={addToCart} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
