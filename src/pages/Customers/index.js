import React, { useState, useContext } from "react";
import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiUser } from "react-icons/fi";
import { db } from "../../services/firebaseConnections";
import { addDoc, collection } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const Custumers = () => {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const {user} = useContext(AuthContext);

  // Função para validar o CNPJ
  const validateCnpj = (value) => {
    const cnpjPattern = /^\d+$/;
    return cnpjPattern.test(value);
  };

  async function handleRegister(e) {
    e.preventDefault();
    if (nome !== "" && cnpj !== "" && endereco !== "") {
      // Validação do CNPJ
      if (!validateCnpj(cnpj)) {
        toast.error("CNPJ inválido! Digite apenas números.");
        return;
      }
  
      if (user && user.uid) {
        await addDoc(collection(db, "customers"), {
          nomeFantasia: nome,
          cnpj: cnpj,
          endereco: endereco,
          clienteId: user.uid
        })
          .then(() => {
            setNome("");
            setCnpj("");
            setEndereco("");
            toast.success("Empresa registrada!");
          })
          .catch((error) => {
            toast.error("Erro ao Cadastrar!");
          });
      } else {
        toast.error("Usuário não autenticado!");
      }
    } else {
      toast.error("Preencha todos os campos!");
    }
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Clientes">
          <FiUser size={25} />
        </Title>

        <div className="container">
          <form className="formProfile" onSubmit={handleRegister}>
            <label>Nome Fantasia</label>
            <input
              type="text"
              placeholder="Nome da Empresa"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <label>CNPJ</label>
            <input
              type="text"
              placeholder="CNPJ"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
            <label>Endereço</label>
            <input
              type="text"
              placeholder="Endereço da Empresa"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />

            <button type="submit">Salvar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Custumers;
