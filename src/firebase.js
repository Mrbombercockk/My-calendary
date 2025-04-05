// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase (reemplaza con tus credenciales de Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyDzubuhPsyYbGRcDuBnOUeo8rub8TMjG2k",
    authDomain: "planify-4ea98.firebaseapp.com",
    projectId: "planify-4ea98",
    storageBucket: "planify-4ea98.firebasestorage.app",
    messagingSenderId: "210057599638",
    appId: "1:210057599638:web:31fefeeb83e9ec9d6b80b7",
    measurementId: "G-S8PMHBTYL1"
  };

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta Firestore
export const db = getFirestore(app);