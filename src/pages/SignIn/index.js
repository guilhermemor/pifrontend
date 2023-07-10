import React, { useState, useContext } from "react";
import "./signin.css";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn, loadingAuth } = useContext(AuthContext);

  async function handleSignIn(e) {
    e.preventDefault();
    if (email !== "" && password !== "") {
      await signIn(email, password);
    }
    setEmail("");
    setPassword("");
  }

  return (
    <div className="containerCenter">
      <div className="login">
        <div className="loginArea">
          <img src={logo} alt="Logo do sistema de chamado" />
        </div>

        <form onSubmit={handleSignIn}>
          <h1>Entrar</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            minLength="8"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" value="Acessar">
            {loadingAuth ? "Carregando..." : "Acessar"}
          </button>
        </form>

        <Link to="/register">Criar uma Conta</Link>
      </div>
    </div>
  );
};

export default SignIn;
