import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Badge,
  useMediaQuery,
  useTheme,
  Typography,
  Menu,
  MenuItem,
  Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import SearchBar from "./SearchBar";

interface NavbarProps {
  onSearch: (searchTerm: string, color: string, minPrice: number | "", maxPrice: number | "") => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [userName, setUserName] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserName(parsedUser.name);
    }
  }, []);

  const handleCartClick = () => navigate("/cart");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserName(null);
    navigate("/");
  };

  const handleLoginClick = () => navigate("/login");

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    handleCloseMenu();
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
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
          padding: isMobile ? "0 10px" : "0 20px",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginLeft: isMobile ? "0" : "10px",
          }}
        >
          <img
            src="/icones/logo.png"
            alt="Logo"
            style={{
              width: isMobile ? "120px" : "180px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          />
        </Box>

        {/* Única SearchBar */}
        <Box sx={{ flexGrow: 1, marginLeft: "20px", maxWidth: isMobile ? "80%" : "40%" }}>
          <SearchBar onSearch={onSearch} />
        </Box>

        {/* Saudação, Login, Logout e Carrinho */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {userName ? (
            <>
              <Typography
                sx={{
                  color: "#313926",
                  fontSize: "1rem",
                  marginRight: "10px",
                  cursor: "pointer",
                }}
                onClick={handleUserClick}
              >
                Olá, {userName}
              </Typography>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={() => handleNavigate("/my-orders")}>
                  Meus Pedidos
                </MenuItem>
                <MenuItem onClick={() => handleNavigate("/meus-dados")}>
                  Meus Dados
                </MenuItem>
              </Menu>
              <IconButton onClick={handleLogout} sx={{ padding: "8px", marginRight: "10px" }}>
                <LogoutIcon sx={{ color: "#313926", fontSize: "1.8rem" }} />
              </IconButton>
            </>
          ) : (
            <Button onClick={handleLoginClick} sx={{ color: "#313926", fontSize: "1rem", marginRight: "10px" }}>
              Entrar
            </Button>
          )}

          {/* Ícone do Carrinho */}
          <IconButton onClick={handleCartClick} sx={{ padding: "8px" }}>
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
