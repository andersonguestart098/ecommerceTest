import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Usado para redirecionamento

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/users/register",
        {
          name,
          email,
          password,
        }
      );
      console.log("Usuário registrado com sucesso:", response.data);
      // Redirecionar para a página de login após o registro
      navigate("/login");
    } catch (err) {
      console.error("Erro ao registrar usuário:", err);
      setError("Erro ao registrar. Tente novamente.");
    }
  };

  return (
    <div>
      <h2>Registrar-se</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button onClick={handleRegister}>Registrar</button>
    </div>
  );
};

export default Register;
