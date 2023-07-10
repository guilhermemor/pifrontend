import React, { useState, useContext } from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../../services/firebaseConnections";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { signUp, loadingAuth } = useContext(AuthContext);

  async function checkEmailExists(email) {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0; 
    } catch (error) {
      return false; 
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (name !== "" && email !== "" && password !== "") {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError("O email fornecido já está sendo usado por outro usuário.");
        return;
      }

      signUp(email, password, name);
    }

    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <div className="containerCenter">
      <div className="login">
        <div className="loginArea">
          <img src={logo} alt="Logo do sistema de chamado" />
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Nova Conta</h1>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="8"
          />

          <button type="submit" value="Acessar">
            {loadingAuth ? "Cadastrando..." : "Cadastrar"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>

        <Link to="/">Já possui uma conta? Faça login</Link>
      </div>
    </div>
  );
};

export default SignUp;