import { db } from "../../services/firebaseConnections";
import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header";
import Title from "../../components/Title";
import {
  FiPlus,
  FiMessageSquare,
  FiSearch,
  FiEdit2,
  FiX,
} from "react-icons/fi";
import "./dashboard.css";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  orderBy,
  limit,
  startAfter,
  query,
  deleteDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";

const listRef = collection(db, "chamados");

const Dashboard = () => {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpyt, setIsEmpyt] = useState(false);
  const [lastDocs, setLastDocs] = useState();
  const [loadingMore, setLoadingMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState();
  const {user} = useContext(AuthContext);

  useEffect(() => {
    async function loadChamados() {
  
      const q = query(listRef, orderBy("created", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
  
      const lista = [];
      querySnapshot.forEach((doc) => {
        const chamado = {
          id: doc.id,
          assunto: doc.data().assunto,
          cliente: doc.data().cliente,
          clienteId: doc.data().clienteId,
          created: doc.data().created,
          createdFormat: format(doc.data().created.toDate(), "dd/MM/yyyy"),
          status: doc.data().status,
          complemento: doc.data().complemento,
          userId: doc.data().userId
        };

        if (chamado.userId === user.uid) {
          lista.push(chamado);
        }
      });
  
      if (lista.length === 0) {
        setIsEmpyt(true);
      } else {
        setChamados(lista);
      }
  
      setLoading(false);
    }

    loadChamados();
  }, []);
  

  async function updateState(querySnapshot) {
    const isCollectionEmpy = querySnapshot.size === 0;

    if (!isCollectionEmpy) {
      let lista = [];

      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          assunto: doc.data().assunto,
          cliente: doc.data().cliente,
          clienteId: doc.data().clienteId,
          created: doc.data().created,
          createdFormat: format(doc.data().created.toDate(), "dd/MM/yyyy"),
          status: doc.data().status,
          complemento: doc.data().complemento,
          userId: doc.data().userId
        });
      });
      const lastDocs = querySnapshot.docs[querySnapshot.docs.length - 1];
      setChamados((chamados) => [...chamados, ...lista]);
      setLastDocs(lastDocs);
    } else {
      setIsEmpyt(true);
    }
    setLoadingMore(false);
  }

  async function handleMore() {
    setLoadingMore(true);
    const q = query(
      listRef,
      orderBy("created", "desc"),
      startAfter(lastDocs),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    await updateState(querySnapshot);
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="content">
          <Title name="Tickets">
            <FiMessageSquare size={25} />
          </Title>

          <div className="container dashboard">
            <span>Buscando chamados...</span>
          </div>
        </div>
      </div>
    );
  }

  async function handleDelete(chamadoId) {
    if (window.confirm("Tem certeza que deseja excluir este chamado?")) {
      try {
        await deleteDoc(doc(db, "chamados", chamadoId));
        setChamados(chamados.filter((chamado) => chamado.id !== chamadoId));
        toast.success("Chamado excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir o chamado:", error);
      }
    }
  }

  function toggleModal(item) {
    setShowModal(!showModal);
    setDetail(item);
  }

  return (
    <div>
      <Header />

      <div className="content">
        <Title name="Tickets">
          <FiMessageSquare size={25} />
        </Title>

        <>
          {chamados.length === 0 ? (
            <div className="container dashboard">
              <span>Nenhum chamado encontrado...</span>
              <Link to="/new" className="new">
                <FiPlus size={25} color="#fff" />
                Novo chamado
              </Link>
            </div>
          ) : (
            <>
              <Link to="/new" className="new">
                <FiPlus size={25} color="#fff" />
                Novo chamado
              </Link>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Cliente</th>
                    <th scope="col">Assunto</th>
                    <th scope="col">Cadastrado</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {chamados.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td data-label="Cliente">{item.cliente}</td>
                        <td data-label="Assunto">{item.assunto}</td>
                        <td data-label="Cadastrado">{item.createdFormat}</td>
                        <td data-label="#">

                        <td data-label="Status">
                          
                        </td>
                        
                        
                          <button
                            onClick={() => toggleModal(item)}
                            className="action"
                            style={{ background: "#3583f6" }}
                            title="Visualizar Chamado"
                          >
                            <FiSearch color="#fff" size={25} />
                          </button>
                          <Link
                            to={`/new/${item.id}`}
                            className="action"
                            style={{ background: "#f6a935" }}
                            title="Editar Chamado"
                          >
                            <FiEdit2 color="#fff" size={25} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="action"
                            style={{ background: "rgba(247, 3, 3, 0.856)" }}
                            title="Excluir Chamado"
                          >
                            <FiX size={25} color="#fff" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {loadingMore && <h3>Buscando chamados...</h3>}
              {!loadingMore && !isEmpyt && (
                <button className="btnMore" onClick={handleMore}>
                  Buscar mais
                </button>
              )}
            </>
          )}
        </>
      </div>
      {showModal && (
        <Modal conteudo={detail} close={() => setShowModal(!showModal)} />
      )}
    </div>
  );
};

export default Dashboard;
