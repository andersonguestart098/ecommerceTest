import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";
import { useUser } from "../../contexts/UserContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();
  const { setUser } = useUser();

  const location = useLocation();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      // Salva o token e os dados do usuário
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user); // Atualiza o contexto global de usuário, se existir

      // Redireciona o usuário
      const redirectPath = location.state?.from || "/";
      navigate(redirectPath);
    } catch (err: any) {
      setError("Credenciais inválidas.");
      console.error("Erro ao fazer login:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Entre para Continuar
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, backgroundColor: "#313926" }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Entrar"
            )}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 1, color: "#313926", borderColor: "#313926" }}
            onClick={handleRegisterClick}
          >
            Registrar-se
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
