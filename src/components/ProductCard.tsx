import React, { useRef, useState, useEffect } from "react";
import { Card, CardMedia, CardContent, Typography, Button, Box, TextField, Avatar } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  paymentOptions: string[];
  image: string[] | string; // Pode ser um array ou uma string JSON serializada
  metersPerBox: number;
  colors: { name: string; image: string }[];
}

interface ProductCardProps {
  product: Product;
  addToCart: (product: CartItem) => void;
}

interface CartItem extends Omit<Product, 'image'> {
  image: string; // Ajustado para apenas uma URL de imagem
  quantity: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [area, setArea] = useState<number>(0);
  const [boxesNeeded, setBoxesNeeded] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageArray, setImageArray] = useState<string[]>([]);

  // Convertendo a imagem de string JSON para array se necessário
  useEffect(() => {
    if (typeof product.image === 'string') {
      try {
        const parsedImages = JSON.parse(product.image);
        if (Array.isArray(parsedImages)) {
          setImageArray(parsedImages);
        } else {
          console.error("Formato inesperado de imagem");
        }
      } catch (e) {
        console.error("Erro ao converter imagens:", e);
      }
    } else {
      setImageArray(product.image);
    }
  }, [product.image]);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      image: imageArray[0], // Use apenas a primeira imagem para o CartItem
      quantity: boxesNeeded, // Usa a quantidade calculada de caixas
    });
  };

  const handleCalculateArea = () => {
    const calculatedArea = length * width;
    setArea(calculatedArea);

    const calculatedBoxes = Math.ceil(calculatedArea / product.metersPerBox);
    setBoxesNeeded(calculatedBoxes);
  };

  const handleMouseEnter = () => {
    if (imageArray && imageArray.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageArray.length);
    }
  };

  const handleColorClick = (index: number) => {
    // Quando uma cor é clicada, muda a imagem principal para a correspondente
    if (imageArray[index]) {
      setCurrentImageIndex(index);
    }
  };

  return (
    <Card ref={cardRef} sx={{ padding: "16px", backgroundColor: "#f9f9f9" }}>
      <CardMedia
        component="img"
        height="140"
        image={imageArray[currentImageIndex] || '/path/to/default-image.png'} // Fallback para imagem padrão
        alt={product.name}
        onMouseEnter={handleMouseEnter}
        sx={{
          transition: "0.3s ease-in-out",
        }}
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
        
        {/* Seção de cores */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1, 
            mt: 2, 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          {product.colors.map((color, index) => (
            <Avatar
              key={index}
              src={color.image}
              alt={color.name}
              onClick={() => handleColorClick(index)} // Adiciona a lógica de clique
              sx={{
                width: 50,
                height: 50,
                border: "1px solid #ddd",
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.2)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }
              }}
              title={color.name}
            />
          ))}
        </Box>

        {/* Input para cálculo de caixas com comprimento e largura */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <TextField
            label="Comprimento (m)"
            type="number"
            variant="outlined"
            size="small"
            value={length || ''}
            onChange={(e) => setLength(parseFloat(e.target.value))}
            inputProps={{ min: "0", step: "0.1" }}
            sx={{ width: "50%" }}
          />
          <TextField
            label="Largura (m)"
            type="number"
            variant="outlined"
            size="small"
            value={width || ''}
            onChange={(e) => setWidth(parseFloat(e.target.value))}
            inputProps={{ min: "0", step: "0.1" }}
            sx={{ width: "50%" }}
          />
        </Box>
        <Button 
          variant="contained" 
          onClick={handleCalculateArea}
          sx={{ mt: 2, width: '100%' }}
        >
          Calcular
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sua área é de {area.toFixed(2)} m² e você precisará de aproximadamente {boxesNeeded} caixas.
        </Typography>

        {/* Botão de Adicionar ao Carrinho */}
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <Button
            onClick={handleAddToCart}
            variant="contained"
            sx={{
              backgroundColor: "#313926",
              color: "#fff",
              width: "100%",
              "&:hover": { backgroundColor: "#3d403a" },
            }}
          >
            <ShoppingCartIcon />
            <Typography sx={{ ml: 1 }}>ADICIONAR AO CARRINHO</Typography>
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
