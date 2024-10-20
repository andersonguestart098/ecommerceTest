import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
  InputBase,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom"; 
import { useCart } from "../contexts/CartContext"; // Importa o contexto

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart(); // Usa o contexto para obter o carrinho
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showSearch, setShowSearch] = useState(false);

  const handleCartClick = () => {
    navigate("/cart");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#fff",
        color: "#000",
        boxShadow: "none",
        padding: "0 20px",
        height: "94px",
        zIndex: 1300,
      }}
      onClick={scrollToTop}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src="/icones/logo.png"
            alt="Logo"
            style={{ width: "180px", cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
        </Box>
        {isMobile ? (
          <IconButton
            onClick={() => setShowSearch(!showSearch)}
            sx={{ marginLeft: "auto" }}
          >
            <SearchIcon />
          </IconButton>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#E6E3DB",
              borderRadius: "4px",
              padding: "4px 8px",
              flexGrow: 1,
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            <InputBase placeholder="Buscar produtos" sx={{ ml: 1, flex: 1 }} />
            <IconButton type="submit" aria-label="search">
              <SearchIcon />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            sx={{
              color: "#313926",
              fontSize: "1rem",
              padding: "6px 10px",
              display: isMobile ? "none" : "block",
            }}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="cart"
            onClick={handleCartClick}
            className="cart-icon"
            sx={{ padding: "8px" }}
          >
            <Badge badgeContent={cart.length} color="primary">
              <ShoppingCartIcon sx={{ color: "#313926", fontSize: "1.8rem" }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
