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
  Button,
  Snackbar,
  SnackbarContent,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import SearchBar from "./SearchBar";
import { useSocket } from "../contexts/SocketContext";

interface NavbarProps {
  onSearch: (
    searchTerm: string,
    color: string,
    minPrice: number | "",
    maxPrice: number | ""
  ) => void;
  showSearch: boolean;
  toggleSearch: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, showSearch, toggleSearch }) => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const theme = useTheme();
  const socket = useSocket();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [userName, setUserName] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserName(parsedUser.name);
    }

    socket?.on("welcomeMessage", (msg: string) => {
      setSnackbarMessage(msg);
      setOpenSnackbar(true);
      const userNameFromMessage = msg.split(",")[1]?.trim();
      if (userNameFromMessage) setUserName(userNameFromMessage);
    });

    return () => {
      socket?.off("welcomeMessage");
    };
  }, [socket]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

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
        padding: "0 10px",
        height: isMobile ? "70px" : "94px",
        zIndex: 1300,
        borderBottom: "2px solid #E6E3DB",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
          padding: isMobile ? "0 5px" : "0 20px",
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
              width: isMobile ? "100px" : "180px",
              cursor: "pointer",
              paddingBottom: 5,
            }}
            onClick={() => navigate("/")}
          />
        </Box>

        {/* SearchBar ou Ícone de Lupa */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: isMobile ? "60%" : "40%",
          }}
        >
          {isMobile ? (
            <>
              <Collapse in={showSearch} orientation="horizontal" timeout="auto">
                <SearchBar onSearch={onSearch} />
              </Collapse>
              {!showSearch && (
                <IconButton onClick={toggleSearch} sx={{ padding: 0 }}>
                  <SearchIcon sx={{ color: "#313926", fontSize: "1.5rem" }} />
                </IconButton>
              )}
            </>
          ) : (
            <SearchBar onSearch={onSearch} />
          )}
        </Box>

        {/* Saudação, Login, Logout e Carrinho */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {userName ? (
            <>
              <Typography
                sx={{
                  color: "#313926",
                  fontSize: "0.9rem",
                  marginRight: isMobile ? "5px" : "10px",
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
              <IconButton
                onClick={handleLogout}
                sx={{ padding: "6px", marginRight: isMobile ? "5px" : "10px" }}
              >
                <LogoutIcon sx={{ color: "#313926", fontSize: "1.5rem" }} />
              </IconButton>
            </>
          ) : (
            <Button
              onClick={handleLoginClick}
              sx={{ color: "#313926", fontSize: "0.9rem", marginRight: "5px" }}
            >
              Entrar
            </Button>
          )}

          {/* Ícone do Carrinho */}
          <IconButton
            onClick={handleCartClick}
            className="cart-icon"
            sx={{ padding: "6px" }}
          >
            <Badge badgeContent={cart.length} color="primary">
              <ShoppingCartIcon sx={{ color: "#313926", fontSize: "1.5rem" }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Snackbar para notificações */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <SnackbarContent
          style={{
            backgroundColor: "#fff",
            color: "#313926",
            fontFamily: "Arial, sans-serif",
            fontSize: "1rem",
          }}
          message={snackbarMessage}
        />
      </Snackbar>
    </AppBar>
  );
};

export default Navbar;
