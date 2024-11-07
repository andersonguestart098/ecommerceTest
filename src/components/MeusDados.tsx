import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface User {
  name: string;
  surname: string;
  email: string;
  cpf: string;
  rg: string;
  phone: string;
  tipoUsuario: string;
  address: Address; // Ajuste: Address é um objeto
}

const MeusDados: React.FC = () => {
  const [userData, setUserData] = useState<User>({
    name: "",
    surname: "",
    email: "",
    cpf: "",
    rg: "",
    phone: "",
    tipoUsuario: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/profile",
        { headers: { "x-auth-token": token } }
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Erro ao buscar os dados do usuário:", error);
      alert("Erro ao carregar os dados do usuário");
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://ecommerce-fagundes-13c7f6f3f0d3.herokuapp.com/users/update",
        {
          name: userData.name,
          cpf: userData.cpf,
          phone: userData.phone,
          address: userData.address,
        },
        { headers: { "x-auth-token": token } }
      );
      alert("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      alert("Erro ao atualizar os dados.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (field: keyof User | keyof Address, value: string) => {
    if (field in userData.address) {
      // Atualiza os campos do endereço
      setUserData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [field as keyof Address]: value,
        },
      }));
    } else {
      // Atualiza os outros campos do usuário
      setUserData((prevData) => ({
        ...prevData,
        [field as keyof User]: value,
      }));
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        backgroundColor: "#E6E3DB",
        color: "#313926",
        maxWidth: "600px",
        margin: "auto",
        mt: 4,
        borderRadius: "10px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <AccountCircleIcon sx={{ fontSize: 40, mr: 1, color: "#313926" }} />
        <Typography variant="h5" fontWeight="bold">
          Meus dados
        </Typography>
      </Box>

      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Nome"
          value={userData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          variant="outlined"
          fullWidth
          InputProps={{
            style: { color: "#313926" },
          }}
          InputLabelProps={{ style: { color: "#313926" } }}
        />
        <TextField
          label="Sobrenome"
          value={userData.surname}
          variant="outlined"
          disabled
          fullWidth
          InputProps={{
            style: { color: "#313926" },
          }}
          InputLabelProps={{ style: { color: "#313926" } }}
        />
        <TextField
          label="Cadastrado como"
          value={userData.tipoUsuario}
          variant="outlined"
          disabled
          fullWidth
          InputProps={{
            style: { color: "#313926" },
          }}
          InputLabelProps={{ style: { color: "#313926" } }}
        />
        <TextField
          label="CPF"
          value={userData.cpf}
          onChange={(e) => handleChange("cpf", e.target.value)}
          variant="outlined"
          fullWidth
          InputProps={{
            style: { color: "#313926" },
          }}
          InputLabelProps={{ style: { color: "#313926" } }}
        />
        <TextField
          label="RG"
          value={userData.rg}
          variant="outlined"
          disabled
          fullWidth
          InputProps={{
            style: { color: "#313926" },
          }}
          InputLabelProps={{ style: { color: "#313926" } }}
        />
        <TextField
          label="Telefone"
          value={userData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          variant="outlined"
          fullWidth
          InputProps={{
            style: { color: "#313926" },
          }}
          InputLabelProps={{ style: { color: "#313926" } }}
        />
        <Typography variant="h6" fontWeight="bold">
          Endereço
        </Typography>
        <TextField
          label="Rua"
          value={userData.address.street}
          onChange={(e) => handleChange("street", e.target.value)}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Cidade"
          value={userData.address.city}
          onChange={(e) => handleChange("city", e.target.value)}
          variant="outlined"
          fullWidth
        />

        <TextField
          label="Estado"
          value={userData.address.state}
          onChange={(e) => handleChange("state", e.target.value)}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="CEP"
          value={userData.address.postalCode}
          onChange={(e) => handleChange("postalCode", e.target.value)}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="País"
          value={userData.address.country}
          onChange={(e) => handleChange("country", e.target.value)}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="E-mail Cadastrado"
          value={userData.email}
          variant="outlined"
          disabled
          fullWidth
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#313926",
            color: "#fff",
            "&:hover": { backgroundColor: "#45a049" },
          }}
          fullWidth
          onClick={handleUpdate}
        >
          Atualizar Dados
        </Button>
      </Box>
    </Paper>
  );
};

export default MeusDados;
