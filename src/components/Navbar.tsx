import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
  InputBase,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom"; // Para navegação
import { useCart } from "../contexts/CartContext"; // Para acessar o contexto do carrinho

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart(); // Pega o estado do carrinho

  const handleCartClick = () => {
    navigate("/cart"); // Navega para a página do carrinho
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#fff",
        color: "#000",
        boxShadow: "none",
        padding: "0 20px",
        height: "60px",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "70px",
        }}
      >
        {/* Logo ajustada */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src="/produtos/logos/" alt="Logo" style={{ height: "70px" }} />
        </Box>

        {/* Barra de busca */}
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

        {/* Botões Login e Carrinho */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button sx={{ color: "#313926" }} onClick={() => navigate("/login")}>
            Login
          </Button>

          {/* Carrinho com a quantidade de itens */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="cart"
            onClick={handleCartClick}
          >
            <Badge badgeContent={cart.length} color="primary">
              <ShoppingCartIcon sx={{ color: "#313926" }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
