import React from "react";
import { Card, CardMedia, CardContent, Typography, Button } from "@mui/material";

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

interface ProductCardProps {
  product: Product;
  addToCart: () => void; // Função para adicionar o produto ao carrinho
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  return (
    <Card>
      <CardMedia
        component="img"
        height="140"
        image={product.image}
        alt={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        <Typography variant="h6" color="primary">
          R$ {product.price.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            console.log("Botão de adicionar ao carrinho clicado:", product);
            addToCart(); // Chama a função ao clicar no botão
          }}
          sx={{ mt: 2 }}
        >
          Adicionar ao Carrinho
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
