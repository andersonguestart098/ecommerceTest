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
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import SearchBar from "./SearchBar";
import { useSocket } from "../contexts/SocketContext";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

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

const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  showSearch,
  toggleSearch,
}) => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const theme = useTheme();
  const socket = useSocket();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, logout } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Verificar o tipo de usuário diretamente no localStorage
  const userType =
    user?.type || JSON.parse(localStorage.getItem("user") || "{}")?.tipoUsuario;

  useEffect(() => {
    socket?.on("welcomeMessage", (msg: string) => {
      setSnackbarMessage(msg);
      setOpenSnackbar(true);
    });

    return () => {
      socket?.off("welcomeMessage");
    };
  }, [socket]);

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    handleCloseMenu();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Função para iniciar a busca e dar o scroll para baixo
  const initiateSearch = (term: string) => {
    onSearch(term, "", "", ""); // Chama a função de busca
    window.scrollTo({
      top: 500, // Ajuste esse valor para controlar o quão para baixo será o scroll
      behavior: "smooth",
    });
  };

  return (
<AppBar
  position="fixed"
  sx={{
    backgroundColor: "#fff",
    color: "#000",
    boxShadow: "none",
    padding: "0 10px",
    height: "94px",
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
          width: isMobile ? "146px" : "180px",
          cursor: "pointer",
          paddingBottom: 5,
        }}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          navigate("/");
        }}
      />
    </Box>

    {/* SearchBar fixa no mobile */}
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: isMobile ? "60%" : "50%",
        position: "relative",
      }}
    >
      <SearchBar
        onSearch={(term) => {
          setSearchTerm(term);
          initiateSearch(term);
        }}
      />
    </Box>

    <Box sx={{ display: "flex", alignItems: "center" }}>
      {user ? (
        <>
          <Typography
            sx={{
              color: "#313926",
              fontSize: isMobile ? "1rem" : "1.1rem",
              marginRight: isMobile ? "5px" : "10px",
              cursor: "pointer",
            }}
          >
            Olá, {user.name}
          </Typography>

          {userType === "admin" ? (
            <>
              {/* Ícone de engrenagem no desktop e no mobile */}
              <IconButton onClick={handleUserClick} sx={{ padding: "6px" }}>
                <SettingsSuggestIcon
                  sx={{
                    color: "#313926",
                    fontSize: isMobile ? "2rem" : "1.8rem",
                  }}
                />
              </IconButton>
              
              {/* Menu para admin */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={() => handleNavigate("/admin")}>
                  <IconButton>
                    <SettingsSuggestIcon />
                  </IconButton>
                  Gerenciador
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <IconButton>
                    <LogoutIcon />
                  </IconButton>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : isMobile ? (
            <>
              {/* Menu com Badge no mobile */}
              <IconButton
                onClick={handleUserClick}
                sx={{
                  padding: "6px",
                  marginRight: "5px",
                }}
              >
                <Badge
                  badgeContent={cart.length}
                  color="primary"
                >
                  <MenuIcon
                    sx={{
                      color: "#313926",
                      fontSize: "2rem",
                    }}
                  />
                </Badge>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={() => handleNavigate("/cart")}>
                  <IconButton>
                    <Badge badgeContent={cart.length} color="primary">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                  Carrinho
                </MenuItem>
                <MenuItem onClick={() => handleNavigate("/my-orders")}>
                  <IconButton>
                    <LocalShippingIcon />
                  </IconButton>
                  Meus Pedidos
                </MenuItem>
                <MenuItem onClick={() => handleNavigate("/meus-dados")}>
                  <IconButton>
                    <ManageAccountsIcon />
                  </IconButton>
                  Meus Dados
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <IconButton>
                    <LogoutIcon />
                  </IconButton>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* Carrinho fixo no desktop */}
              <IconButton
                onClick={() => navigate("/cart")}
                sx={{ padding: 0, marginRight: "10px" }}
              >
                <Badge badgeContent={cart.length} color="primary">
                  <ShoppingCartIcon
                    sx={{ color: "#313926", fontSize: "1.8rem" }}
                  />
                </Badge>
              </IconButton>

              {/* Menu no Desktop */}
              <IconButton
                onClick={handleUserClick}
                sx={{
                  padding: "6px",
                }}
              >
                <MenuIcon
                  sx={{
                    color: "#313926",
                    fontSize: "1.8rem",
                  }}
                />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                {/* Carrinho removido no menu desktop */}
                <MenuItem onClick={() => handleNavigate("/my-orders")}>
                  <IconButton>
                    <LocalShippingIcon />
                  </IconButton>
                  Meus Pedidos
                </MenuItem>
                <MenuItem onClick={() => handleNavigate("/meus-dados")}>
                  <IconButton>
                    <ManageAccountsIcon />
                  </IconButton>
                  Meus Dados
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <IconButton>
                    <LogoutIcon />
                  </IconButton>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </>
      ) : (
        <>
          <Button
            onClick={() => navigate("/login")}
            sx={{
              color: "#313926",
              fontSize: isMobile ? "0.9rem" : "1.1rem",
              marginRight: "5px",
            }}
          >
            Entrar
          </Button>

          {/* Ícone do Carrinho Sempre Visível */}
          <IconButton onClick={() => navigate("/cart")} sx={{ padding: 0 }}>
            <Badge badgeContent={cart.length} color="primary">
              <ShoppingCartIcon
                sx={{ color: "#313926", fontSize: "1.8rem" }}
              />
            </Badge>
          </IconButton>
        </>
      )}
    </Box>
  </Toolbar>

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
