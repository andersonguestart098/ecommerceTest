import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Para redirecionar o usuário após o login

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook de navegação

  const handleLogin = async () => {
    setError("");
  
    try {
      const response = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
      });
      const { token, user } = response.data;
  
      // Armazene o token e o nome do usuário no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
  
      // Exibe uma mensagem de sucesso e redireciona o usuário
      alert(`Login realizado com sucesso! Olá, ${user.name}`);
      navigate("/"); // Redireciona para a página inicial após o login
    } catch (err) {
      setError("Credenciais inválidas.");
      console.error("Erro ao fazer login:", err);
    }
  };

  const handleRegisterClick = () => {
    navigate("/register"); // Redireciona para a página de registro
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
          >
            Entrar
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
