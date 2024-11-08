import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Avatar,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  paymentOptions: string[];
  image: string[] | string; // Lista de imagens principais
  metersPerBox: number;
  colors: { name: string; image: string; imageRefIndex: number }[]; // Adicionado imageRefIndex
}


interface ProductCardProps {
  product: Product;
  addToCart: (product: CartItem) => void;
}

interface CartItem extends Omit<Product, "image"> {
  image: string;
  quantity: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cartIconRef, setCartIconRef] = useState<DOMRect | null>(null);
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [area, setArea] = useState<number>(0);
  const [boxesNeeded, setBoxesNeeded] = useState<number>(1);

  const [currentImage, setCurrentImage] = useState<string>(
    Array.isArray(product.image) ? product.image[0] : product.image
  );

  const [currentColorIndex, setCurrentColorIndex] = useState<number>(0);
  const [showClone, setShowClone] = useState<boolean>(false);
  const [cloneStyles, setCloneStyles] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const iconRef = document.querySelector(".cart-icon");
    if (iconRef) {
      setCartIconRef(iconRef.getBoundingClientRect());
    }
  }, []);

  const handleAddToCart = () => {
    const quantityToAdd = boxesNeeded > 0 ? boxesNeeded : 1;
    const selectedColor = product.colors[currentColorIndex];

    localStorage.setItem(
      `selectedColor_${product.id}`,
      JSON.stringify(selectedColor)
    );

    addToCart({
      ...product,
      image: currentImage,
      quantity: quantityToAdd,
    });

    if (cardRef.current && cartIconRef) {
      const cardRect = cardRef.current.getBoundingClientRect();

      setCloneStyles({
        top: cardRect.top,
        left: cardRect.left,
        width: cardRect.width,
        height: cardRect.height,
      });

      setShowClone(true);

      setTimeout(() => {
        setCloneStyles({
          top: cartIconRef.top,
          left: cartIconRef.left,
          width: 20,
          height: 20,
        });
      }, 100);

      setTimeout(() => {
        setShowClone(false);
      }, 1200);
    }
  };

  const handleCalculateArea = () => {
    const calculatedArea = length * width;
    setArea(calculatedArea);

    const calculatedBoxes = Math.ceil(calculatedArea / product.metersPerBox);
    setBoxesNeeded(calculatedBoxes);
  };

  const handleColorClick = (index: number) => {
    const selectedColor = product.colors[index];
    setCurrentColorIndex(index);
  
    // Atualiza a imagem principal com base no imageRefIndex da cor
    if (Array.isArray(product.image)) {
      setCurrentImage(product.image[selectedColor.imageRefIndex]);
    }
  };
  
  return (
    <Card
      ref={cardRef}
      sx={{
        padding: "16px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #E6E3DB",
        borderRadius: "8px",
      }}
    >
      <CardMedia
        component="img"
        height="275"
        image={currentImage || "/path/to/default-image.png"}
        alt={product.name}
        sx={{
          transition: "0.3s ease-in-out",
          objectFit: "cover",
        }}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        <Typography variant="h6" color="#313926">
          R$ {product.price.toFixed(2).replace(".", ",")} m<sup>2</sup>
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
          {product.colors.map((color, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 1 }}
            >
              <Avatar
                src={color.image}
                alt={color.name}
                sx={{
                  width: 55,
                  height: 55,
                  border:
                    currentColorIndex === index
                      ? "2px solid #313926"
                      : "1px solid #E6E3DB",
                  cursor: "pointer",
                  transition: "border-color 0.3s",
                }}
                onClick={() => handleColorClick(index)}
              />
            </motion.div>
          ))}
        </Box>

        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <TextField
            label="Comprimento (m)"
            type="number"
            value={length || ""}
            onChange={(e) => setLength(parseFloat(e.target.value))}
            size="small"
            sx={{ width: "100%" }}
          />
          <TextField
            label="Largura (m)"
            type="number"
            value={width || ""}
            onChange={(e) => setWidth(parseFloat(e.target.value))}
            size="small"
            sx={{ width: "100%" }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "16px",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCalculateArea}
            sx={{ width: "48%", borderColor: "#313926", color: "#313926" }}
          >
            Calcular
          </Button>
          <Button
            onClick={handleAddToCart}
            variant="contained"
            sx={{
              backgroundColor: "#313926",
              color: "#fff",
              width: "48%",
              "&:hover": { backgroundColor: "#3d403a" },
            }}
          >
            <ShoppingCartIcon />
            <Typography sx={{ ml: 1 }}>Adicionar</Typography>
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: "center" }}
        >
          Área Total: {area.toFixed(2)} m² - Caixas Necessárias: {boxesNeeded}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
