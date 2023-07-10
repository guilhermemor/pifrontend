import { useState, createContext, useEffect } from "react";
import { auth, db } from "../services/firebaseConnections";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const storageUser = localStorage.getItem("@ticketsPRO");

      if (storageUser) {
        setUser(JSON.parse(storageUser));
        setLoading(false);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function signIn(email, password) {
    setLoadingAuth(true);
  
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
  
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
  
      const data = {
        uid: user.uid,
        nome: docSnap.data().nome,
        email: user.email,
        avatarUrl: docSnap.data().avatarUrl,
      };
  
      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success("Bem-vindo(a) de volta!");
      navigate("/dashboard");
    } catch (error) {
      setLoadingAuth(false);
      const errorCode = error.code;
      let errorMessage = "";
  
      if (errorCode === "auth/wrong-password") {
        errorMessage = "A senha está incorreta.";
      } else if (errorCode === "auth/user-not-found") {
        errorMessage = "O e-mail informado não está cadastrado.";
      } else {
        errorMessage = error.message;
      }
  
      toast.error(errorMessage);
    }
  }
  

  async function signUp(email, password, name) {
  setLoadingAuth(true);

  try {
    await createUserWithEmailAndPassword(auth, email, password)
      .then(async (value) => {
        let uid = value.user.uid;

        await setDoc(doc(db, "users", uid), {
          nome: name,
          avatarUrl: null,
        }).then(() => {
          let data = {
            uid: uid,
            nome: name,
            email: value.user.email,
            avatarUrl: null,
          };
          setUser(data);
          storageUser(data);
          setLoadingAuth(false);
          toast.success("Seja bem-vindo: " + name);
          navigate("/dashboard");
        });
      })
  } catch (error) {
    console.log("Error" + error);
    setLoadingAuth(false);
    toast.error("Ocorreu um erro ao realizar o cadastro. Por favor, tente novamente mais tarde.");
  }
}

  function storageUser(data) {
    localStorage.setItem("@ticketsPRO", JSON.stringify(data));
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem("@ticketsPRO");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        signIn,
        signUp,
        logout,
        loadingAuth,
        loading,
        storageUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
