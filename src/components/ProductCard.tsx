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
  image: string[] | string;
  metersPerBox: number;
  colors: { name: string; image: string; imageRefIndex: number }[];
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
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [startIndex, setStartIndex] = useState(0);
  const [imageArray, setImageArray] = useState<string[]>([]);
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

  useEffect(() => {
    if (typeof product.image === "string") {
      try {
        const parsedImages = JSON.parse(product.image);
        if (Array.isArray(parsedImages)) {
          setImageArray(parsedImages);
        } else {
          console.error("Unexpected image format");
        }
      } catch (e) {
        console.error("Error parsing images:", e);
      }
    } else {
      setImageArray(product.image);
    }
  }, [product.image]);

  const handleAddToCart = () => {
    const quantityToAdd = boxesNeeded > 0 ? boxesNeeded : 1;
    const selectedColor = product.colors[currentImageIndex];

    // Armazena a cor selecionada no localStorage
    console.log("Salvando cor selecionada:", selectedColor);
    localStorage.setItem(
      `selectedColor_${product.id}`,
      JSON.stringify(selectedColor)
    );

    // Adiciona ao carrinho com a imagem e cor selecionadas
    addToCart({
      ...product,
      image: selectedColor.image, // Usa a imagem da cor selecionada
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
    if (product.colors[index]) {
      const color = product.colors[index];
      if (color && color.imageRefIndex !== null && imageArray[color.imageRefIndex]) {
        setCurrentImageIndex(color.imageRefIndex); // Usa o índice da imagem principal associada à cor
      } else {
        console.error("Imagem principal correspondente não encontrada.");
      }
    }
  };
  

  const handleMouseEnter = () => {
    if (imageArray && imageArray.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageArray.length);
    }
  };

  return (
    <>
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
          image={imageArray[currentImageIndex] || "/path/to/default-image.png"}
          alt={product.name}
          onMouseEnter={handleMouseEnter}
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

          {/* Seção de cores */}
          <Box
  sx={{
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    position: "relative",
    mt: 2,
  }}
>
  {/* Botão de voltar no carrossel */}
  <Button
    onClick={() => setStartIndex((prev) => Math.max(prev - 1, 0))}
    disabled={startIndex === 0}
    sx={{
      position: "absolute",
      left: "-30px",
      top: "50%",
      transform: "translateY(-50%)",
      visibility: startIndex > 0 ? "visible" : "hidden",
    }}
  >
    {"<"}
  </Button>

  {/* Ícones de cores exibidos */}
  <Box
  sx={{
    display: "flex",
    gap: 1.5, // Espaçamento entre os ícones
    overflow: "visible", // Permite que o ícone ampliado não seja cortado
    alignItems: "center", // Centraliza os ícones no eixo vertical
    width: "calc(65px * 3 + 16px)", // Espaço suficiente para 3 ícones
    height: 80, // Altura maior para acomodar o efeito de hover
  }}
>
  {product.colors.slice(startIndex, startIndex + 3).map((color, index) => (
    <motion.div
      key={index}
      whileHover={{ scale: 1.2 }} // Efeito de hover
      whileTap={{ scale: 1 }}
    >
      <Avatar
        src={color.image}
        alt={color.name}
        sx={{
          width: 60, // Tamanho padrão dos ícones
          height: 60, // Tamanho padrão dos ícones
          border:
            currentImageIndex === index + startIndex
              ? "3px solid #E6E3DB" // Destaque mais espesso para o ícone selecionado
              : "1px solid #E6E3DB",
          cursor: "pointer",
          transition: "border-color 0.3s",
        }}
        onClick={() => handleColorClick(index + startIndex)}
      />
    </motion.div>
  ))}
</Box>


  {/* Botão de avançar no carrossel */}
  <Button
    onClick={() =>
      setStartIndex((prev) =>
        Math.min(prev + 1, product.colors.length - 3)
      )
    }
    disabled={startIndex + 3 >= product.colors.length}
    sx={{
      position: "absolute",
      right: "-30px",
      top: "50%",
      transform: "translateY(-50%)",
      visibility:
        startIndex + 3 < product.colors.length ? "visible" : "hidden",
    }}
  >
    {">"}
  </Button>

  {/* Nome da cor selecionada */}
  <Typography
    variant="body2"
    sx={{
      mt: 1, // Margem ajustada
      textAlign: "center",
      color: "#313926",
      fontWeight: "bold",
    }}
  >
    Cor selecionada: {product.colors[currentImageIndex]?.name || "Nenhuma"}
  </Typography>
</Box>


          {/* Inputs de Comprimento e Largura */}
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

          {/* Botões lado a lado */}
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

          {/* Resultado do Cálculo */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: "center" }}
          >
            Área Total: {area.toFixed(2)} m² - Caixas Necessárias: {boxesNeeded}
          </Typography>
        </CardContent>
      </Card>

      {/* Clone para a animação de fly-to-cart */}
      {showClone && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            top: cloneStyles.top,
            left: cloneStyles.left,
            width: cloneStyles.width,
            height: cloneStyles.height,
            scale: 0.2,
            opacity: 0,
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            position: "fixed",
            top: cloneStyles.top,
            left: cloneStyles.left,
            zIndex: 1000,
            width: cloneStyles.width,
            height: cloneStyles.height,
            pointerEvents: "none",
          }}
        >
          <CardMedia
            component="img"
            height="275"
            image={
              imageArray[currentImageIndex] || "/path/to/default-image.png"
            }
            alt={product.name}
          />
        </motion.div>
      )}
    </>
  );
};

export default ProductCard;