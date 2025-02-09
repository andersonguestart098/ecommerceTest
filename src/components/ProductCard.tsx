import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  useMediaQuery,
  Dialog,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { motion } from "framer-motion";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [startIndex, setStartIndex] = useState(0);
  const [imageArray, setImageArray] = useState<string[]>([]);
  const [showClone, setShowClone] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [currentColorIndex, setCurrentColorIndex] = useState<number>(0);
  const [mainImage, setMainImage] = useState<string>("");

  const openFullscreen = () => setIsFullscreenOpen(true);
  const closeFullscreen = () => setIsFullscreenOpen(false);

  const [cloneStyles, setCloneStyles] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>({ top: 0, left: 0, width: 0, height: 0 });

  // Função para determinar a unidade de medida
  const getPriceUnit = (productName: string): string => {
    if (productName.includes("rodapé")) return "Pc";
    if (productName.includes("Rodapé")) return "Pc";
    if (productName.includes("massa")) return "Tubp";
    if (productName.includes("Mapei Planiseal")) return "Bd";
    if (productName.includes("Mapei Ultrabond")) return "Bd";
    if (productName.includes("Perfil Incizo")) return "Pc";
    if (productName.includes("Hydrokit")) return "Pc";
    if (productName.includes("Mapei Triblock")) return "Bd";
    if (productName.includes("Ultrabond Mapei")) return "Bd";
    if (productName.includes("Mapei Profas")) return "Lt";
    if (productName.includes("Mapei Primer")) return "Lt";
    if (productName.includes("Autonivelante Mapei")) return "Sc";
    if (productName.includes("Mapei Planiprep")) return "Sc";
    if (productName.includes("Tarucel")) return "M";
    if (productName.includes("Massa para Acabamento Flex")) return "Tb";
    return "m²"; // Unidade padrão
  };

  useEffect(() => {
    const iconRef = document.querySelector(".cart-icon");
    if (iconRef) {
      setCartIconRef(iconRef.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (typeof product.image === "string") {
      setMainImage(product.image);
    } else if (Array.isArray(product.image)) {
      setMainImage(product.image[0]);
    }
  }, [product.image]);

  const handleAddToCart = () => {
    const quantityToAdd = 1; // Quantidade fixa
    const selectedColor = product.colors[currentColorIndex];

    if (!selectedColor) {
      console.error("Nenhuma cor foi selecionada.");
      return;
    }

    addToCart({
      ...product,
      image: selectedColor.image,
      name: `${product.name} - Cor: ${selectedColor.name}`,
      id: `${product.id}-${selectedColor.name}`,
      quantity: quantityToAdd,
    });
  };

  const handleColorClick = (index: number) => {
    setCurrentColorIndex(index);
    const selectedColor = product.colors[index];

    if (selectedColor && selectedColor.imageRefIndex !== null) {
      const imageIndex = selectedColor.imageRefIndex;
      if (Array.isArray(product.image) && product.image[imageIndex]) {
        setMainImage(product.image[imageIndex]);
      } else {
        setMainImage(product.image[0]);
      }
    } else {
      setMainImage(
        typeof product.image === "string" ? product.image : product.image[0]
      );
    }
  };

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
      setImageArray(product.colors.map((color) => color.image));
    }
  }, [product.image, product.colors]);

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
          image={mainImage || "/path/to/default-image.png"}
          alt={product.name}
          onClick={openFullscreen}
          sx={{
            objectFit: "cover",
            width: "100%",
            height: "250px",
            margin: "0 auto",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
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
            R$ {product.price.toFixed(2).replace(".", ",")} {getPriceUnit(product.name)}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mt: 2,
            }}
          >
            <Button
              onClick={() => setStartIndex((prev) => Math.max(prev - 3, 0))}
              disabled={startIndex === 0}
              sx={{
                minWidth: "auto",
                padding: 0,
                color: "#313926",
              }}
            >
              <ArrowBackIosIcon />
            </Button>

            {product.colors.slice(startIndex, startIndex + 3).map((color, index) => (
              <motion.div
                key={index + startIndex}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 1 }}
              >
                <Avatar
                  src={color.image}
                  alt={color.name}
                  sx={{
                    width: 60,
                    height: 60,
                    border:
                      currentColorIndex === index + startIndex
                        ? "2px solid #313926"
                        : "1px solid #E6E3DB",
                    cursor: "pointer",
                    transition: "border-color 0.3s",
                  }}
                  onClick={() => handleColorClick(index + startIndex)}
                />
              </motion.div>
            ))}

            <Button
              onClick={() =>
                setStartIndex((prev) =>
                  Math.min(prev + 3, product.colors.length - 3)
                )
              }
              disabled={startIndex + 3 >= product.colors.length}
              sx={{
                minWidth: "auto",
                padding: 0,
                color: "#313926",
              }}
            >
              <ArrowForwardIosIcon />
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{ mt: 1, textAlign: "center", color: "#313926", fontWeight: "bold" }}
          >
            Cor selecionada: {product.colors[currentColorIndex]?.name || "Nenhuma"}
          </Typography>

          <Button
            onClick={handleAddToCart}
            variant="contained"
            sx={{
              backgroundColor: "#313926",
              color: "#fff",
              width: "100%",
              mt: 2,
              "&:hover": { backgroundColor: "#3d403a" },
            }}
          >
            <ShoppingCartIcon />
            <Typography sx={{ ml: 1 }}>Adicionar</Typography>
          </Button>
        </CardContent>
      </Card>

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
            image={imageArray[currentImageIndex] || "/path/to/default-image.png"}
            alt={product.name}
          />
        </motion.div>
      )}

      {isFullscreenOpen && (
        <Dialog
          open={isFullscreenOpen}
          onClose={closeFullscreen}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            style: {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              boxShadow: "none",
              ...(isMobile
                ? { width: "100vw", height: "100vh", margin: 0 }
                : {}),
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: isMobile ? "100%" : "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              image={mainImage || "/path/to/default-image.png"}
              alt={product.name}
              sx={{
                maxWidth: isMobile ? "100%" : "90%",
                maxHeight: isMobile ? "100%" : "90%",
                objectFit: "contain",
              }}
            />
            <Button
              onClick={closeFullscreen}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                color: "#fff",
                fontSize: "1.5rem",
              }}
            >
              Fechar
            </Button>
          </Box>
        </Dialog>
      )}
    </>
  );
};

export default ProductCard;