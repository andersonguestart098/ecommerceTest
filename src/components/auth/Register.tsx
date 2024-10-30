import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Alert,
} from "@mui/material";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("cliente"); // Default como cliente
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/register",
        {
          name,
          email,
          password,
          tipoUsuario,
          cpf,
          phone,
          address: {
            street,
            city,
            state,
            postalCode,
            country,
          },
        }
      );
      console.log("Usuário registrado com sucesso:", response.data);
      navigate("/login");
    } catch (err) {
      console.error("Erro ao registrar usuário:", err);
      setError("Erro ao registrar. Tente novamente.");
    }
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
          Registrar-Se
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nome"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
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
          <TextField
            margin="normal"
            fullWidth
            id="tipoUsuario"
            label="Tipo de Usuário"
            value={tipoUsuario}
            onChange={(e) => setTipoUsuario(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="cpf"
            label="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Typography component="h6" variant="h6" sx={{ mt: 2 }}>
            Endereço
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="street"
            label="Rua"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="city"
            label="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="state"
            label="Estado"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="postalCode"
            label="CEP"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="country"
            label="País"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, backgroundColor: "#313926" }}
            onClick={handleRegister}
          >
            Registrar
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
