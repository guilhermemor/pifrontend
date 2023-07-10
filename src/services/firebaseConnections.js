import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbylkRC6-F8XuJqfGfSu3gGjIECdSgkZ8",
  authDomain: "codeschoolfront.firebaseapp.com",
  projectId: "codeschoolfront",
  storageBucket: "codeschoolfront.appspot.com",
  messagingSenderId: "954507965372",
  appId: "1:954507965372:web:a5079147f6518dae5ef1b9"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };
