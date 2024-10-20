import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  InputBase,
  Badge,
  useMediaQuery,
  useTheme,
  Typography,
  Drawer,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showSearch, setShowSearch] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserName(parsedUser.name);
    }
  }, []);

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleLogout = () => {
    // Remove token and user info for logout
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserName(null);
    navigate("/"); // Redirect to home or login page
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleCloseMenu();
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
              width: isMobile ? "120px" : "180px", // Maior no desktop, menor no mobile
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          />
        </Box>

        {/* Input de Busca para dispositivos maiores */}
        {!isMobile && (
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

        {/* Saudação, Login, Logout e Carrinho */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Ícone de busca para mobile */}
          {isMobile && (
            <IconButton
              onClick={() => setShowSearch(!showSearch)}
              sx={{ padding: "8px" }}
            >
              <SearchIcon sx={{ fontSize: "1.8rem", color: "#313926" }} />
            </IconButton>
          )}

          {/* Saudação ao usuário com menu suspenso */}
          {userName && !isMobile && (
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
            </>
          )}

          {/* Botão de Login */}
          {!userName && (
            <Button
              onClick={handleLoginClick}
              sx={{
                color: "#313926",
                fontSize: "1rem",
                marginRight: "10px",
              }}
            >
              Entrar
            </Button>
          )}

          {/* Ícone de Logout */}
          {userName && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="logout"
              onClick={handleLogout}
              sx={{ padding: "8px", marginRight: "10px" }}
            >
              <LogoutIcon sx={{ color: "#313926", fontSize: "1.8rem" }} />
            </IconButton>
          )}

          {/* Ícone do Carrinho */}
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

        {/* Barra de pesquisa para dispositivos móveis */}
        {showSearch && isMobile && (
          <Drawer
            anchor="top"
            open={showSearch}
            onClose={() => setShowSearch(false)}
            sx={{
              "& .MuiDrawer-paper": {
                backgroundColor: "#E6E3DB",
                padding: "10px",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fff",
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
          </Drawer>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
