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
  image: string[] | string; // Aceita string ou array de strings
  metersPerBox: number;
  colors: { name: string; image: string; imageRefIndex: number }[]; // Inclui imageRefIndex
}

interface ProductListProps {
  searchTerm: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  showAll?: boolean; // Nova prop para controlar se todos os produtos devem ser exibidos
}

const ProductList: React.FC<ProductListProps> = ({
  searchTerm,
  color,
  minPrice,
  maxPrice,
  showAll,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/products",
        {
          params: {
            search: searchTerm,
            color,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
          },
        }
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
      setError("Erro ao carregar produtos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const params = {
          search: searchTerm,
          color,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        };
  
        // Se `showAll` for true, remova `search` dos parâmetros
        const requestParams = showAll
          ? { color, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined }
          : params;
  
        const response = await axios.get(
          "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/products",
          { params: requestParams }
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
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // Exibir todos os produtos ou apenas os filtrados
  const filteredProducts = showAll
    ? products
    : products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  if (filteredProducts.length === 0) {
    return <Typography>Nenhum produto encontrado.</Typography>;
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
