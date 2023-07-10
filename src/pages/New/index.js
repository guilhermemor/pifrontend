import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiPlusCircle } from "react-icons/fi";
import "./new.css";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { db } from "../../services/firebaseConnections";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const listRef = collection(db, "customers");

const New = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loadCustomer, setLoadCustomer] = useState(true);
  const [complemento, setComplemento] = useState("");
  const [assunto, setAssunto] = useState("Suporte");
  const [status, setStatus] = useState("Aberto");
  const [customerSelected, setCustomerSelected] = useState(0);
  const [idCustomer, setIdCustumer] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      const querySnapshot = await getDocs(listRef)
        .then((snapshot) => {
          let lista = [];

          snapshot.forEach((doc) => {
            lista.push({
              id: doc.id,
              nomeFantasia: doc.data().nomeFantasia,
            });
          });
          if (snapshot.docs.size === 0) {
            console.log("nenhuma empresa encontrada");
            setCustomers([{ id: "1", nomeFantasia: "Freela" }]);
            setLoadCustomer(false);
            return;
          }
          setCustomers(lista);
          setLoadCustomer(false);

          if (id) {
            loadId(lista);
          }
        })
        .catch((error) => {
          console.log("Erro ao buscar clientes", error);
          setLoadCustomer(false);
          setCustomers([{ id: "1", nomeFantasia: "Freela" }]);
        });
    }
    loadCustomers();
  }, [id]);

  async function loadId(lista) {
    const docRef = doc(db, "chamados", id);
    await getDoc(docRef)
      .then((snapshot) => {
        setAssunto(snapshot.data().assunto);
        setStatus(snapshot.data().status);
        setComplemento(snapshot.data().complemento);

        let index = lista.findIndex(
          (item) => item.id === snapshot.data().clienteId
        );
        setCustomerSelected(index);
        setIdCustumer(true);
      })
      .catch((error) => {
        console.log(error);
        setIdCustumer(false);
      });
  }

  function handleOptionChange(e) {
    setStatus(e.target.value);
  }

  function handleChangeSelect(e) {
    setAssunto(e.target.value);
  }

  function handleChangeCustomer(e) {
    setCustomerSelected(e.target.value);
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (idCustomer) {
      const docRef = doc(db, "chamados", id);
      await updateDoc(docRef, {
        cliente: customers[customerSelected].nomeFantasia,
        clienteId: customers[customerSelected].id,
        assunto: assunto,
        complemento: complemento,
        status: status,
        userId: user.uid,
      })
        .then(() => {
          toast.info("Chamado atualizado com sucesso!");
          setCustomerSelected(0);
          setComplemento("");
          navigate("/dashboard");
        })
        .catch((error) => {
          toast.error("Erro ao atualizar o chamado");
          console.log(error);
        });
      return;
    }

    await addDoc(collection(db, "chamados"), {
      created: new Date(),
      cliente: customers[customerSelected].nomeFantasia,
      clienteId: customers[customerSelected].id,
      assunto: assunto,
      complemento: complemento,
      status: status,
      userId: user.uid,
    })
      .then(() => {
        toast.success("Chamado registrado!");
        setComplemento("");
        setCustomerSelected(0);
      })
      .catch((error) => {
        toast.error(error);
      });
  }

  return (
    <div>
      <Header />

      <div className="content">
        <Title name={id ? "Editando chamado" : "Novo chamado"}>
          <FiPlusCircle size={25} />
        </Title>

        <div className="conatiner">
          <form className="formProfile" onSubmit={handleRegister}>
            <label>Clientes</label>
            {loadCustomer ? (
              <input type="text" disabled={true} value="Carregando..." />
            ) : (
              <select value={customerSelected} onChange={handleChangeCustomer}>
                {customers.map((item, index) => {
                  return (
                    <option key={index} value={index}>
                      {item.nomeFantasia}
                    </option>
                  );
                })}
              </select>
            )}

            <label>Assunto</label>
            <select value={assunto} onChange={handleChangeSelect}>
              <option value="Suporte">Suporte</option>
              <option value="Visita Tecnica">Visita Tecnica</option>
              <option value="Financeiro">Financeiro</option>
            </select>

  
            <label>Complemento</label>
            <textarea
              type="text"
              placeholder="Descreva seu problema (opcional)."
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
            {id ? (
              <button type="submit">Atualizar</button>
            ) : (
              <button type="submit">Registrar</button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default New;
