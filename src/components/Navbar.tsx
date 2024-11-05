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
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
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
  const [showSearchIcon, setShowSearchIcon] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Verificar o tipo de usuário diretamente no localStorage
  const userType = user?.type || JSON.parse(localStorage.getItem("user") || "{}")?.tipoUsuario;

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

  const handleSearchIconClick = () => {
    toggleSearch();
    setShowSearchIcon(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Log para verificar o tipo de usuário
  console.log("User type:", userType);

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
              width: isMobile ? "120px" : "180px",
              cursor: "pointer",
              paddingBottom: 5,
            }}
            onClick={() => navigate("/")}
          />
        </Box>

        {/* SearchBar para desktop e mobile */}
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
          {isMobile ? (
            <Collapse in={showSearch} orientation="horizontal" timeout="auto">
              <SearchBar
                onSearch={(term) => {
                  onSearch(term, "", "", "");
                  setSearchTerm(term);
                }}
              />
            </Collapse>
          ) : (
            <SearchBar
              onSearch={(term) => {
                onSearch(term, "", "", "");
                setSearchTerm(term);
              }}
            />
          )}
          {showSearch && searchTerm && (
            <Box
              sx={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginTop: "5px",
              }}
            >
              <IconButton
                onClick={handleClearSearch}
                sx={{
                  padding: "3px",
                  fontSize: "0.8rem",
                  color: "#313926",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "5px",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                Limpar Filtros
              </IconButton>
            </Box>
          )}
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
                onClick={handleUserClick}
              >
                Olá, {user.name}
              </Typography>

              {isMobile && showSearchIcon && (
                <IconButton onClick={handleSearchIconClick} sx={{ padding: 0 }}>
                  <SearchIcon sx={{ color: "#313926", fontSize: "2rem" }} />
                </IconButton>
              )}

              <IconButton
                onClick={handleUserClick}
                sx={{
                  padding: "6px",
                  marginRight: isMobile ? "5px" : "10px",
                }}
              >
                {userType === "admin" ? (
                  <SettingsSuggestIcon
                    sx={{ color: "#313926", fontSize: isMobile ? "2rem" : "1.8rem" }}
                  />
                ) : (
                  <MenuOpenIcon sx={{ color: "#313926", fontSize: isMobile ? "2rem" : "1.8rem" }} />
                )}
              </IconButton>

              {/* Menu dropdown com opções baseadas no tipo de usuário */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                {userType === "admin" ? (
                  <MenuItem onClick={() => handleNavigate("/admin")}>
                    <IconButton>
                      <SettingsSuggestIcon />
                    </IconButton>
                    Gerenciador
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem onClick={() => handleNavigate("/my-orders")}>
                      <IconButton>
                        <MenuOpenIcon />
                      </IconButton>
                      Meus Pedidos
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate("/meus-dados")}>
                      <IconButton>
                        <MenuOpenIcon />
                      </IconButton>
                      Meus Dados
                    </MenuItem>
                  </>
                )}
              </Menu>

              {!isMobile && (
                <>
                  <IconButton onClick={() => navigate("/cart")} sx={{ marginRight: "10px" }}>
                    <Badge badgeContent={cart.length} color="primary">
                      <ShoppingCartIcon sx={{ color: "#313926", fontSize: "1.8rem" }} />
                    </Badge>
                  </IconButton>
                  <IconButton onClick={handleLogout} sx={{ marginRight: "10px" }}>
                    <LogoutIcon sx={{ color: "#313926", fontSize: "1.8rem" }} />
                  </IconButton>
                </>
              )}
            </>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              sx={{ color: "#313926", fontSize: isMobile ? "0.9rem" : "1.1rem", marginRight: "5px" }}
            >
              Entrar
            </Button>
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
